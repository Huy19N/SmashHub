# Specification: Trạng thái hiện tại của hệ thống SmashClub

## 1. Kiến trúc hiện tại (Current Architecture)
- **Mô hình tổng thể:** Client-Server. Hệ thống bao gồm 3 client chính (Android App, Website SPA) giao tiếp với một Backend API tập trung thông qua HTTP/HTTPS và WebSockets.
- **Backend (BESmashClub):** N-Tier Architecture (Kiến trúc phân lớp) dạng Monolith (.NET 8). Các layer được tách thành các project con: `APIWebApp`, `Services`, `Repositories`, `Entites`.
- **Frontend (Website):** Single Page Application (SPA) xây dựng bằng React 19 + Vite. Cấu trúc Feature-based.
- **Mobile (AndroidApp):** Ứng dụng Flutter đa nền tảng (chủ yếu build cho Android) sử dụng kiến trúc Feature-First.
- **Hạ tầng / Giao tiếp mạng:** RESTful API, SignalR cho Real-time (Chat, Notification), WebRTC cho Gọi điện trực tiếp P2P. Lưu trữ Object/Media bằng MinIO.

## 2. Các module hiện có (Existing Modules)
- **Module Người Dùng (Users & Auth):** Đăng nhập, đăng ký, xác thực, quên mật khẩu, quản lý hồ sơ thể thao người chơi (UserSportProfiles).
- **Module Cơ Sở Vật Chất (Facilities & Courts):** Quản lý cơ sở sân cầu lông, sân chi tiết, bảng giá (Court Costs).
- **Module Đặt Sân (Bookings & Payments):** Tìm kiếm sân, chọn giờ, đặt chỗ, thanh toán.
- **Module Mạng Xã Hội (Social):** Bảng tin cộng đồng (Newsfeed), đăng bài viết đính kèm hình ảnh.
- **Module Đội Nhóm & Ghép Cặp (Teams & Matchmaking):** Tạo đội, mời thành viên, ghép cặp thi đấu, nhóm chat nội bộ (TeamMessage).
- **Module Quản Trị (Admin & Stats):** Dashboard, số liệu thống kê.

## 3. Business flow hiện tại (Current Business Flow)
- **Flow Khởi tạo App:** Tải ứng dụng -> Xem màn hình Splash/Onboarding -> Đọc và Đồng ý điều khoản/Quyền riêng tư -> Đăng ký/Đăng nhập -> Vào giao diện chính.
- **Flow Đặt Sân:** Tìm kiếm Facility quanh vị trí hiện tại trên Map -> Xem danh sách Court -> Lên lịch (Schedule) -> Chọn giờ trống -> Khởi tạo giao dịch Thanh toán (Payment) -> Cập nhật Status đặt sân.
- **Flow Cộng đồng:** Mở bảng tin -> Kéo danh sách bài viết -> Nhấn tạo bài mới -> Upload nội dung + File ảnh -> Lưu qua MinIO API -> Trả ID hiển thị.
- **Flow Ghép cặp / Giao tiếp:** Cập nhật thông tin trình độ (Sport Profile) -> Gửi Invite (lời mời ghép đội/đấu) -> Đối phương nhận Push Notification -> Chấp nhận -> Bắt đầu phiên Chat / Gọi thoại WebRTC.

## 4. Chức năng hiện có (Existing Features)
- Đăng nhập/Đăng ký qua JWT.
- Hiển thị Bản đồ và lấy tọa độ địa điểm.
- Đặt lịch thuê sân và Tính chi phí.
- Giao tiếp cộng đồng: Bảng tin đăng bài với văn bản và Media.
- Gửi/Nhận thông báo Real-time (Push notifications).
- Nhắn tin trực tiếp/nhóm và Gọi Video/Thoại bằng WebRTC.
- Matchmaking theo trình độ người chơi.

## 5. API hiện có (Existing APIs)
Backend hiển thị qua Swagger với các nhóm Controller RESTful:
- `AuthController`, `UsersController`: Định danh người dùng.
- `FacilitiesController`, `CourtsController`, `CourtCostsController`: CRUD quản trị sân bãi.
- `BookingsController`, `SchedulesController`, `ScheduleParticipantsController`, `PaymentsController`: Xử lý giao dịch, lịch.
- `SocialController`: Xử lý bảng tin cộng đồng.
- `MatchmakingController`, `TeamsController`, `TeamMembersController`, `InvitesController`: Logic nhóm & ghép cặp.
- `FilesController`: Tải lên và xuất stream tệp tin (ảnh/video) qua MinIO.
- `NotificationsController`, `EmailController`: Logic giao tiếp (Email, SignalR).
- `AdminController`, `StatisticsController`: Dashboard dành riêng cho Admin.

## 6. Database hiện có (Existing Database)
- **Hệ quản trị:** SQL Server.
- **ORM (Object-Relational Mapping):** Entity Framework Core.
- **Cấu trúc bảng (Entities):** 
  - Lõi quản lý: `Users`, `UserSportProfiles`.
  - Lõi sân bãi: `Facilities`, `Courts`, `CourtCosts`.
  - Lõi giao dịch: `Bookings`, `Payments`, `Schedules`.
  - Lõi xã hội: `Posts`, `StoredFiles`, `PostMedias` (bảng mới xử lý file đính kèm), `Teams`, `TeamMembers`, `Invites`.
- **Quan hệ (Relationships):** Ràng buộc khóa ngoại chặt chẽ, hỗ trợ `ON DELETE CASCADE` cho các thực thể phụ thuộc vòng đời.

## 7. Authentication & Authorization
- **Authentication:** Xác thực bằng công nghệ **JWT Bearer**. Backend cấp token, client (App/Web) lưu trữ cục bộ và gắn vào header `Authorization: Bearer <token>` trên từng request.
- **Authorization:** Sử dụng Role-based access control (Admin, User, Facility Owner). 
- **Security:** Có cơ chế hạn chế client bằng cấu hình CORS hẹp và Security Keys cứng trong source (vd: `smashhub_mobile_secure_key_2026`).

## 8. Các dependency chính (Main Dependencies)
- **Backend (C#):** `Microsoft.EntityFrameworkCore.Design`, `Microsoft.AspNetCore.Authentication.JwtBearer`, `Minio`, `Swashbuckle.AspNetCore`.
- **Website (JS):** `react`, `react-router-dom`, `axios`, `tailwindcss`, `@microsoft/signalr`, `react-leaflet`.
- **Android App (Dart):** `dio`, `signalr_netcore`, `flutter_webrtc`, `flutter_map`, `shared_preferences`, `image_picker`.

## 9. Các giới hạn hiện tại (Current Limitations)
- **Type Safety Frontend:** Website dùng Javascript thuần (`.jsx`), thiếu TypeScript (`.tsx`) gây thiếu an toàn về kiểu dữ liệu khi parse JSON từ API.
- **State Management (Web & App):** Chưa sử dụng kiến trúc quản lý trạng thái tập trung tiêu chuẩn (như Redux cho Web hay BLoC/Riverpod cho Flutter), đa phần là Local State.
- **Cơ sở dữ liệu (Database Migration):** Bảng lịch sử di trú (`__EFMigrationsHistory`) của EF Core bị mất/không đồng bộ, chặn khả năng auto-migration từ code hiện tại.
- **Mạng (Network Routing):** Giao tiếp HTTPS ở môi trường production đang được định tuyến port-forward qua Reverse Proxy (port 7020 / cổng 443) thay vì xử lý mã hóa native ở level Kestrel (.NET).
- **Kiến trúc Controllers (Backend):** Các Controller (ví dụ Admin, Facilities) đảm nhận lượng code (LOC) khá lớn, vi phạm nhẹ tính chất Clean Architecture do xử lý Logic ngay ở controller thay vì Services.
