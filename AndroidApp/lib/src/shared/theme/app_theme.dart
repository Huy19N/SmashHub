import 'package:flutter/material.dart';

class AppTheme {
  AppTheme._();

  // Colors
  static const Color primaryColor = Color(0xFF00663C); // Dark sport green
  static const Color primaryDarkColor = Color(0xFF004D2C);
  static const Color primaryLightColor = Color(0xFFE2F3E7); // Soft light green tint

  // Dark Scheme Colors
  static const Color darkBackgroundColor = Color(0xFF0A0A0A); // Deep black/obsidian
  static const Color darkSurfaceColor = Color(0xFF18181B); // Zinc 900
  static const Color darkOnBackgroundColor = Color(0xFFFAFAFA);
  static const Color darkOnSurfaceColor = Color(0xFFF4F4F5);

  // Light Scheme Colors
  static const Color lightBackgroundColor = Color(0xFFF5F3EC); // Pale beige/cream background
  static const Color lightSurfaceColor = Color(0xFFFFFFFF); // White cards for premium contrast
  static const Color lightOnBackgroundColor = Color(0xFF09090B);
  static const Color lightOnSurfaceColor = Color(0xFF18181B);

  // Text Theme for readability and contrast
  static const TextTheme _textTheme = TextTheme(
    bodyLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w500, letterSpacing: 0.15),
    bodyMedium: TextStyle(fontSize: 15, fontWeight: FontWeight.normal, letterSpacing: 0.25),
    titleLarge: TextStyle(fontSize: 22, fontWeight: FontWeight.w600, letterSpacing: 0),
    titleMedium: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, letterSpacing: 0.15),
  );

  // Dark Theme
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: primaryColor,
      colorScheme: const ColorScheme.dark(
        primary: primaryColor,
        secondary: primaryLightColor,
        surface: darkSurfaceColor,
        onPrimary: Colors.white,
        onError: Colors.white,
      ),
      scaffoldBackgroundColor: darkBackgroundColor,
      textTheme: _textTheme.apply(
        bodyColor: darkOnBackgroundColor,
        displayColor: darkOnBackgroundColor,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: darkBackgroundColor,
        foregroundColor: darkOnBackgroundColor,
        elevation: 0,
        centerTitle: true,
      ),
      cardTheme: CardThemeData(
        color: darkSurfaceColor,
        elevation: 0,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: Colors.white10, width: 1),
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          minimumSize: const Size(48, 48), // Ensure minimum tap target
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size(48, 48), // Ensure minimum tap target
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          minimumSize: const Size(48, 48), // Ensure minimum tap target
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: darkSurfaceColor,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.white24, width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryColor, width: 2),
        ),
        labelStyle: const TextStyle(color: Colors.white, fontSize: 16),
        hintStyle: const TextStyle(color: Colors.white54, fontSize: 16),
      ),
    );
  }

  // Light Theme
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: primaryColor,
      colorScheme: const ColorScheme.light(
        primary: primaryColor,
        secondary: primaryDarkColor,
        surface: lightSurfaceColor,
        onPrimary: Colors.white,
        onError: Colors.white,
      ),
      scaffoldBackgroundColor: lightBackgroundColor,
      textTheme: _textTheme.apply(
        bodyColor: lightOnBackgroundColor,
        displayColor: lightOnBackgroundColor,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: lightBackgroundColor,
        foregroundColor: lightOnBackgroundColor,
        elevation: 0,
        centerTitle: true,
      ),
      cardTheme: CardThemeData(
        color: lightSurfaceColor,
        elevation: 0,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: Colors.black12, width: 1),
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          minimumSize: const Size(48, 48), // Ensure minimum tap target
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size(48, 48), // Ensure minimum tap target
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          minimumSize: const Size(48, 48), // Ensure minimum tap target
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: lightSurfaceColor,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.black26, width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryColor, width: 2),
        ),
        labelStyle: const TextStyle(color: Colors.black, fontSize: 16),
        hintStyle: const TextStyle(color: Colors.black54, fontSize: 16),
      ),
    );
  }
}
