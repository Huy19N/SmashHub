import 'package:flutter/material.dart';
import 'shared/theme/app_theme.dart';
import 'features/splash/presentation/splash_screen.dart';


class SmashHubApp extends StatelessWidget {
  const SmashHubApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SmashHub',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.light, // Đặt mặc định là giao diện sáng (nền trắng) theo yêu cầu của người dùng
      debugShowCheckedModeBanner: false,
      home: const SplashScreen(),
    );
  }
}
