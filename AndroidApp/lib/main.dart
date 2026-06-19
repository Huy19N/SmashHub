import 'dart:io';
import 'package:flutter/material.dart';
import 'package:smashhub/src/app.dart';

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

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  HttpOverrides.global = DevHttpOverrides();
  runApp(const SmashHubApp());
}
