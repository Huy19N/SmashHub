import 'package:flutter/foundation.dart';

class ApiConfig {
  static String get _defaultLocalHost {
    if (kIsWeb) return 'http://127.0.0.1:8080';
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:8080';
    }
    return 'http://127.0.0.1:8080';
  }

  static String get baseUrl {
    const envUrl = String.fromEnvironment('API_BASE_URL');
    if (envUrl.isNotEmpty) return envUrl;
    return kDebugMode ? _defaultLocalHost : 'https://tad-min.io.vn';
  }

  /// Khóa bảo mật dùng để giao tiếp với Backend, đảm bảo chỉ App này mới được truy cập
  static const String appClientKey = String.fromEnvironment(
    'APP_CLIENT_KEY',
    defaultValue: 'smashhub_mobile_secure_key_2026',
  );

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
