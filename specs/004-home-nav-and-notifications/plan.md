# Implementation Plan: Home Navigation and Notification Fixes

This plan outlines the technical changes required to fix the broken navigation links on the home screen, fix the "Tạo Bài Viết" FAB navigation, and resolve the push notification failure on physical devices.

## User Review Required

> [!IMPORTANT]  
> Please review the approach for fixing the push notification issue. Currently, the app requests notification permissions in `main.dart` *before* the app is actually rendered to the screen (`runApp`). This causes the permission dialog to fail silently on physical Android 13+ devices. The plan proposes moving the permission request into `MainWrapper` so it triggers when the user reaches the main app interface.

## Open Questions

None. The requirements are clear and the root cause of the notification bug has been identified.

## Proposed Changes

---

### Home Screen Navigation

#### [MODIFY] [home_screen.dart](file:///d:/Github/SmashClub/AndroidApp/lib/src/features/home/presentation/screens/home_screen.dart)
- **Quick Action Links**:
  - Update `onTap` for "Quản lý Nhóm" to trigger `ApiConfig.activeTabNotifier.value = 2` (navigate to Nhóm tab).
  - Update `onTap` for "Đặt sân" to trigger `ApiConfig.activeTabNotifier.value = 1` (navigate to Đặt sân tab).
  - Update `onTap` for "Lịch chơi" to trigger `ApiConfig.activeTabNotifier.value = 2` (since schedules are managed within individual Teams, we will route users to their Teams list).
- **Banner Link**:
  - Update `onPressed` on the "Đặt Ngay" banner button to trigger `ApiConfig.activeTabNotifier.value = 1` (navigate to Đặt sân tab).

---

### Community Post Navigation

#### [MODIFY] [main_wrapper.dart](file:///d:/Github/SmashClub/AndroidApp/lib/src/shared/widgets/main_wrapper.dart)
- Import `package:smashhub/src/features/social/presentation/screens/create_post_screen.dart`.
- Update the `_buildDialogOption` for "Tạo Bài Viết" to remove the `SnackBar` ("Tính năng bài viết đang phát triển!") and replace it with `Navigator.push` to `CreatePostScreen()`.

---

### Notification Fix for Physical Devices

#### [MODIFY] [notification_service.dart](file:///d:/Github/SmashClub/AndroidApp/lib/src/shared/services/notification_service.dart)
- Extract the permission requesting logic (for both Android 13+ and iOS) out of `initialize()` and into a new, public `requestPermissions()` method.
- *Reasoning*: `initialize()` is invoked in `main.dart` before the Flutter engine attaches the main Activity. Without an Activity, the system cannot show the permission dialog, leading to silent failures on physical devices.

#### [MODIFY] [main_wrapper.dart](file:///d:/Github/SmashClub/AndroidApp/lib/src/shared/widgets/main_wrapper.dart)
- In `initState()`, invoke `NotificationService.instance.requestPermissions()`. This ensures the permission dialog appears as soon as the user enters the main authenticated app, at which point an Activity context is guaranteed to be available.

## Verification Plan

### Automated Tests
- None required (primarily UI wiring and lifecycle fixes).

### Manual Verification
1. Run the app and tap "Quản lý Nhóm", "Đặt sân", "Lịch chơi" on the Home Screen. Verify the bottom navigation tab switches appropriately.
2. Tap the "Đặt Ngay" banner. Verify it switches to the Booking tab.
3. Tap the bottom "+" FAB and select "Tạo Bài Viết". Verify it opens the Create Post screen.
4. Run the app on a physical Android 13+ device. Verify that the notification permission prompt is displayed when entering the app. Test receiving a notification via SignalR.
