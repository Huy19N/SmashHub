class ApiConfig {
  // ĐỔI URL NÀY KHI DEPLOY APK THỰC TẾ
  // Sử dụng biến môi trường API_BASE_URL. Nếu không truyền sẽ mặc định dùng localhost của máy ảo Android.
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL', 
    defaultValue: 'https://10.0.2.2:7020',
  );
  
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
