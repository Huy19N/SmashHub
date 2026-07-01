import 'package:flutter/foundation.dart';

class ApiConfig {
  // ĐỔI URL NÀY KHI DEPLOY APK THỰC TẾ
  // Sử dụng biến môi trường API_BASE_URL. Nếu không truyền sẽ mặc định dùng localhost của máy ảo Android.
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://tad-min.io.vn',
  );

  /// Khóa bảo mật dùng để giao tiếp với Backend, đảm bảo chỉ App này mới được truy cập
  static const String appClientKey = 'smashhub_mobile_secure_key_2026';

  /// Tạo URL file từ fileId để tải ảnh/video từ backend
  static String getFileUrl(String fileId) {
    if (fileId.isEmpty) return '';
    return '$baseUrl/api/files/$fileId/stream';
  }

  /// URL cho Chat Hub (SignalR)
  static String get chatHubUrl => '$baseUrl/hub/chat';

  /// URL cho Notification Hub (SignalR)
  static String get notificationHubUrl => '$baseUrl/hub/notifications';

  /// ValueNotifier to notify screens when tab changes in MainWrapper
  static final ValueNotifier<int> activeTabNotifier = ValueNotifier(-1);

  /// Cấu hình WebRTC ICE Servers (STUN/TURN)
  static const Map<String, dynamic> iceServers = {
    'iceServers': [
      {'urls': 'stun:stun.l.google.com:19302'},
      {'urls': 'stun:stun1.l.google.com:19302'},
    ],
  };
}
