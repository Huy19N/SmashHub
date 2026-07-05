# Feature Specification: Nâng cấp giao diện Website SmashClub (Preserve Mode)

**Feature Branch**: `[005-website-ui-redesign]`

**Created**: 2026-07-05

**Status**: Draft

**Input**: User description: "Dựa trên báo cáo audit UI vừa tạo ở [Design.md], hãy tạo spec cho feature 'Nâng cấp giao diện Website SmashClub'. Mục tiêu: sửa các pattern generic đã phát hiện (liệt kê cụ thể theo audit), giữ nguyên cấu trúc URL/nav/form (mode preserve). Đối tượng người dùng: [người chơi thể thao đặt sân]. Không đổi logic backend, chỉ đổi phần trình bày."

## Clarifications

### Session 2026-07-05
- Q: Có yêu cầu tối ưu hiển thị trên Mobile (Responsive) không? → A: Có, tính năng responsive bắt buộc phải được duy trì và tối ưu hóa để đảm bảo trải nghiệm tốt nhất trên thiết bị di động (vì đa số người dùng đặt sân qua điện thoại).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Nâng tầm trải nghiệm thị giác cao cấp (Priority: P1)

Là một người chơi thể thao tìm kiếm sân đấu chất lượng, tôi muốn nhìn thấy một trang chủ gọn gàng, tinh tế và tập trung vào hình ảnh thực tế của sân thay vì các hiệu ứng nhấp nháy rối mắt, để tôi cảm nhận được sự chuyên nghiệp và đẳng cấp của dịch vụ.

**Why this priority**: Cải thiện ấn tượng đầu tiên (first impression) là yếu tố quyết định để giữ chân khách hàng cao cấp ở lại trang web.

**Independent Test**: Có thể kiểm tra độc lập bằng cách quan sát trực quan giao diện trang chủ, xác nhận không còn các hiệu ứng chớp tắt liên tục (glowing blobs) và giao diện hiển thị gọn gàng, ít chữ thừa.

**Acceptance Scenarios**:

1. **Given** người dùng truy cập trang chủ, **When** trang tải xong, **Then** người dùng không thấy các đốm sáng mờ nhấp nháy liên tục ở background.
2. **Given** người dùng đọc các tiêu đề, **When** lướt qua các khu vực, **Then** số lượng nhãn phụ (eyebrow) được sử dụng rất hạn chế (tối đa 1 eyebrow / 3 khu vực).

---

### User Story 2 - Cải thiện cấu trúc bố cục chống nhàm chán (Priority: P2)

Là một người dùng lướt web, tôi muốn nội dung được trình bày đa dạng, phá vỡ sự lặp lại 50/50 trái-phải nhàm chán, giúp tôi dễ dàng tiếp thu thông tin về cộng đồng và sân đấu một cách sinh động hơn.

**Why this priority**: Bố cục Zigzag lặp lại làm giảm sự chú ý của người dùng khi cuộn trang. Việc thay đổi layout giúp luồng thông tin hấp dẫn hơn.

**Independent Test**: Có thể kiểm tra bằng cách so sánh bố cục của phần "Sân đấu" và "Cộng đồng" xem chúng có sự khác biệt rõ rệt về mặt hiển thị hay không.

**Acceptance Scenarios**:

1. **Given** người dùng đang ở phần "Sân Đấu", **When** cuộn xuống phần "Cộng Đồng", **Then** cấu trúc trình bày của phần "Cộng Đồng" khác biệt hoàn toàn với phần "Sân Đấu" (ví dụ: dùng dạng lưới hoặc thẻ thay vì chia đôi màn hình).

---

### User Story 3 - Trải nghiệm điều hướng mạch lạc (Priority: P3)

Là một khách hàng muốn đặt sân, tôi muốn các nút kêu gọi hành động (Call to Action) có chung một thông điệp thống nhất để tôi không bị phân tâm, và các công cụ bổ trợ (như nút đổi giao diện) được xếp gọn gàng vào đúng vị trí truyền thống thay vì trôi nổi trên màn hình.

**Why this priority**: Tính nhất quán trong CTA giúp tăng tỷ lệ chuyển đổi. Nút nổi (floating) dễ che khuất nội dung trên thiết bị di động.

**Independent Test**: Kiểm tra toàn bộ các nút bấm dẫn đến trang đặt sân và vị trí của nút đổi chế độ giao diện sáng/tối.

**Acceptance Scenarios**:

1. **Given** người dùng ở khu vực giới thiệu trên cùng, **When** nhìn thấy nút kêu gọi đặt sân, **Then** nhãn của nút giống hệt với nhãn của nút đặt sân ở khu vực chân trang (ví dụ: "Đặt Sân Ngay").
2. **Given** người dùng muốn đổi chế độ tối/sáng, **When** tìm kiếm công cụ đổi, **Then** nút đổi giao diện nằm gọn trong thanh điều hướng chính ở trên cùng (top nav).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống MUST loại bỏ các nhãn phụ (eyebrow) dư thừa, đảm bảo tỷ lệ tối đa 1 nhãn phụ cho mỗi 3 section chức năng.
- **FR-002**: Hệ thống MUST loại bỏ các nhãn đánh số thứ tự trang trí (ví dụ: "01 / Sân Đấu").
- **FR-003**: Hệ thống MUST ngừng sử dụng hiệu ứng chớp tắt, phát sáng liên tục (pulse, glow) ở các phần tử nền trang trí.
- **FR-004**: Hệ thống MUST loại bỏ các dòng chữ gợi ý cuộn trang (ví dụ: "Cuộn để khám phá") và biểu tượng mũi tên đi kèm.
- **FR-005**: Hệ thống MUST thay đổi bố cục hiển thị của khu vực "Cộng Đồng" để không bị lặp lại cấu trúc 50/50 (chữ một bên, khối một bên) giống hệt với khu vực "Sân Đấu".
- **FR-006**: Hệ thống MUST đồng nhất toàn bộ nhãn chữ của nút bấm dẫn đến chức năng đặt sân thành một nhãn duy nhất (ví dụ: "Đặt Sân Ngay").
- **FR-007**: Hệ thống MUST di chuyển tính năng thay đổi giao diện sáng/tối từ dạng nút nổi tự do (floating button) lên thanh điều hướng chính (Top Navbar).
- **FR-008**: Hệ thống MUST giới hạn việc dùng chữ in nghiêng kết hợp dải màu (gradient italic) chỉ ở những tiêu đề chính yếu nhất (chẳng hạn ở Hero), không dùng đại trà.
- **FR-009**: Hệ thống MUST giữ nguyên toàn bộ logic xử lý dữ liệu backend, đường dẫn trang (URL routing) và các trường thông tin trong form liên hệ.
- **FR-010**: Hệ thống MUST hỗ trợ Responsive Design hoàn hảo, đảm bảo không bị vỡ layout trên các thiết bị Mobile và Tablet sau khi áp dụng các thay đổi thiết kế trên.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Số lượng nhãn phụ (eyebrow) trên trang chủ giảm xuống mức quy định (không quá 1 nhãn phụ / 3 sections).
- **SC-002**: Không có bất kỳ phần tử nền (background div) nào sử dụng chu kỳ lặp vô hạn dạng nhấp nháy phát sáng (pulse) khi trang ở trạng thái tĩnh.
- **SC-003**: 100% các nút bấm dẫn đến trang đặt sân có chung một nội dung text.
- **SC-004**: Không phát sinh lỗi logic khi gửi biểu mẫu liên hệ (Form).
- **SC-005**: Không thay đổi bất kỳ URL nào so với phiên bản cũ, đảm bảo người dùng truy cập trực tiếp bằng link cũ vẫn hoạt động bình thường.
- **SC-006**: Giao diện hiển thị đúng, không bị tràn viền (overflow) hoặc chồng chéo nội dung (overlap) trên các kích thước màn hình Mobile (dưới 768px).

## Assumptions

- Việc thay đổi bố cục CSS sẽ không làm ảnh hưởng đến khả năng tiếp cận (Accessibility) của trang web, màu sắc và độ tương phản vẫn được đảm bảo.
- Bộ phận Marketing đồng ý với việc loại bỏ các cụm từ thừa (eyebrow) và thay đổi văn bản nút bấm cho đồng nhất.
- Nền tảng hiện tại (React/Tailwind) cho phép tái cấu trúc dễ dàng mà không cần cài đặt thêm thư viện thiết kế mới.
