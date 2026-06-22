import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Info, Plus, Image as ImageIcon, Smile, Send, Loader2, AlertCircle, Trash2, X, Phone, PhoneIncoming, Video } from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import { getAccessToken } from '../../../config/axios';
import { useGetMessages, useSendMessage, useDeleteMessage } from '../hooks/useGroups';
import { uploadFileAPI, getFileUrl } from '../api/files.api.js';
import toast from 'react-hot-toast';
import VideoCallOverlay from './VideoCallOverlay';
import { getAllUserByIdAPI, getAllUserAPI } from '../../profiles/api/profiles.api';
import MediaImage from '../../../components/ui/MediaImage';
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
  const [userProfile, setUserProfile] = useState(null);

  // Video Call State
  const [videoCallRoom, setVideoCallRoom] = useState(null); // { roomId, isInitiator }
  const [activeCall, setActiveCall] = useState(null);
  const activeCallRef = useRef(null);

  const setActiveCallState = useCallback((call) => {
    activeCallRef.current = call;
    setActiveCall(call);
  }, []);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const connectionRef = useRef(null);

  // ─── Auto-close participants if initiator leaves ────────────
  useEffect(() => {
    if (videoCallRoom && !videoCallRoom.isInitiator) {
      if (!activeCall || activeCall.roomId !== videoCallRoom.roomId) {
        toast.error("Trưởng phòng đã đóng cuộc gọi.");
        setVideoCallRoom(null);
      }
    }
  }, [activeCall, videoCallRoom]);

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
            setAvatars(prev => ({ ...prev, [id]: fileId }));
          }
        }).catch(() => { });
      }
    });

    return () => { isMounted = false; };
  }, [messages, currentUserId]);

  // ─── Fetch current user profile for subscription checks ────────
  useEffect(() => {
    getAllUserAPI()
      .then(res => {
        setUserProfile(res?.data ?? res);
      })
      .catch(err => {
        console.error('Error fetching user profile for chat:', err);
      });
  }, []);

  // ─── Sync API messages into local state ────────────────────
  useEffect(() => {
    if (Array.isArray(apiMessages)) {
      const sortedMessages = [...apiMessages].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
      setMessages(sortedMessages);
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
        transport: signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning) // Will log warnings/errors internally
      .build();

    connectionRef.current = connection;

    // ── Event handlers ──────────────────────────────────────
    // Suppress warnings from presence hub events
    connection.on('useronline', () => {});
    connection.on('UserOnline', () => {});
    connection.on('useroffline', () => {});
    connection.on('UserOffline', () => {});

    connection.on('ReceiveTeamMessage', (message) => {
      setMessages((prev) => {
        // Prevent duplicate messages
        if (prev.some((m) => m.messageId === message.messageId)) return prev;
        const newMessages = [...prev, message];
        return newMessages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
      });
    });

    connection.on('MessageDeleted', (messageId) => {
      setMessages((prev) => prev.filter((m) => m.messageId !== messageId));
    });

    connection.on('CallStarted', (roomId, callerId, connId) => {
      // Show incoming call as a system message in the chat stream
      if (String(callerId) !== String(currentUserId)) {
        setActiveCallState({ roomId, callerId, connId });

        setMessages(prev => {
          if (prev.some(m => m.messageId === `call_${roomId}`)) return prev;

          const callerMsg = prev.find(m => String(m.senderId) === String(callerId));
          const callerName = callerMsg ? callerMsg.senderName : "Đồng đội";

          const callMsg = {
            messageId: `call_${roomId}`,
            senderId: callerId,
            senderName: callerName,
            content: "Đã bắt đầu phòng gọi video nhóm.",
            messageType: 99,
            roomId: roomId,
            sentAt: new Date().toISOString(),
            isEnded: false
          };
          return [...prev, callMsg].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
        });
      }
    });

    // Register handlers for backend events to suppress warnings
    connection.on('JoinedTeam', () => { });
    connection.on('LeftTeam', () => { });
    connection.on('UserLeftCall', (connId) => {
      if (activeCallRef.current && activeCallRef.current.connId === connId) {
        const endedRoomId = activeCallRef.current.roomId;
        setActiveCallState(null);
        setMessages(prev => prev.map(m => m.messageId === `call_${endedRoomId}` ? { ...m, isEnded: true } : m));
      }
    });

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
        await connection.stop().catch(() => { });
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

    // Check subscription tier restrictions
    const tier = userProfile?.subscriptionTier || 'Free';
    if (tier === 'Free') {
      toast.error('Gói Free không hỗ trợ gửi file phương tiện. Vui lòng nâng cấp gói để tiếp tục.');
      return;
    }

    if (tier === 'Basic') {
      const todayMediaCount = messages.filter(m => 
        String(m.senderId) === String(currentUserId) && 
        (m.messageType === 1 || m.messageType === 2 || m.messageType === 3) &&
        new Date(m.sentAt).toDateString() === new Date().toDateString()
      ).length;

      if (todayMediaCount >= 5) {
        toast.error('Gói Basic chỉ được gửi tối đa 5 hình ảnh/ngày. Hãy nâng cấp gói PRO để không giới hạn.');
        return;
      }
    }

    setUploadingImage(true);
    try {
      const response = await uploadFileAPI(file, 'ChatMedia');
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
    <div className="flex flex-col bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-border-dark overflow-hidden h-[calc(100vh-180px)] sm:h-[calc(100vh-140px)] shadow-sm font-sans w-full max-w-full transition-all duration-500 ease-in-out">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-250 dark:border-border-dark/60 bg-white dark:bg-card-dark">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-primary dark:to-emerald-500 text-white dark:text-[#052e14] flex items-center justify-center font-bold text-sm shadow-md">
            {getInitials(teamName)}
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white font-display">Trò chuyện Nhóm: {teamName}</h3>
            <div className="flex items-center gap-2">
              <p className="text-xs text-emerald-600 dark:text-primary font-bold uppercase tracking-wider font-label">{memberCount} thành viên</p>
              {connectionStatus === 'connected' && (
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Đang kết nối" />
              )}
              {connectionStatus === 'connecting' && (
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" title="Đang kết nối lại..." />
              )}
              {connectionStatus === 'disconnected' && (
                <span className="h-2 w-2 rounded-full bg-red-500" title="Mất kết nối" />
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
          <button
            onClick={() => {
              if (connectionStatus !== 'connected') {
                toast.error("Không thể kết nối đến máy chủ trò chuyện. Vui lòng thử lại sau.");
                return;
              }
              if (activeCall) {
                toast.error("Phòng đang mở bạn không thể mở phòng mới!");
                return;
              }
              const rId = `team_${teamId}_${Date.now()}`;
              const myConnId = connectionRef.current?.connectionId;
              setActiveCallState({ roomId: rId, callerId: currentUserId, connId: myConnId });
              setVideoCallRoom({ roomId: rId, isInitiator: true });
              setMessages(prev => [...prev, {
                messageId: `call_${rId}`,
                senderId: currentUserId,
                senderName: "Bạn",
                content: "Đã bắt đầu phòng gọi video nhóm.",
                messageType: 99,
                roomId: rId,
                sentAt: new Date().toISOString(),
                isEnded: false
              }]);
            }}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${activeCall || connectionStatus !== 'connected' ? 'text-gray-300 dark:text-gray-600' : 'hover:text-emerald-600 dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5'}`}
            title="Gọi nhóm"
            disabled={connectionStatus !== 'connected'}
          >
            <Phone className="h-5 w-5" />
          </button>
          <button className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer">
            <Info className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/50 dark:bg-[#0b0f17]">
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-label">Đang tải tin nhắn...</p>
          </div>
        )}

        {/* Error state */}
        {fetchError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <p className="text-sm text-red-400 font-label">{fetchError}</p>
            <button onClick={refetch} className="text-xs text-primary hover:underline cursor-pointer font-label">Thử lại</button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !fetchError && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-label">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        )}

        {/* Messages grouped by date */}
        {!isLoading && Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
          <React.Fragment key={dateLabel}>
            {/* Date Divider */}
            <div className="flex justify-center">
              <span className="bg-gray-200/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-[10px] font-bold px-4 py-1.5 rounded-xl uppercase tracking-wider font-label shadow-sm">
                {dateLabel}
              </span>
            </div>

            {msgs.map((msg) => (
              <div key={msg.messageId} className={`flex ${isMine(msg) ? 'justify-end' : 'justify-start'} group/msg`}>
                <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isMine(msg) ? 'flex-row-reverse' : 'flex-row'}`}>

                  {/* Avatar */}
                  {!isMine(msg) && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-primary dark:to-emerald-500 flex items-center justify-center text-white dark:text-[#052e14] font-bold text-xs overflow-hidden shadow-sm">
                        {avatars[msg.senderId] ? (
                          <MediaImage fileId={avatars[msg.senderId]} alt={msg.senderName} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(msg.senderName)
                        )}
                      </div>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className={`flex flex-col ${isMine(msg) ? 'items-end' : 'items-start'}`}>
                    {!isMine(msg) && (
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1 font-label">
                        {msg.senderName || 'Thành viên'}
                      </span>
                    )}

                    <div className="relative">
                      <div className={`px-4 py-3 text-sm leading-relaxed shadow-sm transition-all duration-300 hover:shadow-md ${isMine(msg)
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-primary dark:to-emerald-500 text-white dark:text-[#052e14] rounded-2xl rounded-tr-none shadow-emerald-500/10'
                        : 'bg-white dark:bg-[#161b22] text-gray-800 dark:text-gray-200 border border-gray-200/50 dark:border-white/5 rounded-2xl rounded-tl-none shadow-gray-200/10'
                        }`}>
                        {msg.messageType === 1 && msg.mediaUrl ? (
                          <div className="mb-2">
                            <img src={msg.mediaUrl} alt="Hình ảnh đính kèm" className="max-w-[200px] sm:max-w-[250px] rounded-xl cursor-pointer hover:opacity-90 transition-opacity shadow-sm" onClick={() => window.open(msg.mediaUrl, '_blank')} />
                          </div>
                        ) : msg.messageType === 1 && msg.mediaFileId ? (
                          <div className="mb-2">
                            <MediaImage fileId={msg.mediaFileId} alt="Hình ảnh đính kèm" className="max-w-[200px] sm:max-w-[250px] rounded-xl cursor-pointer hover:opacity-90 transition-opacity shadow-sm" onClick={(url) => window.open(url, '_blank')} />
                          </div>
                        ) : null}

                        {msg.messageType === 99 ? (
                          <div className="flex flex-col gap-2 min-w-[180px] sm:min-w-[200px]">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="h-8 w-8 rounded-full bg-white/20 dark:bg-black/20 flex items-center justify-center">
                                <Video className="w-4 h-4" />
                              </div>
                              <span className="font-bold font-label text-sm">{msg.isEnded ? "Đã đóng phòng" : msg.content}</span>
                            </div>
                            {!isMine(msg) && (
                              <button
                                onClick={() => {
                                  if (msg.isEnded) return;
                                  setVideoCallRoom({ roomId: msg.roomId, isInitiator: false });
                                }}
                                disabled={msg.isEnded}
                                className={`w-full py-2 px-4 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 font-label ${msg.isEnded
                                    ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                                    : 'bg-white text-emerald-600 dark:bg-[#052e14] dark:text-primary hover:scale-[1.02] active:scale-95 cursor-pointer'
                                  }`}
                              >
                                {msg.isEnded ? "Cuộc gọi đã kết thúc" : <><PhoneIncoming className="w-4 h-4" /> Tham gia ngay</>}
                              </button>
                            )}
                          </div>
                        ) : (
                          msg.content !== '[Hình ảnh]' && msg.content
                        )}
                        <div className={`text-[9px] mt-1.5 text-right font-bold uppercase tracking-wide font-label ${isMine(msg) ? 'text-emerald-100/80 dark:text-emerald-950/80' : 'text-gray-400 dark:text-gray-500'}`}>
                          {formatTime(msg.sentAt)}
                        </div>
                      </div>

                      {/* Delete button (only for own messages) */}
                      {isMine(msg) && msg.messageType !== 99 && (
                        <button
                          onClick={() => handleDeleteMessage(msg.messageId)}
                          className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover/msg:opacity-100 transition-all duration-200 p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:scale-110 cursor-pointer"
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
      <div className="p-3 md:p-4 bg-white dark:bg-card-dark border-t border-gray-150 dark:border-border-dark/60">
        <div className="flex items-center gap-2 sm:gap-3 bg-[#F4F6FB] dark:bg-white/5 p-1.5 sm:p-2 rounded-2xl border border-transparent focus-within:border-emerald-500/30 dark:focus-within:border-primary/20 focus-within:ring-2 focus-within:ring-emerald-500/10 dark:focus-within:ring-primary/10 transition-all duration-300">
          <button className="hidden sm:flex p-2 text-gray-400 hover:text-emerald-600 dark:text-gray-500 dark:hover:text-primary transition-colors rounded-full hover:bg-gray-200/50 dark:hover:bg-white/5 shrink-0">
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
            className={`p-2 transition-colors rounded-full shrink-0 hover:bg-gray-200/50 dark:hover:bg-white/5 ${uploadingImage ? 'text-emerald-500' : 'text-gray-400 hover:text-emerald-600 dark:text-gray-500 dark:hover:text-primary'}`}
          >
            {uploadingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
          </button>

          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            className="flex-1 min-w-0 bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-2"
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

          <button className="hidden sm:flex p-2 text-gray-400 hover:text-emerald-600 dark:text-gray-500 dark:hover:text-primary transition-colors rounded-full hover:bg-gray-200/50 dark:hover:bg-white/5 shrink-0">
            <Smile className="h-5 w-5" />
          </button>
          <button
            className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-primary dark:to-emerald-500 text-white dark:text-[#052e14] p-2 sm:p-2.5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md shadow-emerald-500/10 dark:shadow-primary/10 disabled:opacity-50 disabled:scale-100 disabled:shadow-none flex items-center justify-center shrink-0 cursor-pointer"
            onClick={() => handleSendMessage(inputValue)}
            disabled={isSending || (!inputValue.trim() && !uploadingImage)}
          >
            {isSending ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Send className="h-4 w-4 sm:h-4.5 sm:w-4.5" />}
          </button>
        </div>
      </div>

      {/* Video Call Overlay */}
      {videoCallRoom && connectionRef.current && (
        <VideoCallOverlay
          teamId={teamId}
          roomId={videoCallRoom.roomId}
          isInitiator={videoCallRoom.isInitiator}
          onClose={() => {
            if (videoCallRoom.isInitiator) {
              setActiveCallState(null);
              setMessages(prev => prev.map(m => m.messageId === `call_${videoCallRoom.roomId}` ? { ...m, isEnded: true } : m));
            }
            setVideoCallRoom(null);
          }}
          connection={connectionRef.current}
        />
      )}
    </div>
  );
}
