import 'dart:io';
import 'package:flutter/material.dart';
import 'package:smashhub/src/app.dart';
import 'package:smashhub/src/shared/services/notification_service.dart';
import 'package:smashhub/src/shared/network/api_client.dart';

/// Cho phép bỏ qua chứng chỉ SSL tự ký trong môi trường dev.
/// CachedNetworkImage dùng HttpClient mặc định (không qua Dio)
/// nên cần override toàn cục để tải được ảnh từ server HTTPS dev.
class DevHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return super.createHttpClient(context)
      ..badCertificateCallback =
          (X509Certificate cert, String host, int port) => true;
  }
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  HttpOverrides.global = DevHttpOverrides();
  
  // Khởi tạo ApiClient session từ lưu trữ cục bộ (SharedPreferences)
  await ApiClient.init();
  
  // Khởi tạo dịch vụ thông báo cục bộ
  await NotificationService.instance.initialize();

  runApp(const SmashHubApp());
}