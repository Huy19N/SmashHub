# Phase 0: Research

## Lựa chọn thư viện biểu đồ cho React
**Decision**: Chọn thư viện `recharts`.
**Rationale**: `recharts` là thư viện xây dựng riêng cho React (composability tốt, dùng SVG), hỗ trợ tốt việc tùy chỉnh giao diện (Custom Tooltip, Custom Axis) và animation mượt mà. Kích thước nhẹ, tích hợp dễ dàng với Tailwind CSS (thông qua truyền biến CSS variables). Hỗ trợ responsive tốt và dễ dàng bắt sự kiện click (cho tính năng Drill-down).
**Alternatives considered**: 
- `Chart.js` / `react-chartjs-2`: Render bằng Canvas, hiệu năng cực tốt với hàng chục ngàn data point, nhưng khó custom UX/UI phức tạp bằng HTML/CSS (khó style tooltip giống Figma thiết kế HTML).
- `ApexCharts`: Hỗ trợ zoom/pan tốt out-of-the-box, nhưng API phức tạp hơn và dung lượng lớn, đôi khi gặp lỗi re-render trong môi trường React 19 Strict Mode.

## Xử lý Zoom/Pan cho Recharts
**Decision**: Tự triển khai Custom Reference Area / Brush kết hợp với State để xử lý zoom/pan theo thời gian thay vì dùng thư viện quá cồng kềnh.
**Rationale**: Recharts cung cấp component `<Brush />` để kéo thả chọn khung thời gian (time-series). Cách này vừa đảm bảo UI/UX cao cấp vừa nhẹ.

## Thiết kế Dark Mode cho Chart
**Decision**: Các mã màu biểu đồ sẽ sử dụng chuẩn màu HSL của thiết kế hiện tại (ví dụ: `hsl(var(--primary))`, `hsl(var(--destructive))`) thay vì hardcode mã HEX vào thuộc tính của Chart.
**Rationale**: Để đảm bảo nguyên tắc UI/Design Standard và đồng bộ tuyệt đối với theme của SmashHub.
