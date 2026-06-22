# Database Redesign & Backend Refactoring Walkthrough

## 1. Overview
The database for the SmashClub project has been completely redesigned to ensure third normal form (3NF), resolve circular dependencies, and support real-world business flows for badminton facility management and social networking. The backend `.NET Core Web API` has been fully refactored to align with this new schema.

## 2. Key Architectural Changes

### 2.1 Database Schema Restructuring
- **Entities Renamed & Separated:** Replaced large monolithic tables with precise entities (`StoredFile`, `FacilityOperatingHour`, `FacilityWallet`, etc.).
- **Social Features Added:** Added `Posts`, `PostLikes`, `PostComments` entities to support a fully-fledged social network for users and teams.
- **Improved Settings:** Extracted hardcoded settings into a flexible `SystemSettings` table.
- **Unified Notifications:** Added a comprehensive `Notifications` table.

### 2.2 Backend Layers Updated
- **Repositories:** Created `UnitOfWork` references and individual repositories for new entities (`NotificationRepository`, `PostRepository`, `SystemSettingRepository`, etc.).
- **Data Transfer Objects (DTOs):** Added over a dozen DTOs for structured data flow (e.g. `SystemSettingDto`, `PostDto`, `UpdateSplitBillRequest`).
- **Services:**
  - `BookingService`: Now pulls `PLATFORM_FEE_PERCENTAGE` dynamically from `SystemSettings`.
  - `FacilityService`: Included logic to `Approve` or `Reject` facilities and set default statuses to `Pending`.
  - `ScheduleService`: Implemented Bill Splitting capabilities for team leaders (`CostToPay` and `IsPaid`).
  - `SocialService`: Created to handle posts, comments, and likes.
  - `NotificationService`: Implemented integration with SignalR Hubs to push notifications to users instantly.
  - `SystemSettingService`: Created a dedicated service to handle global configuration key-values.

## 3. Business Logic Implementation

2. **Matchmaking & Split Bill**
   - Added endpoint để tự động chia tiền giữa các thành viên sau một buổi chơi (`CalculateAndSaveSplitBillAsync`).
   - Thành viên No-show chỉ phải chịu phí sân, không chịu phụ phí (nước, cầu).
   - Tự động chia 50% tiền sân với đối thủ (Matchmaking) bằng cách tích hợp vào luồng thanh toán.
   - Ưu tiên hiển thị bài đăng tìm đối thủ của người dùng có gói Premium hoặc Standard lên đầu (ưu tiên Premium trước).

3. **Team Management & Subscription Limits**
   - **Giới hạn tham gia nhóm:** Free (5 nhóm), Standard/Basic (10 nhóm), Premium/Pro (không giới hạn).
   - **Giới hạn thành viên nhóm:** Kiểm tra theo gói của Trưởng Nhóm: Free (tối đa 15 người), Standard (30 người), Premium (100 người).
   - **Giới hạn gửi ảnh vào chat nhóm:** Gói Basic chỉ được gửi 5 hình ảnh/ngày. Gói Pro không giới hạn. Gói Free không được gửi file phương tiện.

4. **Dynamic Pricing (CourtCost)**
   - Cho phép định giá sân tùy thuộc vào Thứ trong tuần (`DayOfWeek`), và khung giờ (`StartTime` - `EndTime`).
   - Kiểm tra overlap khung giờ khi tạo giá mới.
   - Tự động tính tiền booking dựa vào khoảng thời gian chạm vào các block giá khác nhau.

### Cập nhật Database & Models
- `CourtCost` đã được cập nhật thêm các trường thời gian để áp dụng Dynamic Pricing.
- Đã thêm các Repository helper method.
- Thêm `CalculateSplitBillRequest` DTO.

## 5. Storage / File Handling
- Chuyển đổi từ việc lưu file dạng mảng byte (`varbinary(max)`) sang hệ thống lưu trữ ngoài.
- Tích hợp **MinIO** làm object storage (`tad-min.io.vn:9000`).
- Update `FileService` để sử dụng `MinioClient`:
  - Upload file lên bucket `smashhub2026`.
  - Sinh **Presigned URL** (hết hạn trong 1 giờ) trả về cho client thay vì tải luồng byte.
- Các API trả về file (`GET /api/files/{fileId}`) giờ đây trả về JSON chứa `Url`, `OriginalFileName`, `MimeType` đúng theo yêu cầu.

## Verification
- Hệ thống backend đã được biên dịch lại thành công (`dotnet build` báo 0 Error).
- Swagger (nếu có khởi chạy) sẽ hiển thị đầy đủ các endpoint mới như `POST /api/schedules/{scheduleId}/calculate-split-bill`.
- Các API trả về file (`GET /api/files/{fileId}`) giờ đây trả về JSON chứa `Url`, `OriginalFileName`, `MimeType` đúng theo yêu cầu.

### 2.3 API Controllers Added/Updated
- **`AdminController`:** Extended to allow admins to approve/reject pending facilities and manage `SystemSettings`.
- **`SocialController`:** Added complete API surface to create posts, add comments, manage likes, and get timeline feeds by facility or team.
- **`NotificationsController`:** Added endpoints for users to retrieve and mark notifications as read.
- **`ScheduleParticipantsController`:** Extended with an endpoint for leaders to update split bills for team members.

## 3. Verification & Validation
- **Build Verification:** Verified the complete compilation of the `.NET Web API` application. Fixed all namespace, model reference, and type conversion errors. The application currently compiles successfully with 0 errors.

> [!TIP]
> The platform fee is now fully configurable via the `SystemSettings` table, and the SignalR `NotificationHub` has been set up at the `/hub/notifications` endpoint to serve real-time notifications to the frontend clients.
