import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Info, Plus, Image as ImageIcon, Smile, Send, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import { getAccessToken } from '../../../config/axios';
import { useGetMessages, useSendMessage, useDeleteMessage } from '../hooks/useGroups';

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

  const chatEndRef = useRef(null);
  const connectionRef = useRef(null);

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

    // Build the hub URL — backend is on the same host minus /api
    const apiUrl = import.meta.env.VITE_API_URL; // e.g. https://localhost:7020/api
    const hubUrl = apiUrl.replace(/\/api\/?$/, '') + '/hub/chat';

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => getAccessToken(),
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
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
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isSending) return;

    const messageText = inputValue.trim();
    setInputValue('');

    try {
      await sendMessageAPI(teamId, { content: messageText });
      // The SignalR ReceiveTeamMessage event will add the message to the list
    } catch (err) {
      // If WebSocket didn't catch it, add optimistically from the API response
      console.error('Failed to send message:', err);
      setInputValue(messageText); // Restore the input on failure
    }
  }, [inputValue, isSending, teamId, sendMessageAPI]);

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
        <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          <Info className="h-5 w-5" />
        </button>
      </div>

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
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                        {getInitials(msg.senderName)}
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
                        {msg.content}
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
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-200 dark:hover:bg-white/10">
            <ImageIcon className="h-5 w-5" />
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
                handleSendMessage();
              }
            }}
            disabled={isSending}
          />

          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-200 dark:hover:bg-white/10">
            <Smile className="h-5 w-5" />
          </button>
          <button
            className="bg-[#047857] hover:bg-[#065f46] text-white p-2 rounded-lg transition-colors flex items-center justify-center ml-1 shadow-sm disabled:opacity-50"
            onClick={handleSendMessage}
            disabled={isSending || !inputValue.trim()}
          >
            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
