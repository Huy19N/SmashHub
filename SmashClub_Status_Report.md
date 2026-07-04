# SmashClub - System Analysis & Implementation Status

## 1. Database & Backend Capabilities (Ground Truth)
Dựa trên `SmashSportDatabase.sql` và backend controllers, hệ thống hiện tại hỗ trợ 13 phân hệ (modules) chức năng lõi:

| Phân hệ (Module) | Các Bảng SQL Chính | Backend Controllers | Mô tả |
|-----------------|--------------------|---------------------|--------|
| **1. System & Users** | `Users`, `UserRoles`, `StoredFiles`, `UserBlocks` | `AuthController`, `UsersController`, `FilesController`, `AdminController` | Quản lý người dùng, phân quyền, xác thực (Auth), upload file đa phương tiện (MinIO/S3), chặn người dùng. |
| **2. Sports & Profile** | `Sports`, `SportLevels`, `UserSportProfiles` | `SportsController`, `UserSportProfilesController` | Danh mục môn thể thao (Cầu lông, Bóng bàn, Pickleball), quản lý trình độ và hồ sơ thể thao của người chơi. |
| **3. Teams (Groups)** | `Teams`, `TeamRoles`, `TeamMembers`, `TeamInvites` | `TeamsController`, `TeamMembersController`, `InvitesController` | Quản lý nhóm (câu lạc bộ), thành viên nhóm, vai trò nhóm (Leader/Member) và mã mời tham gia nhóm. |
| **4. Facility & Courts** | `Facilities`, `FacilityOperatingHours`, `FacilityImages`, `FacilityReviews`, `Courts`, `CourtCosts` | `FacilitiesController`, `CourtsController`, `CourtCostsController` | Quản lý cơ sở thể thao (Chủ sân), khung giờ hoạt động, hình ảnh cơ sở, đánh giá, quản lý sân nhỏ và giá thuê sân theo giờ. |
| **5. Booking** | `Bookings`, `BookingStatus` | `BookingsController`, `StatusesController` | Xử lý quy trình đặt sân (online & offline), tính phí (TotalCost, PlatformFee), quản lý trạng thái đơn đặt. |
| **6. Scheduling & Challenges** | `Schedules`, `ScheduleParticipants`, `MatchChallenges`, `MatchAcceptances` | `SchedulesController`, `ScheduleParticipantsController`, `MatchmakingController` | Lên lịch giao lưu, chia tiền sân, tổ chức trận đấu giao hữu/thách đấu giữa các nhóm (Matchmaking). |
| **7. Subscriptions** | `SubscriptionTiers`, `SubscriptionPlans`, `UserSubscriptions`, `Features`, `TierFeatures` | `SubscriptionsController` | Quản lý các gói đăng ký trả phí (Free, Standard, Premium), phân quyền chức năng theo gói. |
| **8. Chat & Calls** | `VideoCallSessions`, `VideoCallParticipants` | `TeamMessageController`, SignalR (Hubs) | Nhắn tin nhóm và lưu trữ lịch sử cuộc gọi video (Video Calls). |
| **9. Payment & Wallets** | `PaymentGateways`, `FacilityPaymentConfigs`, `FacilityWallets`, `FacilityBankAccounts`, `PayoutRequests` | `PaymentsController` | Cấu hình phương thức thanh toán cho chủ sân, ví điện tử (chia doanh thu), tài khoản ngân hàng và yêu cầu rút tiền. |
| **10. Payment Transactions** | `Payments`, `Payouts` | `PaymentsController` | Quản lý lịch sử giao dịch thanh toán và đối soát. |
| **11. System Settings** | `SystemSettings` | `StatisticsController`, `AdminController` | Cấu hình hệ thống (Ví dụ: phí hoa hồng nền tảng), thống kê hệ thống (Admin Dashboard). |
| **12. Social/Community** | *(Chưa có bảng SQL rõ ràng, có thể dùng NoSQL hoặc SignalR)* | `SocialController` | Tính năng đăng bài viết cộng đồng (Social Feed). |
| **13. Email/Notifications** | *(Tích hợp Redis/SMTP)* | `EmailController`, `NotificationsController` | Gửi email thông báo, xác minh và thông báo in-app. |

---

## 2. Website - Implementation Status
Website phục vụ cả 3 nhóm đối tượng: Admin, Chủ sân (Facility Owner) và Người dùng (User).

### ✅ Đã triển khai (Implemented):
* **Authentication:** Đăng nhập, đăng ký, bảo mật với JWT Auth.
* **Admin Portal (`/admin`):**
  * Dashboard & Statistics.
  * Quản lý Users, Quản lý Cơ sở (Facilities).
  * Quản lý Yêu cầu rút tiền (Payouts).
  * Cấu hình thanh toán hệ thống & Quản lý doanh thu (Platform Fee).
* **Facility Owner Portal (`/courtsManagement`):**
  * Đăng ký cơ sở thể thao (Bản đồ Leaflet, tự động định vị, chọn địa chỉ tĩnh).
  * Cấu hình khung giờ hoạt động (Pill toggles, áp dụng hàng loạt).
  * Quản lý sân và giá sân.
* **User Portal:**
  * **Hồ sơ cá nhân (`/profiles`):** Xem và cập nhật trình độ thể thao.
  * **Nhóm/Câu lạc bộ (`/groups`):** Tạo nhóm, quản lý thành viên, xem chi tiết trình độ thể thao (SportProfiles) của thành viên.
  * **Lịch trình & Đặt sân (`/bookings`, `/schedules`):** Giao diện tìm sân, đặt sân và lên lịch trận đấu.
  * **Mạng xã hội (`/social`):** Nút đăng bài sử dụng component UI Core (`Button.jsx`).
  * **Video Call / Chat:** Chat nhóm (`TeamChat.jsx`) và gọi Video Call (`VideoCallOverlay.jsx`) đã được tích hợp đầy đủ.

### ❌ Chưa triển khai (Missing/TODOs):
* **Chức năng Thách đấu (Matchmaking):** Tích hợp UI/UX tạo thử thách giao hữu (Challenger vs Host) chưa liên kết hoàn toàn với Flow backend.
* **Thanh toán trực tiếp:** Quy trình thanh toán booking bằng cổng thanh toán thật (VNPAY/Momo) chưa hoàn thiện đầu cuối.
* **Gói Đăng Ký (Subscriptions):** Giao diện để người dùng mua gói Premium/Standard.

---

## 3. Android App (Flutter) - Implementation Status
Ứng dụng di động được thiết kế phục vụ tối ưu cho cả Người dùng (User/Player) và Chủ Sân (Facility Owner).

### ✅ Đã triển khai (Implemented):
* **Authentication (`auth`):** Đăng nhập, đăng ký.
* **Onboarding (`onboarding`):** Hướng dẫn người dùng mới.
* **Splash & Home (`splash`, `home`):** Màn hình chờ và trang chủ ứng dụng.
* **Đặt sân (`booking`):** Tìm kiếm và đặt sân (Clean Architecture: data, domain, presentation).
* **Facility Owner Portal:** Khi đăng nhập bằng ID chủ sân, ứng dụng cung cấp giao diện quản lý đầy đủ: Dashboard Chủ Sân, Quản lý Sân (`owner_court_management_screen`), Lịch Đặt Sân (`owner_calendar_screen`).
* **Cộng đồng & Nhóm (`community`, `social`):** Feed bài viết và quản lý đội nhóm.
* **Chat & Video Call:** Tích hợp gọi video (`video_call_screen.dart`) và chat nhóm (`team_chat_screen.dart`) qua SignalR.
* **Thách đấu (`matchmaking`):** Giao diện tìm kiếm đối thủ.
* **Thông báo (`notifications`):** Thông báo đẩy in-app.
* **Thống kê cá nhân (`statistics`):** Báo cáo hoạt động thể thao cá nhân.

### ⚠️ Không có (Not Needed):
* **Admin Portal:** App Android không cần và không tích hợp cổng quản trị của hệ thống.

### ❌ Chưa triển khai (Missing/TODOs):
* **Quản lý thanh toán & Subscriptions:** Chưa có module nạp tiền, rút tiền hay mua gói hội viên trong app.
* **Cost Splitting (Chia tiền tự động):** Chưa hoàn thiện flow chia tiền chi tiết trong quản lý lịch thi đấu nhóm nội bộ ứng dụng.

---

## 4. Kiến Trúc Mã Nguồn (Architecture Styles)
Để đảm bảo sự đồng nhất trong toàn bộ dự án, mã nguồn đang tuân thủ các kiến trúc sau:

### Website (React / Vite)
Sử dụng kiến trúc **Feature-Sliced Design (FSD) cơ bản**:
* **`src/features/`**: Nơi chứa logic chính theo từng module (auth, admin, groups, bookings, v.v.). Mỗi feature sẽ tự chứa `components`, `pages`, `hooks`, `services`.
* **`src/components/`**: Nơi chứa các components dùng chung toàn hệ thống (UI Core như Button, Modal, Sidebar...).
* **`src/contexts/`**: Quản lý state toàn cục (Theme, Auth, Notification).

### Android App (Flutter)
Sử dụng kiến trúc **Clean Architecture** kết hợp **Feature-Based**:
* **`lib/src/features/`**: Phân chia theo module (auth, booking, social, v.v.). Bên trong mỗi module sẽ bao gồm 3 lớp chuẩn Clean Architecture:
  * `data/`: Chứa repositories implementation, models, data sources.
  * `domain/`: Chứa entities, repository interfaces.
  * `presentation/`: Chứa UI screens, widgets, controllers/blocs.
* **`lib/src/shared/`**: Chứa các services chung (SignalR, Network/API, Notifications) và các UI widgets dùng chung (`main_wrapper.dart`).

---

## 5. Ràng Buộc & Tiêu Chuẩn Thực Thi (Agent Constraints & Rules)
**QUAN TRỌNG:** Mọi Agent/AI hoạt động trên repository này phải ĐỌC và TUÂN THỦ nghiêm ngặt các quy tắc sau trước khi thực thi bất cứ thay đổi nào:

1. **Không được hardcode:** Mọi dữ liệu (URL API, cấu hình, text hiển thị quan trọng) phải được truyền qua biến môi trường, config file hoặc lấy từ Backend.
2. **Phải code clean:** Đảm bảo mã nguồn rõ ràng, chia nhỏ component hợp lý, đặt tên biến/hàm theo chuẩn (camelCase cho JS/Dart, PascalCase cho C#), xóa code rác và console.log sau khi hoàn thiện. Tuân thủ đúng kiến trúc (Feature-based / Clean Architecture) của từng nền tảng.
3. **Không được chỉnh sửa backend:** Không được tự ý thay đổi mã nguồn C# hoặc cấu trúc Database trừ khi được yêu cầu rõ ràng từ người dùng.
4. **Không được bịa code:** Mọi logic xử lý phải dựa trên file thực tế hiện có trong repo, không tạo ra các đường dẫn import hoặc tên hàm giả định.
5. **Phải dùng các tool đúng cho các phiên thực thi:** Agent phải phân tích kỹ mục đích trước khi gọi tool. Ưu tiên tool chuyên biệt (như `view_file`, `grep_search`, `write_to_file`) thay vì dùng lệnh shell thông thường. Sử dụng trình độ cao nhất để giải quyết vấn đề.
