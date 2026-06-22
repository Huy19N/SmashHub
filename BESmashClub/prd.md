# Product Requirements Document (PRD) - SmashHub

## 1. Tổng quan dự án (Project Overview)
* **Tên dự án**: SmashHub
* **Mô tả ngắn**: Nền tảng (Mobile App & Web) tích hợp đặt sân thể thao, tìm đối thủ, quản lý đội nhóm, thanh toán/chia tiền và quản lý vận hành cơ sở.
* **Giải pháp**: Xây dựng hệ thống Client-Server phân quyền theo người dùng, chủ sân và quản trị viên nhằm số hóa toàn diện vòng đời từ lúc tìm sân, chơi thể thao đến thanh toán và đánh giá.

---

## 2. Mục tiêu & Vấn đề giải quyết (Objectives & Problems)
* **Vấn đề của Người dùng (User)**: Trải nghiệm đặt sân, tìm đối thủ, thanh toán và chia tiền trong đội nhóm hiện đang bị phân mảnh, gây khó khăn trong việc tổ chức.
* **Vấn đề của Chủ sân (Facility Owner)**: Gặp khó khăn trong việc quản lý lịch trống giữa online và offline, thiếu công cụ thiết lập giá linh hoạt (theo giờ/ngày/môn) và thiếu các kênh marketing hiệu quả.
* **Mục tiêu kỹ thuật**: Giải quyết các bài toán về tính toàn vẹn dữ liệu (chống đặt trùng sân), thanh toán trực tiếp, bảo vệ quyền riêng tư và thông báo thời gian thực.

---

## 3. Phạm vi & Đối tượng (Scope & Stakeholders)
* **Đối tượng (Roles)**: 
    * **Admin**: Quản trị nền tảng, duyệt sân, quản lý tài chính và xử lý vi phạm.
    * **Facility Owner**: Quản lý thông tin sân, giá cả, lịch đặt và doanh thu.
    * **User**: Người chơi thể thao thực hiện đặt sân, tạo đội, tìm đối thủ và thanh toán.
* **Nền tảng (Platforms)**: Mobile App (iOS/Android) cho User và Facility Owner; Web Admin Portal cho Admin và Facility Owner.
* **Tích hợp (Integrations)**: Tích hợp cổng thanh toán MoMo, MBBank, PayOS.

---

## 4. Luồng nghiệp vụ cốt lõi (Core Business Flows)
* **Quản lý cơ sở & Đặt giá**: Chủ sân đăng ký cơ sở (cần Admin duyệt) và thiết lập giá động theo sự kết hợp của môn thể thao, sân cụ thể, ngày trong tuần và khung giờ.
* **Đặt sân & Thanh toán**: Người dùng tìm kiếm khung giờ trống, hệ thống thực hiện khóa chống trùng (排他ロック) và tiền được thanh toán trực tiếp (Direct Payment) đến cổng nhận tiền của chủ sân.
* **Quản lý đội nhóm & Ghép cặp (Matchmaking)**: Người dùng tạo đội, mời thành viên. Khi đã có lịch đặt sân, đội có thể tạo tin tìm đối thủ. Nếu ghép cặp thành công, chi phí sân được chia đều cho 2 đội.
* **Vận hành sau trận**: Tự động kích hoạt luồng điểm danh người tham gia (ghi nhận No-show), tính toán các khoản phụ phí (nước, cầu/bóng) và chia đều tiền (Split Bill) cho các thành viên tham gia.
* **Thu phí Nền tảng (Monetization)**: Hệ thống thu phí theo hai luồng: Thu phí hoa hồng trên mỗi lượt đặt sân thành công (5-10%) và thu phí gói đăng ký tháng (Subscription) của User (Free/Standard/Premium) và Facility Owner.

---

## 5. Yêu cầu chức năng chính (High-level Functional Requirements)
* **Quản lý định danh (Identity & Access)**: Hệ thống cung cấp luồng đăng nhập, đăng ký và cập nhật hồ sơ (bao gồm CCCD được mã hóa).
* **Quản lý Booking (Schedule Management)**: Đồng bộ lịch đặt sân online trên app và lịch offline do chủ sân tự nhập, với quy tắc tuyệt đối không cho phép 2 lượt đặt trùng khung giờ trên cùng 1 sân.
* **Giao tiếp (Communication)**: Tích hợp Chat nhóm (hỗ trợ văn bản, hình ảnh, video tùy theo gói cước) và hệ thống Push Notification/SignalR để thông báo thời gian thực.
* **Quản trị nội dung & Đánh giá**: Tính năng chấm điểm 5 sao, bình luận cơ sở vật chất và cho phép chủ sân đăng bài quảng cáo (Boost posts).

---

## 6. Yêu cầu phi chức năng (Non-Functional Requirements)
| Hạng mục | Tiêu chuẩn |
| :--- | :--- |
| **Hiệu năng (Performance)** | Phản hồi API thông thường dưới 2 giây (95th percentile); quá trình đặt sân đảm bảo 0 ca lỗi trùng lịch (Double-booking). |
| **Tính khả dụng (Availability)** | Uptime đạt 99.5%; thời gian phục hồi mục tiêu (RTO) dưới 4 giờ; điểm khôi phục dữ liệu (RPO) 15 phút. |
| **Bảo mật (Security)** | Mã hóa dữ liệu cá nhân (CCCD, SĐT) và mã hóa giao dịch tài chính (RSA/AES); tuân thủ OWASP Top 10. |
| **Mở rộng (Scalability)** | Backend .NET Web API và SignalR có khả năng mở rộng ngang (Horizontal scaling); lưu trữ file bằng MinIO. |

---

## 7. Các điểm nghẽn nghiệp vụ cần làm rõ (Open Items / TBD)
*Lưu ý từ BA: Dưới đây là các luồng nghiệp vụ quan trọng đang thiếu định nghĩa (※要確認), cần chốt với Product Owner trước khi bắt đầu thiết kế chi tiết.*

* **Chính sách Hủy & Hoàn tiền**: Chưa có quy định rõ về thời hạn hủy sân (Cancelation policy), tỷ lệ hoàn tiền và cách tính phí nền tảng khi hủy.
* **Định nghĩa trạng thái**: Cần định nghĩa chính xác vòng đời trạng thái của Booking (VD: Pending, Confirmed, Completed, Canceled) và Payment.
* **Quy tắc Matching**: Cần làm rõ thuật toán ưu tiên Matching cho hạng Standard/Premium và cách tính toán Rank value / Level của một đội.
* **Quy trình đối soát (Reconciliation)**: Mặc dù tiền đặt sân vào thẳng tài khoản Chủ sân (Direct Payment), nhưng cách nền tảng truy thu lại phí hoa hồng 5-10% (trừ trực tiếp hay xuất hóa đơn thu sau) chưa được xác định rõ.