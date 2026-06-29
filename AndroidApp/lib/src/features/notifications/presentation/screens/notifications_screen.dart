import 'package:flutter/material.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/network/api_client.dart';
import '../../data/data_sources/notification_remote_data_source.dart';
import '../../data/repositories/notification_repository_impl.dart';
import '../../data/models/notification_model.dart';
import '../../../../shared/widgets/app_card.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  late final NotificationRepositoryImpl _repository;
  List<NotificationModel> _notifications = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    final apiClient = ApiClient();
    _repository = NotificationRepositoryImpl(NotificationRemoteDataSource(apiClient));
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final response = await _repository.getNotifications(page: 1, limit: 50);

    if (mounted) {
      setState(() {
        _isLoading = false;
        if (response.success && response.data != null) {
          _notifications = response.data!;
        } else {
          _errorMessage = response.message;
        }
      });
    }
  }

  Future<void> _markAllAsRead() async {
    final response = await _repository.markAllAsRead();
    if (response.success && mounted) {
      setState(() {
        _notifications = _notifications.map((n) {
          return NotificationModel(
            notificationId: n.notificationId,
            userId: n.userId,
            title: n.title,
            content: n.content,
            notificationType: n.notificationType,
            relatedEntityId: n.relatedEntityId,
            isRead: true,
            createdAt: n.createdAt,
          );
        }).toList();
      });
    }
  }

  Future<void> _markAsRead(int index) async {
    final notification = _notifications[index];
    if (notification.isRead) return;

    final response = await _repository.markAsRead(notification.notificationId);
    if (response.success && mounted) {
      setState(() {
        _notifications[index] = NotificationModel(
          notificationId: notification.notificationId,
          userId: notification.userId,
          title: notification.title,
          content: notification.content,
          notificationType: notification.notificationType,
          relatedEntityId: notification.relatedEntityId,
          isRead: true,
          createdAt: notification.createdAt,
        );
      });
    }
  }

  String _formatTimeAgo(DateTime? date) {
    if (date == null) return '';
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 1) return 'Vừa xong';
    if (diff.inMinutes < 60) return '${diff.inMinutes} phút trước';
    if (diff.inHours < 24) return '${diff.inHours} giờ trước';
    return '${diff.inDays} ngày trước';
  }

  IconData _getIconForType(String type) {
    switch (type.toLowerCase()) {
      case 'system':
        return Icons.info_outline_rounded;
      case 'booking':
        return Icons.event_available_rounded;
      case 'matchmaking':
        return Icons.local_fire_department_rounded;
      case 'team':
        return Icons.group_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBackgroundColor : AppTheme.lightBackgroundColor,
      appBar: AppBar(
        title: const Text('Thông báo'),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all_rounded),
            tooltip: 'Đánh dấu đọc tất cả',
            onPressed: _notifications.any((n) => !n.isRead) ? _markAllAsRead : null,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(child: Text(_errorMessage!, style: const TextStyle(color: Colors.red)))
              : _notifications.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.notifications_off_rounded, size: 64, color: Colors.grey[400]),
                          const SizedBox(height: 16),
                          Text('Bạn chưa có thông báo nào', style: TextStyle(color: Colors.grey[600])),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadNotifications,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _notifications.length,
                        separatorBuilder: (context, index) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final notification = _notifications[index];
                          return InkWell(
                            onTap: () => _markAsRead(index),
                            borderRadius: BorderRadius.circular(16),
                            child: AppCard(
                              padding: const EdgeInsets.all(16),
                              borderRadius: 16,
                              backgroundColor: notification.isRead 
                                  ? (isDark ? AppTheme.darkSurfaceColor : Colors.white)
                                  : (isDark ? Colors.blueGrey.withValues(alpha: 0.2) : Colors.blue.shade50),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(10),
                                    decoration: BoxDecoration(
                                      color: AppTheme.primaryColor.withValues(alpha: 0.1),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(
                                      _getIconForType(notification.notificationType),
                                      color: AppTheme.primaryColor,
                                      size: 24,
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Expanded(
                                              child: Text(
                                                notification.title,
                                                style: TextStyle(
                                                  fontWeight: notification.isRead ? FontWeight.w600 : FontWeight.bold,
                                                  fontSize: 15,
                                                ),
                                              ),
                                            ),
                                            if (!notification.isRead)
                                              Container(
                                                width: 8,
                                                height: 8,
                                                decoration: const BoxDecoration(
                                                  color: Colors.redAccent,
                                                  shape: BoxShape.circle,
                                                ),
                                              ),
                                          ],
                                        ),
                                        const SizedBox(height: 6),
                                        Text(
                                          notification.content,
                                          style: TextStyle(
                                            color: isDark ? Colors.grey[400] : Colors.grey[700],
                                            fontSize: 13,
                                            height: 1.4,
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          _formatTimeAgo(notification.createdAt),
                                          style: TextStyle(
                                            color: Colors.grey[500],
                                            fontSize: 11,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
