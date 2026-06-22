# Tổng kết thay đổi Database SmashHub

Dưới đây là tóm tắt các thay đổi đã thực hiện trên CSDL `SmashSportDatabase.sql` để đáp ứng các nghiệp vụ mới:

## 1. Module User & Identity
- Đã thêm trường `Cccd NVARCHAR(25)` vào bảng `Users` để lưu thông tin định danh (mã hóa cấp ứng dụng) theo yêu cầu FR-006.

## 2. Module Facility & Approval Flow
Theo yêu cầu BR-022 về việc cần duyệt các cơ sở mới, đã bổ sung:
- Bảng mới `FacilityStatuses` (với các trạng thái: Pending, Approved, Rejected, Suspended).
- Khóa ngoại `StatusId` trong bảng `Facilities` để kiểm soát trạng thái duyệt.
- Bổ sung trường `BusinessCode` cho mục đích lưu mã số thuế/kinh doanh xác thực Facility Owner.

## 3. Module Court & Dynamic Pricing
Sửa lỗi logic quan trọng liên quan đến cấu hình giá theo BR-038:
- Đã xóa trường `DayOfWeek` khỏi bảng vật lý `Courts` (Sân vật lý không cố định theo thứ).
- Đã chuyển trường `DayOfWeek` sang bảng `CourtCosts` để cho phép chủ sân cấu hình giá động phụ thuộc vào Khung giờ + Ngày trong tuần.

## 4. Module Booking & Payments
Bổ sung các trường phục vụ xử lý dòng tiền (Monetization & Refunds):
- Bảng `Bookings`: Thêm `PlatformFee` (tính phí hoa hồng) và `CancellationReason` (lý do hủy).
- Bảng `Payments`: Thêm `PlatformFee` và `RefundAmount` (giá trị đã hoàn tiền).

## 5. Module Split Bill (Chia tiền)
Trong bảng `ScheduleParticipants` (thành viên tham gia trận đấu), đã thêm:
- `CostToPay`: Lưu số tiền chi tiết mỗi người cần trả (sau khi chia tiền sân + tiền nước/cầu).
- `IsPaid`: Cờ đánh dấu xem thành viên đã thanh toán cho Leader hay chưa.

## 6. Social & Notifications Modules (Mới)
Để đáp ứng luồng FR-122 (Thông báo thời gian thực) và FR-109/FR-115 (Bài đăng tìm người/quảng cáo sân), đã tạo thêm các bảng:
- `Notifications` (Lưu lịch sử thông báo Push/In-app cho User).
- `Posts` (Các bài viết của chủ sân hoặc người dùng).
- `PostComments` (Bình luận bài viết).
- `PostLikes` (Thích bài viết).

## Seed Data
- Cập nhật dữ liệu mẫu (Seed Data) ở cuối file SQL với dữ liệu của bảng `FacilityStatuses`.
