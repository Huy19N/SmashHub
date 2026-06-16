import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:smashhub/src/app.dart';

void main() {
  testWidgets('App flow smoke test: Splash -> Onboarding -> Login -> Dashboard', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const SmashHubApp());

    // 1. Verify Splash Screen text is present initially.
    expect(find.text('SmashHub'), findsOneWidget);

    // 2. Advance time past the splash duration (4.5s + transition) to reach Onboarding screen.
    await tester.pumpAndSettle(const Duration(seconds: 7));

    // 3. Verify Onboarding screen is rendered.
    expect(find.text('Bỏ qua'), findsOneWidget);
    expect(find.text('SmashHub - Đa Bản Sắc Thể Thao'), findsOneWidget);

    // 4. Tap the 'Bỏ qua' (Skip) button to navigate directly to Login Screen.
    await tester.tap(find.text('Bỏ qua'));
    await tester.pumpAndSettle();

    // 5. Verify Login Screen is rendered.
    expect(find.text('Forgot Password?'), findsOneWidget);

    // Enter login credentials to pass validation
    await tester.enterText(find.byType(TextFormField).at(0), 'hai@smash.vn');
    await tester.enterText(find.byType(TextFormField).at(1), 'password123');
    await tester.pumpAndSettle();

    // 6. Tap the 'Login' button to proceed to ProfileScreen.
    // The button has the last 'Login' text (first is the subtitle 'Login').
    await tester.tap(find.text('Login').last);
    await tester.pumpAndSettle(); // Settle navigation directly to ProfileScreen

    // 7. Verify Profile Screen is rendered.
    expect(find.text('Trang cá nhân'), findsOneWidget);
    expect(find.text('Trình độ thể thao'), findsOneWidget);
    expect(find.text('Hải Nguyễn'), findsNWidgets(2));
    expect(find.text('Cầu Lông'), findsOneWidget);
  });
}

