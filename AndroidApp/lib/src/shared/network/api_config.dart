class ApiConfig {
  // ĐỔI URL NÀY KHI DEPLOY APK THỰC TẾ
  // Ví dụ: 'https://api.smashclub.com' hoặc IP server thực tế
  static const String baseUrl = 'https://10.0.2.2:7020';
  
  /// Tạo URL file từ fileId để tải ảnh/video từ backend
  static String getFileUrl(String fileId) {
    if (fileId.isEmpty) return '';
    return '$baseUrl/api/files/$fileId';
  }

  /// URL cho Chat Hub (SignalR)
  static String get chatHubUrl => '$baseUrl/hub/chat';

  /// Cấu hình WebRTC ICE Servers (STUN/TURN)
  static const Map<String, dynamic> iceServers = {
    'iceServers': [
      {'urls': 'stun:stun.l.google.com:19302'},
      {'urls': 'stun:stun1.l.google.com:19302'}
    ]
  };
}
