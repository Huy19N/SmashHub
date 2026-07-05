# Quickstart & Validation

Hướng dẫn chạy và kiểm thử trực quan các thay đổi UI.

1. **Khởi chạy ứng dụng:**
   - Mở terminal trong thư mục `Website`.
   - Chạy lệnh: `npm run dev`.

2. **Kiểm tra trực quan (Visual Verification):**
   - **Hero Section:** Cuộn trang để đảm bảo Video scroll vẫn phải hoạt động mượt mà (Protected Asset). Xác nhận chữ "Cuộn để khám phá" và mũi tên nảy (`animate-bounce`) không còn.
   - **Background Effects:** Cuộn qua các section `PremiumSection` và `CollectionsSection`, xác nhận không còn bất kỳ đốm sáng mờ (blob) nào chớp tắt (pulse) đằng sau các component.
   - **Typography (Eyebrows):** Không còn các dòng chữ in hoa nhỏ vô nghĩa nằm trên tiêu đề như `01 / Sân Đấu` hay `Nâng tầm trải nghiệm`.
   - **CTA Intent:** Xác nhận mọi nút bấm dẫn đến trang đặt sân đều chung một dòng text duy nhất.
   - **Theme Switcher:** Nút đổi chế độ sáng/tối (Dark Mode) không còn trôi nổi ở góc dưới bên trái màn hình.

3. **Kiểm tra Mobile Responsive (FR-010):**
   - Bật chế độ thiết bị di động (F12 -> Device Toolbar -> Chọn kích thước iPhone/Android).
   - Kiểm tra đảm bảo các thẻ trong `PremiumSection` và `CollectionsSection` tự động xếp dọc (flex-col) hoặc trượt ngang gọn gàng, không bị tràn (overflow) ra khỏi màn hình.
