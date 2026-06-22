# Hướng Dẫn Luồng Chạy Hệ Thống & Các API SmashHub

Dựa trên các tài liệu yêu cầu (Business Flow, Business Requirements, Functional Requirements) và cấu trúc hệ thống đã xây dựng, dưới đây là luồng hoạt động tổng thể của nền tảng SmashHub cùng với chức năng và cách sử dụng của từng API.

---

## 1. Luồng Xác Thực & Quản Lý Tài Khoản (Auth & Identity)
**Mục đích:** Đăng ký, đăng nhập và phân quyền cho 3 đối tượng chính: User (Người chơi), Facility Owner (Chủ sân) và Admin.

*   `POST /api/auth/register`: Người dùng đăng ký tài khoản (chọn Role: Player hoặc FacilityOwner).
*   `POST /api/auth/verify-email`: Xác thực tài khoản qua mã gửi về Email.
*   `POST /api/auth/login`: Đăng nhập, hệ thống trả về `AccessToken` (JWT) và `RefreshToken`. Cần đính kèm Token này vào header `Authorization: Bearer <token>` cho các API khác.
*   `POST /api/auth/refresh`: Cấp lại Access Token mới khi token cũ hết hạn.

---

## 2. Luồng Quản Lý Cơ Sở Dữ Liệu Sân (Dành Cho Chủ Sân & Admin)
**Mục đích:** Chủ sân đưa sân lên nền tảng, thiết lập giá và chờ Admin phê duyệt.

*   `POST /api/facilities`: Chủ sân tạo mới một Cơ sở (Facility). Cần cung cấp hình ảnh, địa chỉ, tiện ích. Trạng thái ban đầu là `Pending`.
*   `PUT /api/admin/facilities/{id}/approve`: Admin gọi API này để duyệt Cơ sở. Chỉ khi được duyệt, Cơ sở mới hiển thị với người chơi.
*   `POST /api/courts`: Thêm các sân nhỏ (Court) bên trong Cơ sở (VD: Sân số 1, Sân số 2).
*   `POST /api/court-costs`: Thiết lập giá động (**Dynamic Pricing**). Chủ sân cấu hình giá theo Ngày trong tuần (`DayOfWeek`), Khung giờ bắt đầu/kết thúc (`StartTime`, `EndTime`). Hệ thống tự động chặn nếu các khung giờ bị trùng lặp (Overlap).

---

## 3. Luồng Đặt Sân & Thanh Toán (Booking & Payment)
**Mục đích:** Người chơi tìm sân trống, đặt lịch và thanh toán tiền trực tiếp.

*   `GET /api/bookings/available-time`: Tìm kiếm các sân còn trống theo ngày, môn thể thao, thành phố, quận.
*   `POST /api/bookings`: User thực hiện đặt sân. Hệ thống tính toán tổng tiền (`TotalCost`) bằng cách quét qua các block giá (CourtCost) tương ứng với khung giờ đặt. Khóa chống đặt trùng được kích hoạt. Trạng thái Booking là `Pending`.
*   `POST /api/payments/create`: Khởi tạo yêu cầu thanh toán (tích hợp MoMo/VNPay/PayOS).
*   `POST /api/payments/webhook`: Webhook nhận phản hồi từ cổng thanh toán. Nếu thành công, trạng thái Booking chuyển sang `Confirmed`. Tiền được cộng vào Ví Cơ Sở (Facility Wallet) sau khi trừ Phí nền tảng (Platform Fee).

---

## 4. Luồng Quản Lý Đội Nhóm & Đăng Ký Gói Cước (Team & Subscription Limits)
**Mục đích:** Xây dựng cộng đồng, tạo nhóm chơi. Giới hạn tính năng theo gói cước (Free, Basic, Pro).

*   `POST /api/teams`: Tạo nhóm mới. (Kiểm tra giới hạn số nhóm tối đa dựa trên gói cước: Free=5, Basic=10, Pro=Unlimited).
*   `POST /api/teams/{teamId}/invites`: Tạo mã mời/link mời gia nhập nhóm.
*   `POST /api/teams/invites/accept`: Thành viên nhập mã mời để vào nhóm. (Hệ thống kiểm tra giới hạn số lượng thành viên của nhóm dựa theo gói cước của Trưởng Nhóm: Free=15, Basic=30, Pro=100).
*   `POST /api/teams/{teamId}/messages`: Gửi tin nhắn trong nhóm. (Có kiểm tra giới hạn gửi file hình ảnh/video theo gói cước: Free cấm gửi, Basic=5 file/ngày, Pro=Không giới hạn).

---

## 5. Luồng Lên Lịch Chơi & Matchmaking (Tìm Đối Thủ)
**Mục đích:** Quản lý buổi chơi nội bộ hoặc tìm đối thủ cọ xát.

*   `POST /api/teams/{teamId}/schedules`: Trưởng nhóm biến một Booking (lượt đặt sân) thành Lịch Chơi (Schedule) nội bộ để các thành viên đăng ký.
*   `POST /api/schedules/{scheduleId}/participants`: Thành viên trong nhóm đăng ký tham gia (Join) buổi chơi.
*   `POST /api/matchmaking/challenges`: Trưởng nhóm đăng bài tìm đối thủ, đính kèm Lịch Chơi và chọn `IsCostSplit = true` (Muốn chia đôi tiền sân).
*   `GET /api/matchmaking/challenges/active`: Trả về danh sách các bài tìm đối thủ. Thuật toán **Priority Sorting** sẽ đẩy bài của gói Pro lên đầu, sau đó là Basic, cuối cùng là Free.
*   `POST /api/matchmaking/acceptances`: Đội đối thủ nộp đơn xin ghép đấu.
*   `PUT /api/matchmaking/acceptances/{id}/respond`: Trưởng nhóm duyệt đội đối thủ. Nếu duyệt, hệ thống tạo hóa đơn thanh toán 50% tiền sân bắt đội đối thủ phải trả.

---

## 6. Luồng Vận Hành Sau Trận (Điểm Danh & Split Bill)
**Mục đích:** Tự động hóa quá trình "chia tiền" sau khi đánh xong để tránh sai sót.

*   `PATCH /api/schedules/{id}/participants/{userId}/attendance`: Sau trận, Trưởng nhóm điểm danh ai đi (`IsAttended = true`), ai vắng (`IsAttended = false` tức No-show).
*   `POST /api/schedules/{scheduleId}/calculate-split-bill`: 
    * Trưởng nhóm nhập số tiền phụ phí phát sinh (Tiền nước, tiền ống cầu).
    * **Logic xử lý:** Hệ thống tự động tính: Những người báo vắng (No-show) chỉ cần trả tiền sân. Những người có mặt phải trả cả tiền sân + tiền phụ phí chia đều.

---

## 7. Luồng File Storage (MinIO) & Mạng Xã Hội
**Mục đích:** Xử lý file phi cấu trúc và tương tác xã hội.

*   `POST /api/files/upload`: Tải file (Ảnh, Video) lên MinIO Bucket. Trả về `FileId`.
*   `GET /api/files/{fileId}`: Trả về JSON chứa **Presigned URL** (Link tải trực tiếp có thời hạn) thay vì luồng byte, giúp tải siêu nhanh và giảm tải cho Server.
*   `POST /api/social/posts`: Tạo bài viết lên tường (Timeline) của cá nhân, đội bóng hoặc đánh giá cơ sở.
*   `POST /api/social/posts/{id}/like` & `/comments`: Tương tác Thích và Bình luận.

---

## 8. Luồng Admin (Quản Trị Hệ Thống)
**Mục đích:** Quản lý vận hành và dòng tiền.

*   `GET /api/admin/statistics`: Lấy thống kê tổng quan (Doanh thu, Số lượng Booking, Biểu đồ tăng trưởng).
*   `PUT /api/admin/settings/{key}`: Chỉnh sửa cấu hình hệ thống (Ví dụ: Đổi biến `PlatformFee` từ 5% lên 10%).
*   `GET /api/admin/payout-requests`: Xem danh sách yêu cầu Rút Tiền từ Ví của các Chủ sân.
*   `PUT /api/admin/payout-requests/{id}/approve`: Duyệt lệnh rút tiền, hệ thống trừ tiền trong ví điện tử của Chủ sân và Admin thực hiện chuyển khoản ngoài đời thực.

---
**Tổng kết quy trình một người chơi (User Journey):** 
Đăng nhập -> Nạp tiền/Mua gói Subscription -> Tạo Team -> Tìm Sân Trống -> Thanh Toán (Giữ chỗ) -> Lên lịch trong Team -> Tìm Đối Thủ (Matchmaking - nếu thiếu người) -> Đi đánh cầu -> Trưởng nhóm điểm danh -> Hệ thống chia tiền tự động (Split Bill).
