# Quickstart Validation Guide

## Mục đích
Hướng dẫn các bước để xác thực (validate) tính năng Chia tiền Tùy chỉnh (Custom Cost Splitting) hoạt động đúng đắn End-to-End từ giao diện Android.

## Yêu cầu chuẩn bị
- Backend đang chạy cục bộ hoặc trỏ về môi trường staging.
- Đăng nhập vào Android App bằng tài khoản có vai trò "Trưởng nhóm" (Leader).
- Đã tạo ít nhất 1 trận đấu (Schedule) đã điểm danh đủ người.

## Scenario 1: Validate giao diện chia tiền
1. Mở màn hình Chi tiết lịch chơi -> Nhấn nút **Chia tiền**.
2. Kiểm tra phần "CHẾ ĐỘ CHIA TIỀN" (Split Mode), hệ thống phải có 3 tùy chọn:
   - Chia đều (Auto)
   - Mức cố định (Fixed)
   - **Tùy chỉnh (Custom)** (MỚI)
3. Chuyển sang chọn "Tùy chỉnh". Giao diện danh sách thành viên bên dưới chuyển thành các form nhập liệu: "Tiền sân" và "Phụ phí".

## Scenario 2: Validate Thuật toán lưu trữ
1. Chọn chế độ "Tùy chỉnh".
2. Tổng tiền sân gốc của trận là 300k, 3 người chơi.
3. Người 1: Sân 100k, Nước 20k -> Tổng mong muốn 120k.
4. Người 2: Sân 50k, Nước 10k -> Tổng mong muốn 60k.
5. Người 3: Sân 150k, Nước 50k -> Tổng mong muốn 200k.
6. Nhấn nút "TÍNH TOÁN & CHIA PHÍ".
7. Kiểm tra Toast thông báo thành công.
8. Trở ra màn hình chi tiết, hoặc reload danh sách người chơi, kiểm tra số tiền `CostToPay` có khớp chính xác: Người 1 = 120k, Người 2 = 60k, Người 3 = 200k hay không.
9. Kiểm tra trong Database (Bảng `Schedules`), cột `ExtraFee` phải bằng đúng 80k.
