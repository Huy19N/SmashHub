# Feature Specification: Home Navigation and Notification Fixes

**Feature Branch**: `004-home-nav-and-notifications`

**Created**: 2026-07-04

**Status**: Draft

**Input**: User description: "thứ nhất tôi muốn thêm liên kết cho phần các box hành động nhanh ở trang chủ như ảnh 1 thấy thì box "Quản lý nhóm", "Đặt sân" và "Lịch chơi" ấn vô không hoạt động. Thứ 2 khi ấn hình trong + ở thanh nav bên dưới sẽ hiện 3 lựa trọn như hình 2 thì ấn vô tạo bài viêt thì nó thông báo tính năng đang được phát triển trong khi tính  năng cộng đồng làm xong và tính năng tạo bài viêt trong cộng đồng mà khi ấn vô nút đó lại không dẫn đến chỗ tạo bài viết, cần fix lại. thứ 3 ở trang chủ có cái banner quảng cáo chạy và có nút đặt ngay thì khi người dùng ấn vào thì dẫn đến trang đặt sân. Thứ 4 bạn hãy quét phần tính năng noficattion thông báo của app khi tôi chạy trên điện thoại thì có không có thông báo bạn hãy fix lỗi phần này, đảm bảo chắc chắn sẽ có thông báo khi chạy trên điện thoại"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Home Screen Quick Action Links (Priority: P1)

Users want to navigate to key features (Group Management, Booking, Schedule) quickly from the home screen quick action boxes.

**Why this priority**: These are primary navigation paths that are currently broken, preventing users from accessing core functionality efficiently.

**Independent Test**: Tap each quick action box on the home screen and verify it navigates to the correct corresponding screen.

**Acceptance Scenarios**:

1. **Given** the user is on the Home screen, **When** they tap the "Quản lý nhóm" box, **Then** they are navigated to the Group Management screen.
2. **Given** the user is on the Home screen, **When** they tap the "Đặt sân" box, **Then** they are navigated to the Booking screen.
3. **Given** the user is on the Home screen, **When** they tap the "Lịch chơi" box, **Then** they are navigated to the Schedule screen.

---

### User Story 2 - Floating Action Button "Create Post" Navigation (Priority: P1)

Users want to create community posts directly from the FAB menu on the bottom navigation bar.

**Why this priority**: The community feature is implemented, but the entry point from the FAB is blocked by a "feature in development" message.

**Independent Test**: Tap the "+" FAB, select "Tạo Bài Viết", and verify the app navigates to the Create Post screen instead of showing a toast/dialog.

**Acceptance Scenarios**:

1. **Given** the user opens the FAB menu, **When** they tap "Tạo Bài Viết", **Then** the app navigates to the Community Create Post screen.

---

### User Story 3 - Home Banner Booking Navigation (Priority: P2)

Users want to quickly access the booking flow from promotional banners on the home screen.

**Why this priority**: Promotional banners drive conversion; broken links lead to missed booking opportunities.

**Independent Test**: Tap the "Đặt Ngay" button on the home screen banner and verify navigation to the booking screen.

**Acceptance Scenarios**:

1. **Given** the user sees the promotional banner on the home screen, **When** they tap "Đặt Ngay", **Then** they are navigated to the Booking screen.

---

### User Story 4 - Push Notifications on Physical Devices (Priority: P1)

Users need to receive push notifications reliably on their physical mobile devices.

**Why this priority**: Notifications are crucial for user engagement and timely updates (e.g., booking confirmations, messages). Currently, they fail on physical devices.

**Independent Test**: Trigger a test notification from the backend or Firebase console and verify it appears on a physical Android device.

**Acceptance Scenarios**:

1. **Given** the app is installed on a physical device, **When** a notification is sent to the user, **Then** the device successfully receives and displays the notification.

---

### Edge Cases

- What happens if the user taps a quick action button while offline? The app should navigate to the screen and display cached data or an appropriate offline state.
- What happens if the notification permission is denied by the user? The app should handle the lack of permission gracefully without crashing, prompting for permission if possible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST navigate to the Group Management screen when "Quản lý nhóm" is tapped.
- **FR-002**: System MUST navigate to the Booking screen when "Đặt sân" is tapped from quick actions or the banner.
- **FR-003**: System MUST navigate to the Schedule screen when "Lịch chơi" is tapped.
- **FR-004**: System MUST navigate to the Create Post screen when "Tạo Bài Viết" is tapped in the FAB menu.
- **FR-005**: System MUST successfully receive and process push notifications on physical devices.

### Key Entities *(include if feature involves data)*

- **Push Notification Token**: The device-specific token required to route notifications correctly.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of quick action boxes and banner buttons on the home screen navigate to their intended destinations.
- **SC-002**: "Tạo Bài Viết" successfully opens the creation flow without displaying the "feature in development" message.
- **SC-003**: Push notifications are delivered and displayed on physical test devices with a 100% success rate in testing environments.

## Assumptions

- The target destination screens (Group Management, Booking, Schedule, Create Post) already exist and are fully functional.
- The notification issue is likely related to Firebase configuration, missing runtime permissions, or initialization code that needs to be fixed for physical devices.
