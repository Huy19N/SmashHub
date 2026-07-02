import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { presenceService } from '../utils/presenceService';
import { notificationHubService } from '../utils/notificationHubService';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback((type, title, message, data = null) => {
    const newNotif = {
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      type,
      title,
      message,
      data,
      isRead: false,
      timestamp: new Date()
    };

    setNotifications(prev => [newNotif, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id && !n.isRead) {
        setUnreadCount(c => Math.max(0, c - 1));
        return { ...n, isRead: true };
      }
      return n;
    }));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const clearNotification = useCallback((id) => {
    setNotifications(prev => {
      const target = prev.find(n => n.id === id);
      if (target && !target.isRead) {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  useEffect(() => {
    const rawUserId = localStorage.getItem('userId');
    // Remove potential surrounding quotes from localStorage value
    const currentUserId = rawUserId ? rawUserId.replace(/^"|"$/g, '') : null;

    // MemberJoined(Guid teamId, Guid userId, string userName, string teamName)
    const handleMemberJoined = (teamId, userId, userName, teamName) => {
      if (String(userId) !== String(currentUserId)) {
        addNotification(
          'member_joined',
          'Thành viên mới',
          `${userName || 'Ai đó'} vừa tham gia nhóm ${teamName || ''}`,
          { teamId, userId }
        );
      }
    };

    // ReceiveTeamMessage(TeamMessageResponse message)
    const handleReceiveMessage = (message) => {
      if (String(message.senderId) !== String(currentUserId)) {
        // Skip system/call messages if we only want chat
        if (message.messageType === 'Call') return;
        
        addNotification(
          'new_message',
          'Tin nhắn mới',
          `${message.senderName}: ${message.content || 'Đã gửi một tệp đính kèm'}`,
          { teamId: message.teamId, messageId: message.messageId }
        );
      }
    };

    // ScheduleCreated(ScheduleResponse response)
    const handleScheduleCreated = (schedule) => {
      addNotification(
        'schedule_created',
        'Lịch chơi mới',
        `Chủ nhóm vừa tạo lịch chơi mới: ${schedule.title || 'Không có tiêu đề'}. Vui lòng xác nhận tham gia!`,
        { teamId: schedule.hostTeamId, scheduleId: schedule.scheduleId }
      );
    };

    // We only attach event listeners, we let ProtectedRoute handle starting the connection
    presenceService.on('MemberJoined', handleMemberJoined);
    presenceService.on('ReceiveTeamMessage', handleReceiveMessage);
    presenceService.on('ScheduleCreated', handleScheduleCreated);

    const handleReceiveSystemNotification = (notifDto) => {
      setNotifications(prev => [{
        id: notifDto.notificationId || (Date.now().toString() + Math.random().toString(36).substring(7)),
        type: notifDto.notificationType || 'system',
        title: notifDto.title,
        message: notifDto.content,
        data: { relatedId: notifDto.relatedEntityId },
        isRead: notifDto.isRead,
        timestamp: new Date(notifDto.createdAt || Date.now())
      }, ...prev]);
      if (!notifDto.isRead) {
        setUnreadCount(prev => prev + 1);
      }
    };

    notificationHubService.on('ReceiveNotification', handleReceiveSystemNotification);
    notificationHubService.startConnection();

    return () => {
      presenceService.off('MemberJoined', handleMemberJoined);
      presenceService.off('ReceiveTeamMessage', handleReceiveMessage);
      presenceService.off('ScheduleCreated', handleScheduleCreated);
      notificationHubService.off('ReceiveNotification', handleReceiveSystemNotification);
    };
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
