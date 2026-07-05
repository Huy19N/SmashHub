# Phase 0: Research (UI Redesign)

## Component Mapping & Protected Assets

- **`HomePage.jsx`:** Chứa Hero section với video background. Mã nguồn điều khiển video (sử dụng `requestAnimationFrame` và `handleVideoCanPlay`) là **PROTECTED ASSET** (Tài sản được bảo vệ theo Constitution Rule VI). Chỉ được phép xóa khối text `Cuộn để khám phá` và các thẻ eyebrow, tuyệt đối KHÔNG đụng vào ref video và logic đồng bộ hóa cuộn.
- **`CollectionsSection.jsx`:** Đang sử dụng slider ngang trên màn hình lớn. Cần loại bỏ eyebrow "Bộ Sưu Tập" và background blob (`bg-emerald-400/5 filter blur-[120px]`). 
- **`PremiumSection.jsx`:** Cần loại bỏ eyebrow "Nâng tầm trải nghiệm", loại bỏ 2 khối cầu sáng chớp tắt (orbs `bg-emerald-400/10 filter blur-[100px] animate-pulse-slow`). Đảm bảo các thẻ giá (Pricing Cards) responsive tốt trên màn hình nhỏ.
- **`ContactSection.jsx`:** Sửa nội dung nút CTA thành "Đặt Sân Ngay" (hoặc từ tương đương được đồng bộ trên toàn trang) để tránh phân mảnh Intent người dùng. Loại bỏ eyebrow.
- **`App.jsx`:** Nút Theme Switcher đang được render dưới dạng nút nổi lơ lửng (Floating Action Button). Tính năng này vi phạm rule về UI cao cấp, cần được dời vào bên trong thanh điều hướng chính (Top Navbar) hoặc Navigation Drawer trên Mobile.

## Decision

- **Decision**: Thực hiện refactor JSX trực tiếp bằng cách lược bỏ các class Tailwind gây hại (như `animate-pulse`, `blur-3xl`, `animate-pulse-slow`), dọn dẹp các thẻ `<span className="font-label">` thừa thãi (eyebrows & decorative numbering).
- **Rationale**: Đáp ứng đúng yêu cầu của bản Spec về việc loại bỏ các pattern generic (AI-slop tells). Việc dọn dẹp class sẽ giúp cây DOM nhẹ hơn và cải thiện hiệu năng (do trình duyệt không phải tính toán filter/blur ở mỗi khung hình).
- **Alternatives considered**: Viết lại toàn bộ cấu trúc Component - Đã bị loại bỏ vì tốn thời gian và rủi ro ảnh hưởng đến Protected Asset (Video Scroll Sync). Việc chỉ điều chỉnh styling và cắt bỏ (pruning) là phương án tối ưu.
