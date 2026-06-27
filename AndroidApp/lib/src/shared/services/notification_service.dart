import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

/// Service Singleton quản lý Local Notifications trên cả Android và iOS.
/// Sử dụng package `flutter_local_notifications` để hiển thị thông báo
/// ngay trên thiết bị mà không cần dịch vụ push bên ngoài (APNs/FCM).
class NotificationService {
  NotificationService._();
  static final NotificationService instance = NotificationService._();

  final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();

  bool _initialized = false;

  /// Khởi tạo plugin notification cho cả Android và iOS.
  /// Nên gọi một lần duy nhất khi app khởi động (trong `main()` hoặc `initState` của root widget).
  Future<void> initialize() async {
    if (_initialized) return;

    // Android: Cấu hình icon notification (sử dụng icon mặc định của app)
    const androidSettings = AndroidInitializationSettings('@mipmap/launcher_icon');

    // iOS/macOS: Cấu hình quyền
    const darwinSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: darwinSettings,
      macOS: darwinSettings,
    );

    await _plugin.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    // Yêu cầu quyền notification trên Android 13+
    if (Platform.isAndroid) {
      final androidPlugin = _plugin.resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>();
      await androidPlugin?.requestNotificationsPermission();
    }

    // Yêu cầu quyền notification trên iOS
    if (Platform.isIOS) {
      final iosPlugin = _plugin.resolvePlatformSpecificImplementation<
          IOSFlutterLocalNotificationsPlugin>();
      await iosPlugin?.requestPermissions(
        alert: true,
        badge: true,
        sound: true,
      );
    }

    _initialized = true;
    debugPrint('[NotificationService] Initialized successfully');
  }

  /// Xử lý khi người dùng tap vào notification.
  void _onNotificationTapped(NotificationResponse response) {
    debugPrint('[NotificationService] Notification tapped: ${response.payload}');
    // Có thể mở rộng sau này để navigate đến màn hình chat cụ thể
  }

  /// Hiển thị một notification trên thiết bị.
  /// [id] - ID duy nhất cho notification (dùng hashCode của teamId để gom nhóm).
  /// [title] - Tiêu đề notification (ví dụ: tên nhóm).
  /// [body] - Nội dung notification (ví dụ: nội dung tin nhắn).
  /// [payload] - Dữ liệu bổ sung (ví dụ: teamId) để xử lý khi tap.
  Future<void> showNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
  }) async {
    if (!_initialized) {
      debugPrint('[NotificationService] Not initialized yet, skipping notification.');
      return;
    }

    const androidDetails = AndroidNotificationDetails(
      'smash_hub_chat', // Channel ID
      'Tin nhắn & Thông báo', // Channel Name
      channelDescription: 'Thông báo tin nhắn mới và thành viên mới trong nhóm',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
      enableVibration: true,
      playSound: true,
      icon: '@mipmap/launcher_icon',
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _plugin.show(id, title, body, details, payload: payload);
  }
}
