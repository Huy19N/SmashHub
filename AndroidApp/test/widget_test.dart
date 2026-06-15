// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_test/flutter_test.dart';
import 'package:smashhub/src/app.dart';

void main() {
  testWidgets('Dashboard smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const SmashHubApp());

    // Verify that our dashboard app bar title and welcome text render.
    expect(find.text('SMASHHUB'), findsOneWidget);
    expect(find.text('Welcome to the Club'), findsOneWidget);
  });
}
