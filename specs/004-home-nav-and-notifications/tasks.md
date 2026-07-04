# Tasks: Home Navigation and Notification Fixes

**Input**: Design documents from `/specs/004-home-nav-and-notifications/`

**Prerequisites**: plan.md, spec.md

## Phase 1: Home Screen Navigation (US1)

**Goal**: Fix broken navigation links on the Home Screen (Quick actions and Banner).

- [x] T001 [P] [US1] Update `onTap` for "Quản lý nhóm", "Đặt sân", "Lịch chơi" quick actions in `AndroidApp/lib/src/features/home/presentation/screens/home_screen.dart`
- [x] T002 [P] [US1] Update `onPressed` for "Đặt Ngay" banner button in `AndroidApp/lib/src/features/home/presentation/screens/home_screen.dart`

---

## Phase 2: Community Post Navigation (US2)

**Goal**: Fix FAB "Tạo Bài Viết" navigation in the Main Wrapper.

- [x] T003 [US2] Update `_buildDialogOption` for "Tạo Bài Viết" to use `Navigator.push` to `CreatePostScreen` in `AndroidApp/lib/src/shared/widgets/main_wrapper.dart`

---

## Phase 3: Notification Fix for Physical Devices (US3)

**Goal**: Resolve the issue where notification permissions silently fail on physical Android 13+ devices.

- [x] T004 [US3] Extract permission requesting logic into a new `requestPermissions()` method in `AndroidApp/lib/src/shared/services/notification_service.dart`
- [x] T005 [US3] Invoke `NotificationService.instance.requestPermissions()` inside `initState()` of `AndroidApp/lib/src/shared/widgets/main_wrapper.dart`

---

## Dependencies & Execution Order

- **Home Screen Navigation (Phase 1)**: Can start immediately.
- **Community Post Navigation (Phase 2)**: Can start immediately, in parallel with Phase 1.
- **Notification Fix (Phase 3)**: T004 must be completed before T005. Can run in parallel with other phases.
