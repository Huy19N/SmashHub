import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Info, Plus, Image as ImageIcon, Smile, Send, Loader2, AlertCircle, Trash2, X, Phone, PhoneIncoming } from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import { getAccessToken } from '../../../config/axios';
import { useGetMessages, useSendMessage, useDeleteMessage } from '../hooks/useGroups';
import { uploadFileAPI, getFileUrl } from '../api/files.api.js';
import toast from 'react-hot-toast';
import VideoCallOverlay from './VideoCallOverlay';
import { getAllUserByIdAPI } from '../../profiles/api/profiles.api';
import { getAvatarUrl } from '../../../utils/avatarUtils';

/**
 * TeamChat – Real-time group chat powered by SignalR + REST API.
 *
 * Props:
 *   teamId      – GUID of the team (required)
 *   teamName    – display name shown in the header
 *   memberCount – number shown next to team name
 */
export default function TeamChat({ teamId, teamName = "Team", memberCount = 0 }) {
  // ─── Current user ─────────────────────────────────────────
  const currentUserId = localStorage.getItem('userId');

  // ─── API hooks ─────────────────────────────────────────────
  const { messages: apiMessages, isLoading, error: fetchError, refetch } = useGetMessages(teamId);
  const { sendMessage: sendMessageAPI, isLoading: isSending } = useSendMessage();
  const { deleteMessage: deleteMessageAPI } = useDeleteMessage();

  // ─── Local state ───────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected | connecting | connected
  const [uploadingImage, setUploadingImage] = useState(false);
  const [avatars, setAvatars] = useState({});
  const fetchedAvatarsRef = useRef(new Set());
  
  // Video Call State
  const [videoCallRoom, setVideoCallRoom] = useState(null); // { roomId, isInitiator }
  const [incomingCall, setIncomingCall] = useState(null); // { roomId, callerId }

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const connectionRef = useRef(null);

  // ─── Fetch sender avatars ────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const senderIds = [...new Set(messages.map(m => m.senderId).filter(id => id && String(id) !== String(currentUserId)))];
    
    senderIds.forEach(id => {
      if (!fetchedAvatarsRef.current.has(id)) {
        fetchedAvatarsRef.current.add(id);
        getAllUserByIdAPI(id).then(res => {
          const fileId = res?.data?.avatarFileId || res?.avatarFileId;
          if (fileId && isMounted) {
            setAvatars(prev => ({ ...prev, [id]: getAvatarUrl(fileId) }));
          }
        }).catch(() => {});
      }
    });

    return () => { isMounted = false; };
  }, [messages, currentUserId]);

  // ─── Sync API messages into local state ────────────────────
  useEffect(() => {
    if (Array.isArray(apiMessages)) {
      setMessages(apiMessages);
    }
  }, [apiMessages]);

  // ─── Auto-scroll to bottom on new messages ─────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── SignalR connection ────────────────────────────────────
  useEffect(() => {
    // Wait until initial API messages are loaded so we know the token (if expired) 
    // has been refreshed by the axios interceptor.
    if (!teamId || isLoading || fetchError) return;

    const token = getAccessToken();
    if (!token) return;

    let cancelled = false;
    let startPromise = null;

    // Build the hub URL — prioritize the specific env variable, otherwise fallback to API URL
    const hubUrl = import.meta.env.VITE_CHAT_HUB_URL || (import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') + '/hub/chat');

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => getAccessToken(),
        // Removed skipNegotiation and transport to allow SignalR to fallback to LongPolling/SSE if WebSockets fail through proxy
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning) // Will log warnings/errors internally
      .build();

    connectionRef.current = connection;

    // ── Event handlers ──────────────────────────────────────
    connection.on('ReceiveTeamMessage', (message) => {
      setMessages((prev) => {
        // Prevent duplicate messages
        if (prev.some((m) => m.messageId === message.messageId)) return prev;
        return [...prev, message];
      });
    });

    connection.on('MessageDeleted', (messageId) => {
      setMessages((prev) => prev.filter((m) => m.messageId !== messageId));
    });

    connection.on('CallStarted', (roomId, callerId, connId) => {
      // Show incoming call if we didn't start it
      if (String(callerId) !== String(currentUserId)) {
        setIncomingCall({ roomId, callerId });
      }
    });

    // Register handlers for backend events to suppress warnings
    connection.on('JoinedTeam', () => { });
    connection.on('LeftTeam', () => { });

    connection.onreconnecting(() => setConnectionStatus('connecting'));
    connection.onreconnected(() => {
      setConnectionStatus('connected');
      // Re-join the team group after reconnect
      connection.invoke('JoinTeamChat', teamId).catch(() => { });
    });
    connection.onclose(() => {
      if (!cancelled) setConnectionStatus('disconnected');
    });

    // ── Start connection ────────────────────────────────────
    const startConnection = async () => {
      setConnectionStatus('connecting');
      try {
        startPromise = connection.start();
        await startPromise;
        
        if (cancelled) return; // Cleanup will handle stopping

        setConnectionStatus('connected');
        await connection.invoke('JoinTeamChat', teamId);
      } catch (err) {
        if (!cancelled) {
          console.error('SignalR connection failed:', err);
          setConnectionStatus('disconnected');
        }
      }
    };

    startConnection();

    // ── Cleanup ─────────────────────────────────────────────
    return () => {
      cancelled = true;
      
      const stopConnection = async () => {
        // Wait for start to finish before stopping to avoid AbortError
        if (startPromise) {
          try { await startPromise; } catch (e) { /* ignore start errors during cleanup */ }
        }
        
        if (connection.state === signalR.HubConnectionState.Connected) {
          await connection.invoke('LeaveTeamChat', teamId).catch(() => { });
        }
        await connection.stop().catch(() => {});
      };
      
      stopConnection();
      connectionRef.current = null;
    };
  }, [teamId, isLoading, fetchError]);

  // ─── Send handler ─────────────────────────────────────────
  const handleSendMessage = useCallback(async (text, mediaFileId = null, messageType = 0) => {
    if (!text.trim() && !mediaFileId) return;
    if (isSending) return;

    setInputValue('');

    try {
      await sendMessageAPI(teamId, { 
        content: text.trim() || (messageType === 1 ? '[Hình ảnh]' : ''),
        messageType,
        mediaFileId
      });
      // The SignalR ReceiveTeamMessage event will add the message to the list
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Gửi tin nhắn thất bại.');
      if (!mediaFileId) setInputValue(text); // Restore the input on failure
    }
  }, [isSending, teamId, sendMessageAPI]);

  // ─── Image Upload Handler ──────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ hỗ trợ tải lên hình ảnh.');
      return;
    }

    setUploadingImage(true);
    try {
      const response = await uploadFileAPI(file, 'TeamChat');
      const data = response?.data ?? response;
      const fileId = data?.fileId || data?.FileId;
      if (fileId) {
        await handleSendMessage('', fileId, 1); // 1 = Image
      } else {
        throw new Error('Không nhận được ID file từ server.');
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
      toast.error('Tải ảnh lên thất bại.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ─── Delete handler ────────────────────────────────────────
  const handleDeleteMessage = useCallback(async (messageId) => {
    try {
      await deleteMessageAPI(teamId, messageId);
      // The SignalR MessageDeleted event will remove the message from the list
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  }, [teamId, deleteMessageAPI]);

  // ─── Helpers ───────────────────────────────────────────────
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hôm nay';
    if (date.toDateString() === yesterday.toDateString()) return 'Hôm qua';
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const dateLabel = formatDateLabel(msg.sentAt);
    if (!groups[dateLabel]) groups[dateLabel] = [];
    groups[dateLabel].push(msg);
    return groups;
  }, {});

  const isMine = (msg) => {
    return currentUserId && String(msg.senderId) === String(currentUserId);
  };

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="flex flex-col bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-border-dark overflow-hidden h-[600px] shadow-sm font-sans max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#047857] flex items-center justify-center text-white font-bold text-sm">
            {getInitials(teamName)}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white font-display">Trò chuyện Nhóm: {teamName}</h3>
            <div className="flex items-center gap-2">
              <p className="text-xs text-[#047857] font-medium">{memberCount} thành viên</p>
              {connectionStatus === 'connected' && (
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" title="Đang kết nối" />
              )}
              {connectionStatus === 'connecting' && (
                <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" title="Đang kết nối lại..." />
              )}
              {connectionStatus === 'disconnected' && (
                <span className="h-2 w-2 rounded-full bg-red-400" title="Mất kết nối" />
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <button 
            onClick={() => setVideoCallRoom({ roomId: `team_${teamId}`, isInitiator: true })}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
            title="Gọi nhóm"
          >
            <Phone className="h-5 w-5" />
          </button>
          <button className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
            <Info className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Incoming Call Alert */}
      {incomingCall && !videoCallRoom && (
        <div className="bg-emerald-500 text-white p-3 flex items-center justify-between px-6 animate-in slide-in-from-top">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <span className="font-bold text-sm">Cuộc gọi nhóm đang diễn ra...</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIncomingCall(null)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              Bỏ qua
            </button>
            <button 
              onClick={() => {
                setVideoCallRoom({ roomId: incomingCall.roomId, isInitiator: false });
                setIncomingCall(null);
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white text-emerald-600 hover:bg-gray-100 transition-colors flex items-center gap-1"
            >
              <PhoneIncoming className="w-4 h-4" />
              Tham gia
            </button>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-white dark:bg-[#0b0f19]">
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải tin nhắn...</p>
          </div>
        )}

        {/* Error state */}
        {fetchError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <p className="text-sm text-red-400">{fetchError}</p>
            <button onClick={refetch} className="text-xs text-primary hover:underline">Thử lại</button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !fetchError && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        )}

        {/* Messages grouped by date */}
        {!isLoading && Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
          <React.Fragment key={dateLabel}>
            {/* Date Divider */}
            <div className="flex justify-center">
              <span className="bg-[#F4F6FB] dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs font-semibold px-4 py-1.5 rounded-full">
                {dateLabel}
              </span>
            </div>

            {msgs.map((msg) => (
              <div key={msg.messageId} className={`flex ${isMine(msg) ? 'justify-end' : 'justify-start'} group`}>
                <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isMine(msg) ? 'flex-row-reverse' : 'flex-row'}`}>

                  {/* Avatar */}
                  {!isMine(msg) && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                        {avatars[msg.senderId] ? (
                          <img src={avatars[msg.senderId]} alt={msg.senderName} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(msg.senderName)
                        )}
                      </div>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className={`flex flex-col ${isMine(msg) ? 'items-end' : 'items-start'}`}>
                    {!isMine(msg) && (
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 ml-1">
                        {msg.senderName || 'Thành viên'}
                      </span>
                    )}

                    <div className="relative">
                      <div className={`px-4 py-3 text-sm leading-relaxed ${isMine(msg)
                        ? 'bg-[#047857] text-white rounded-2xl rounded-tr-sm shadow-sm'
                        : 'bg-[#EEF2FF] dark:bg-[#1e2532] text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-sm shadow-sm'
                        }`}>
                        {msg.messageType === 1 && msg.mediaUrl ? (
                          <div className="mb-2">
                            <img src={msg.mediaUrl} alt="Hình ảnh đính kèm" className="max-w-[200px] sm:max-w-[250px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(msg.mediaUrl, '_blank')} />
                          </div>
                        ) : msg.messageType === 1 && msg.mediaFileId ? (
                           <div className="mb-2">
                            <img src={getFileUrl(msg.mediaFileId)} alt="Hình ảnh đính kèm" className="max-w-[200px] sm:max-w-[250px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(getFileUrl(msg.mediaFileId), '_blank')} />
                          </div>
                        ) : null}
                        
                        {msg.content !== '[Hình ảnh]' && msg.content}
                        <div className={`text-[10px] mt-1.5 text-right font-medium ${isMine(msg) ? 'text-green-200' : 'text-gray-400 dark:text-gray-500'}`}>
                          {formatTime(msg.sentAt)}
                        </div>
                      </div>

                      {/* Delete button (only for own messages) */}
                      {isMine(msg) && (
                        <button
                          onClick={() => handleDeleteMessage(msg.messageId)}
                          className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-400 hover:text-red-300"
                          title="Xóa tin nhắn"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </React.Fragment>
        ))}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-card-dark border-t border-gray-200 dark:border-border-dark">
        <div className="flex items-center gap-2 bg-[#F4F6FB] dark:bg-[#1a2130] p-2 rounded-xl border border-transparent focus-within:border-gray-300 dark:focus-within:border-gray-600 transition-colors">
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-200 dark:hover:bg-white/10">
            <Plus className="h-5 w-5" />
          </button>
          
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className={`p-2 transition-colors rounded-full ${uploadingImage ? 'text-emerald-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/10'}`}
          >
            {uploadingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
          </button>

          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 px-2"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(inputValue);
              }
            }}
            disabled={isSending || uploadingImage}
          />

          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-200 dark:hover:bg-white/10">
            <Smile className="h-5 w-5" />
          </button>
          <button
            className="bg-[#047857] hover:bg-[#065f46] text-white p-2 rounded-lg transition-colors flex items-center justify-center ml-1 shadow-sm disabled:opacity-50"
            onClick={() => handleSendMessage(inputValue)}
            disabled={isSending || (!inputValue.trim() && !uploadingImage)}
          >
            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Video Call Overlay */}
      {videoCallRoom && (
        <VideoCallOverlay
          teamId={teamId}
          roomId={videoCallRoom.roomId}
          isInitiator={videoCallRoom.isInitiator}
          onClose={() => setVideoCallRoom(null)}
        />
      )}
    </div>
  );
}
