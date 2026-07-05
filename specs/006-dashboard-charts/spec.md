# Specification: Bổ sung biểu đồ thống kê cho Dashboard (3 Roles)

## 1. Feature Description
Tính năng này bổ sung các biểu đồ (charts) trực quan vào trang Dashboard cho 3 nhóm người dùng (Roles) chính trên nền tảng SmashClub: **Người chơi (Player)**, **Chủ sân (Court Owner)**, và **Quản trị viên (Admin)**. 
Mục tiêu là cung cấp cái nhìn tổng quan, trực quan và dễ hiểu về các chỉ số hoạt động, tài chính và sự tương tác của từng nhóm người dùng thông qua các biểu đồ (như biểu đồ cột, biểu đồ tròn, biểu đồ đường) thay vì chỉ hiển thị các con số thô.

## Clarifications
### Session 2026-07-05
- Q: Bổ sung biểu đồ thống kê nào cho Người chơi (Player) để thông tin đầy đủ nhất? → A: Tùy chọn C: Kết hợp biểu đồ theo dõi sự tiến bộ (Rating/Elo), Thống kê đối thủ, Khung giờ chơi thường xuyên & Phân bổ loại sân yêu thích.
- Q: Bổ sung loại biểu đồ nâng cao nào cho Chủ sân (Court Owner)? → A: Tùy chọn D: Biểu đồ Customer Retention, Dự báo doanh thu/công suất, và Heatmap mật độ sử dụng từng sân.
- Q: Định hướng phong cách hiển thị biểu đồ? → A: Tùy chọn A: Biểu đồ tương tác cao (Interactive) hỗ trợ drill-down, zoom/pan và animation mượt mà.

## 2. User Scenarios & Acceptance Criteria

### SCENARIO 1: Người chơi (Player) xem thống kê cá nhân
- **Given** người chơi đăng nhập thành công vào nền tảng và truy cập trang Dashboard / Profile.
- **When** người chơi kéo xuống phần "Thống kê hoạt động".
- **Then** người chơi sẽ thấy:
  1. Biểu đồ tổng số trận đã tham gia (theo tháng).
  2. Biểu đồ tròn thể hiện tỉ lệ thắng/thua (nếu có dữ liệu trận đấu đối kháng).
  3. Biểu đồ tổng chi tiêu (tiền đặt sân, mua gói premium, v.v.) theo tháng.

### SCENARIO 2: Chủ sân (Court Owner) theo dõi hiệu quả kinh doanh
- **Given** chủ sân đăng nhập vào cổng quản lý sân của mình.
- **When** chủ sân truy cập trang Dashboard tổng quan.
- **Then** chủ sân sẽ thấy:
  1. Biểu đồ đường (Line chart) doanh thu theo ngày/tuần/tháng.
  2. Biểu đồ cột (Bar chart) thống kê tổng số lượt đặt sân theo từng khung giờ trong ngày (để biết giờ cao điểm).
  3. Tỉ lệ lấp đầy sân (Utilization rate) hiển thị dạng Gauge chart hoặc Pie chart.

### SCENARIO 3: Quản trị viên (Admin) giám sát toàn hệ thống
- **Given** Admin đăng nhập vào trang quản trị hệ thống.
- **When** Admin truy cập trang chủ Admin Dashboard.
- **Then** Admin sẽ thấy:
  1. Biểu đồ tổng doanh thu toàn nền tảng (và doanh thu phí hoa hồng) theo tháng.
  2. Biểu đồ cột thể hiện sự tăng trưởng người dùng mới (đăng ký mới) theo tháng.
  3. Biểu đồ phân bổ tỉ lệ các loại tài khoản (Người chơi Free, Người chơi Premium, Chủ sân).
  4. Biểu đồ số lượng trận đấu / lượt đặt sân diễn ra trên toàn hệ thống theo thời gian.

## 3. Functional Requirements

### FR-001: Biểu đồ thống kê cho Người chơi (Player)
Hệ thống phải hiển thị các biểu đồ sau trên trang cá nhân của người chơi:
- Biểu đồ số trận tham gia theo thời gian.
- Biểu đồ tròn tỉ lệ thắng/thua.
- Biểu đồ chi phí đã tiêu theo tháng (chi tiêu đặt sân).
- Biểu đồ theo dõi sự tiến bộ (Rating/Điểm xếp hạng) theo thời gian.
- Biểu đồ tần suất đối thủ thường gặp (Pie chart / Bar chart).
- Biểu đồ thống kê thói quen: Khung giờ chơi thường xuyên (Heatmap hoặc Bar chart) & Phân bổ loại sân yêu thích.

### FR-002: Biểu đồ thống kê cho Chủ sân (Court Owner)
Hệ thống phải cung cấp cho chủ sân các biểu đồ:
- Doanh thu theo thời gian (có thể filter theo Tuần/Tháng/Năm).
- Số lượng lượt đặt (Bookings) theo thời gian.
- Phân bổ lượt đặt theo khung giờ (Giờ cao điểm vs giờ thấp điểm).
- Biểu đồ theo dõi Tỉ lệ khách hàng mới vs. Khách hàng quay lại (Customer Retention).
- Biểu đồ dự báo doanh thu & Dự báo công suất sân dựa trên dữ liệu quá khứ.
- Heatmap chi tiết mật độ sử dụng cho từng sân cụ thể (Court-level utilization).

### FR-003: Biểu đồ thống kê cho Admin
Hệ thống phải cung cấp cho Admin các biểu đồ cấp vĩ mô:
- Doanh thu toàn nền tảng theo thời gian.
- Biểu đồ tăng trưởng số lượng người dùng.
- Thống kê lượt đặt sân toàn hệ thống.

### FR-004: Tương tác biểu đồ (Chart Interactions)
- Biểu đồ phải tương tác cao (Interactive): Cho phép click vào cột/nhánh để xem chi tiết sâu hơn (Drill-down data).
- Hỗ trợ thao tác Zoom/Pan trên các biểu đồ dạng chuỗi thời gian (time-series).
- Tất cả biểu đồ đều phải có tooltip hiển thị dữ liệu chi tiết khi hover và có animation mượt mà khi load hoặc cập nhật data.
- Các biểu đồ có trục thời gian (Tháng/Tuần) phải hỗ trợ tính năng thay đổi khoảng thời gian (Date Range Filter).

### FR-005: Xử lý trạng thái (Empty/Loading State)
- Nếu dữ liệu chưa được tải xong, hiển thị Skeleton Loader.
- Nếu không có dữ liệu (chưa đá trận nào, chưa có doanh thu), hiển thị đồ họa "Chưa có dữ liệu" (Empty State) thân thiện, không báo lỗi trắng trang.

## 4. Success Criteria
- **Tương tác**: Hỗ trợ đầy đủ Drill-down, zoom/pan và tooltip cho các biểu đồ chính.
- **Hiệu năng**: Quá trình render biểu đồ không làm trang Dashboard tải chậm quá 2 giây, kể cả với hoạt ảnh animation phức tạp (chỉ dùng CSS GPU-accelerated hoặc canvas/WebGL nếu cần).
- **Thẩm mỹ**: Giao diện biểu đồ tuân thủ UI guidelines của SmashClub (dùng màu gradient, hỗ trợ chuẩn Dark Mode, thiết kế cao cấp).

## 5. Assumptions & Constraints
- **Assumptions**: 
  - Backend đã có sẵn hoặc sẽ cung cấp các endpoint API trả về dữ liệu tổng hợp (aggregated data) theo từng role. Frontend không phải tự kéo toàn bộ record database về để tính toán.
  - Các thư viện biểu đồ (như Recharts hoặc Chart.js) sẽ được sử dụng để đáp ứng các yêu cầu về UI/UX.
- **Constraints**: 
  - Giao diện biểu đồ bắt buộc phải Responsive để xem tốt trên thiết bị di động (đặc biệt là dashboard của người chơi).
