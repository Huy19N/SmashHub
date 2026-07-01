# Báo Cáo Khắc Phục Sự Cố Triển Khai Backend SmashHub

Tài liệu này tổng hợp toàn bộ các vấn đề đã gặp phải, nguyên nhân gốc rễ và các giải pháp đã được áp dụng để hệ thống Backend và Database của dự án SmashHub hoạt động ổn định trên máy chủ.

## 1. Lỗi Khởi Tạo Database (SQL Server)
*   **Triệu chứng:** Container `mssql` liên tục khởi động lại (restart loop) và API báo lỗi không thể kết nối tới cơ sở dữ liệu. Lỗi Entity Framework báo *"Bảng này đã tồn tại"* hoặc *"Cơ sở dữ liệu chưa tồn tại"*.
*   **Nguyên nhân:** 
    *   Thư mục bind mount `/mnt/data/mssql` trên máy chủ Host (Ubuntu) bị thiếu quyền ghi, khiến SQL Server bên trong Docker không thể khởi tạo dữ liệu.
    *   Cấu trúc Database trống hoặc bị xung đột giữa việc chạy script thủ công và cơ chế EF Core Migrations.
*   **Giải pháp đã áp dụng:**
    *   Cấp quyền sở hữu thư mục qua SSH: `sudo chown -R $USER:$USER /mnt/data/*`
    *   Xóa bỏ các file script SQL cấu hình cũ không cần thiết (`Baseline.sql`, `FixMigrationHistory.sql`, `install_docker.sh`).
    *   Thay đổi tên cấu hình Database thành `SmashHub` đồng bộ từ đầu đến cuối.
    *   Viết script Python SSH trực tiếp vào server, nạp file `SmashSportDatabase.sql` thẳng vào container SQL để khởi tạo toàn bộ các bảng, đồng thời chạy script đánh dấu Migration Baseline để tránh lỗi xung đột của EF Core.

## 2. Lỗi MongoDB Crash Liên Tục
*   **Triệu chứng:** Container MongoDB bị sập ngay lập tức sau khi khởi động.
*   **Nguyên nhân:** Container sử dụng tag `mongo:latest` (thường trỏ đến MongoDB 5.0+). Từ phiên bản 5.0, MongoDB yêu cầu CPU phải hỗ trợ tập lệnh AVX. Tuy nhiên, CPU trên server (Main H410M) không hỗ trợ tính năng này dẫn đến việc engine báo lỗi tương thích phần cứng và sập.
*   **Giải pháp đã áp dụng:**
    *   Cập nhật file `docker-compose.yml` hạ cấp (downgrade) phiên bản MongoDB xuống `mongo:4.4` (phiên bản cuối cùng không yêu cầu tập lệnh AVX).

## 3. Lỗi Bảo Mật Secret Code (Hardcoded Passwords)
*   **Triệu chứng:** Mật khẩu của `mssql` và `minio` bị "hardcode" trực tiếp vào file `docker-compose.yml` dạng plaintext, gây nguy hiểm bảo mật khi đưa lên GitHub.
*   **Nguyên nhân:** Thiết lập môi trường mặc định ban đầu.
*   **Giải pháp đã áp dụng:**
    *   Chuyển đổi toàn bộ mật khẩu sang biến môi trường (Ví dụ: `SA_PASSWORD: "$${MSSQL_PASSWORD}"`).
    *   Cập nhật file GitHub Action `.github/workflows/ci-cd.yml` để nhúng các GitHub Secrets vào tệp `.env` trước khi khởi động docker-compose.

## 4. Lỗi CORS "Ảo" và 502 Bad Gateway
*   **Triệu chứng:** Khi giao diện frontend (Vercel) gọi API đăng ký, trình duyệt báo lỗi CORS (No Access-Control-Allow-Origin).
*   **Nguyên nhân:** Đây là một chuỗi lỗi liên hoàn.
    1.  **Lỗi HTTPS Redirect:** Nginx bên ngoài đã đảm nhiệm HTTPS, nhưng file `Program.cs` của Backend vẫn chứa lệnh `app.UseHttpsRedirection();`. Điều này ép trình duyệt redirect sang HTTPS thêm lần nữa khi kiểm tra preflight (OPTIONS), khiến CORS thất bại (CORS không cho phép redirect).
    2.  **Lỗi Proxy Nginx Sai Cổng (502):** Trong tệp cấu hình Nginx của domain `tad-min.io.vn`, `proxy_pass` bị cấu hình nhầm trỏ vào cổng `5000` (cổng mặc định của kestrel), trong khi container Docker của ứng dụng thực tế đang phơi bày ở cổng `8080`. API do đó không nhận được request nào và Nginx báo 502.
*   **Giải pháp đã áp dụng:**
    *   Xóa bỏ lệnh `app.UseHttpsRedirection();` và các middleware ép buộc HTTPS dư thừa trong mã nguồn `Program.cs`.
    *   Truy cập SSH vào server, sửa file `/etc/nginx/sites-available/tad-min.io.vn` đổi từ `http://127.0.0.1:5000` thành `http://127.0.0.1:8080` và khởi động lại Nginx.
    *   Xác minh các lớp bảo vệ: Middleware kiểm tra bảo mật (yêu cầu khóa App Mobile hoặc Origin Header) trong `Program.cs` hoạt động chính xác (trả về HTTP 403 khi gọi trực tiếp không có nguồn gốc và phản hồi đúng đắn đối với Header Origin từ Vercel).

---

## 5. Lỗi Database Connection (Login failed for user 'sa')
*   **Triệu chứng:** API trả về lỗi HTTP 500 khi gọi endpoint đăng ký, console của database hoặc API báo lỗi "Login failed for user 'sa'".
*   **Nguyên nhân:** Trong file `docker-compose.yml`, các biến môi trường được thiết lập với cú pháp `$${MSSQL_PASSWORD}` (2 dấu `$$`). Trong Docker Compose, `$$` được dùng để escape (thoát) ký tự `$`, khiến giá trị password thực tế được truyền vào chuỗi kết nối bị hiểu là chuỗi nguyên bản `"${MSSQL_PASSWORD}"` thay vì lấy giá trị bí mật từ file `.env` được tạo ra qua CI/CD.
*   **Giải pháp đã áp dụng:**
    *   Sửa lỗi cú pháp trong `docker-compose.yml` thành cấu trúc 1 dấu `$` để Docker Compose có thể nội suy (interpolate) đúng giá trị từ biến môi trường (Ví dụ: `SA_PASSWORD: "${MSSQL_PASSWORD}"` và `Password=${MSSQL_PASSWORD}`).

---
*Tất cả cấu hình hạ tầng hiện tại đã hoạt động thông suốt, các endpoint API đều phản hồi chính xác và được bảo vệ đúng cách.*
