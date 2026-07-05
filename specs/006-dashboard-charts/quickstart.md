# Quickstart: Kiểm tra giao diện Dashboard Charts

Do biểu đồ cần dữ liệu để render, quá trình kiểm tra sẽ sử dụng Mock Data tích hợp sẵn ở Frontend.

## Môi trường & Thiết lập
1. Cài đặt package thư viện biểu đồ (đã cấu hình trong plan):
   ```bash
   cd Website
   npm install recharts lucide-react
   ```
2. Chạy ứng dụng local:
   ```bash
   npm run dev
   ```

## Kịch bản Kiểm tra (Validation Scenarios)

### 1. Kiểm tra Dashboard của Player (Người chơi)
- **Hành động**: Đăng nhập bằng tài khoản Player (hoặc vào path `/profile` nếu đã được mock route).
- **Kết quả kỳ vọng**:
  - Nhìn thấy khu vực "Thống kê hoạt động".
  - Biểu đồ line chart hiển thị sự tiến bộ của điểm Rating (có hiệu ứng vẽ đường line từ trái sang phải).
  - Hover chuột vào các điểm mốc trên đường để xem giá trị chính xác qua Tooltip (có viền tối, chữ trắng chuẩn Dark Mode).

### 2. Kiểm tra Dashboard của Court Owner (Chủ sân)
- **Hành động**: Đăng nhập bằng tài khoản Court Owner (vào `/dashboard` hoặc `/courts-management`).
- **Kết quả kỳ vọng**:
  - Biểu đồ kép (Actual vs Forecast Revenue) hiển thị rõ đường doanh thu thực tế (nét liền) và dự báo (nét đứt).
  - Heatmap tỉ lệ lấp đầy hiển thị các khung giờ "vàng" với màu sáng đậm hơn (dựa trên hệ màu HSL primary).

### 3. Kiểm tra tính năng Responsive
- **Hành động**: Dùng Chrome DevTools thu nhỏ kích thước màn hình xuống Mobile (iPhone 14 - 390px).
- **Kết quả kỳ vọng**:
  - Các biểu đồ tự động co giãn (`ResponsiveContainer` của Recharts 100% width).
  - Trục X (hoặc Y) tự động giảm bớt các mốc text nếu quá chật (hạn chế vỡ layout).
  - Không có thanh cuộn ngang dư thừa ngoài ý muốn.
