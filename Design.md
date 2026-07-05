# SmashClub - Design Audit Report

Dựa trên **Redesign Protocol (Section 11)** của `design-taste-frontend`, dưới đây là kết quả audit giao diện hiện tại của Website SmashClub (chủ yếu dựa trên `HomePage.jsx` và các component con) ở chế độ **Preserve** (Giữ gìn thương hiệu).

## 1. Phân Tích Hiện Trạng (Dial Reading)
- **DESIGN_VARIANCE (5-6):** Bố cục khá an toàn, chủ yếu sử dụng dạng chữ ở một bên - khối nội dung ở bên còn lại, và phần Hero có video full màn hình.
- **MOTION_INTENSITY (7-8):** Sử dụng rất nhiều hiệu ứng chuyển động liên tục (`animate-pulse-slow`, `animate-bounce`, AOS scroll fade-ins).
- **VISUAL_DENSITY (4):** Không gian khá thoáng, chữ lớn (`text-5xl` đến `text-8xl`), sử dụng nhiều khoảng trắng.
- **Brand Tokens:**
  - Màu chủ đạo: Emerald/Green (`#0BE860`, `#9CF5D0`)
  - Nền: Dark Slate (`#0b0f19`)
  - Font: `Outfit` (sử dụng cho display, sans, label)

---

## 2. Danh Sách Pattern "Generic" Cần Sửa (Anti-Slop Rules)

Dưới đây là các đặc điểm "AI default" đã xuất hiện trong mã nguồn hiện tại, làm giảm đi cảm giác cao cấp (premium) của sản phẩm. Chúng cần được loại bỏ hoặc thay thế.

### 2.1. Lạm dụng Eyebrow (Nhãn phụ)
- **Vấn đề:** Có đến 6-7 sections liên tiếp đều sử dụng 1 dòng chữ in hoa nhỏ phía trên tiêu đề chính (ví dụ: `Sân đấu đẳng cấp`, `01 / Sân Đấu`, `02 / Cộng Đồng`, `Bắt đầu ngay`, `Nâng tầm trải nghiệm`, `Bộ Sưu Tập`, `Liên hệ với chúng tôi`). *Vi phạm rule Section 4.7.*
- **Đề xuất sửa:** Áp dụng nghiêm ngặt quy tắc "Tối đa 1 eyebrow cho mỗi 3 section". Nên bỏ hẳn các eyebrow không mang lại thông tin cụ thể (chẳng hạn "Bắt đầu ngay", "Nâng tầm trải nghiệm").

### 2.2. Decorative Section Numbering (Đánh số trang trí vô nghĩa)
- **Vấn đề:** Sử dụng `01 / Sân Đấu` và `02 / Cộng Đồng` làm eyebrow. Đây là một pattern trang trí nhận diện rõ thiết kế của AI. *Vi phạm rule Section 14.*
- **Đề xuất sửa:** Xóa bỏ hoàn toàn các con số thứ tự trang trí này.

### 2.3. Perpetual Micro-Interactions & Glowing Blobs
- **Vấn đề:** Rất nhiều thẻ background (`div`) đang sử dụng hiệu ứng ánh sáng (glowing blobs) chớp tắt liên tục làm phiền mắt (`bg-primary/20 blur-3xl animate-pulse-slow`). Ngoài ra, màn hình preloader cũng lạm dụng `animate-pulse` ở nhiều chi tiết.
- **Đề xuất sửa:** Cắt giảm tối đa các đốm sáng nhấp nháy vô nghĩa. Nếu section là thông tin tĩnh, hãy để nó tĩnh. Chỉ dùng motion cho các phản hồi cần thiết từ người dùng (hover/click) hoặc scroll-reveal.

### 2.4. Scroll Cues (Gợi ý cuộn trang)
- **Vấn đề:** Ở khu vực Hero có cụm từ "Cuộn để khám phá" kèm biểu tượng mũi tên nảy lên (`animate-bounce`). *Vi phạm rule Section 14.*
- **Đề xuất sửa:** Xóa hoàn toàn cụm này. Với thiết kế UI hiện đại, người dùng mặc định biết cách cuộn để xem trang web.

### 2.5. Zigzag Alternation (Bố cục lặp lại theo hình Zigzag)
- **Vấn đề:** Section 2 (Sân Đấu) sắp xếp "Nội dung trái, Box phải" và ngay sau đó Section 3 (Cộng Đồng) sắp xếp "Box trái, Nội dung phải". Việc xen kẽ lặp lại 50/50 tạo nên một bố cục template cơ bản.
- **Đề xuất sửa:** Đổi cấu trúc của 1 trong 2 section. Ví dụ: Section 3 có thể sử dụng layout Bento Box, thẻ ngang, hoặc 3 cột hiển thị thông tin thay vì lặp lại việc chia đôi màn hình như Section 2.

### 2.6. Duplicate CTA Intent (Trùng lặp ý định của Nút bấm)
- **Vấn đề:** Ở Hero có nút "Đặt Sân Ngay", trong khi ở phần CTA dưới cùng lại dùng nút "Đặt Sân Đầu Tiên". Cả hai đều có cùng chung một mục đích (dẫn đến trang booking) nhưng lại sử dụng nhãn dán (label) khác nhau.
- **Đề xuất sửa:** Thống nhất một label duy nhất (ví dụ: "Đặt Sân Ngay") cho cùng một mục đích xuyên suốt trên trang.

### 2.7. Floating Theme Switcher (Nút đổi giao diện nổi lơ lửng)
- **Vấn đề:** Nút tròn đổi màu Light/Dark ở góc dưới màn hình mang lại cảm giác của một template. *Vi phạm rule Section 4.11 (Page Theme Lock).*
- **Đề xuất sửa:** Di chuyển nút đổi theme (chế độ sáng/tối) tích hợp lên thanh Navigation chính, hoặc khóa (lock) trang web mặc định ở giao diện Dark để đảm bảo tính điện ảnh, nhất quán của thương hiệu.

### 2.8. Lạm dụng nhấn mạnh chữ nghiêng bằng Gradient
- **Vấn đề:** Đang có sự lạm dụng trong việc dùng `<span className="text-gradient-primary italic">...</span>` cho phần lớn tiêu đề chính (`GIỚI HẠN`, `Tốc Độ & Sức Bật`, `Bảng Xếp Hạng`, `Đam Mê`). Việc lặp lại thủ thuật typography này làm mất đi tính độc đáo ở từng phần chữ.
- **Đề xuất sửa:** Chỉ dùng in nghiêng đổi màu Gradient cho những thông điệp thực sự có sức hút nhất (chẳng hạn ở phần Hero). Các section còn lại nên đổi qua việc bôi đậm, đổi font-weight hoặc dùng typography thuần túy.

---

## 3. Hướng Giải Quyết (Refactoring Plan)
- **Bảo lưu:** Giữ lại toàn bộ hiệu ứng nền video (scrollytelling) ở phần Hero vì được code và xử lý animation mượt mà. Giữ font chữ `Outfit` và hệ màu.
- **Hành động cần làm đối với Code:**
  1. Loại bỏ các `<span className="... tracking-widest uppercase font-label">` thừa ở phần lớn các component (đặc biệt là 01, 02).
  2. Bỏ các block `<div className="... animate-pulse-slow ... blur-3xl" />`.
  3. Bỏ khối HTML `Cuộn để khám phá`.
  4. Đổi cấu trúc của Section Cộng Đồng (`Section 3`) sang một dạng layout khác để phá vỡ bố cục zigzag.
  5. Sửa chữ "Đặt Sân Đầu Tiên" ở `ContactSection/CTA` thành "Đặt Sân Ngay".
  6. Xóa `Floating Theme Switcher` ở cuối trang (chuyển logic lên navbar).
