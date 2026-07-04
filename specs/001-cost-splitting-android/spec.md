# Feature Specification: Cost Splitting Android

**Feature Branch**: `001-cost-splitting-android`

**Created**: 2026-07-04

**Status**: Draft

**Input**: User description: "làm tính năng chia tiền sân trong app andoind khi người chủ nhóm tạo sân rồi tạo lịch và điểm danh rồi sau khi trận đâu kết thúc thì sẽ dùng chức năng chia tiền thì lấy số tiền đặt sân và số tiền phát sinh như phụ phí nước uống vật dụng thể thao như cầu lông hay bóng và vì tùy từng người có phí phát sinh khác nhau và tiền sân cũng vậy có người tham gia nhiều và ít nên có thể tùy chỉnh phần tiền phụ phí và tiền sân cho từng người khác nhau tùy vào người chủ nhóm đặt sân kia"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Initiate Cost Splitting (Priority: P1)

Là một Trưởng nhóm (Team Leader), tôi muốn bắt đầu tính năng chia tiền cho một trận đấu đã kết thúc và đã điểm danh, để hệ thống tự động tính toán mức chia đều cơ bản dựa trên chi phí sân và danh sách người tham gia.

**Why this priority**: Đây là bước khởi đầu bắt buộc của toàn bộ quy trình, giúp trưởng nhóm có cái nhìn tổng quan về tổng chi phí và danh sách người phải đóng tiền.

**Independent Test**: Có thể test độc lập bằng cách mở một trận đấu đã kết thúc, nhấn "Chia tiền" và kiểm tra xem danh sách người tham gia cùng chi phí chia đều có hiển thị chính xác không.

**Acceptance Scenarios**:

1. **Given** một trận đấu đã kết thúc và đã chốt danh sách điểm danh, **When** trưởng nhóm chọn "Chia tiền", **Then** hệ thống hiển thị màn hình chia tiền với tổng tiền sân được chia đều cho những người có mặt.
2. **Given** một trận đấu chưa điểm danh hoặc chưa kết thúc, **When** trưởng nhóm xem chi tiết, **Then** nút "Chia tiền" bị vô hiệu hóa hoặc bị ẩn.

---

### User Story 2 - Customize Individual Costs (Priority: P1)

Là một Trưởng nhóm, tôi muốn tùy chỉnh thủ công chi phí sân và phụ phí (nước, cầu, bóng) cho từng cá nhân, để đảm bảo sự công bằng vì có người chơi ít/nhiều hoặc tiêu thụ phụ phí khác nhau.

**Why this priority**: Đây là giá trị cốt lõi (core value) của tính năng theo yêu cầu của người dùng, giải quyết vấn đề chia tiền không đồng đều trong thực tế.

**Independent Test**: Có thể test bằng cách nhập các số tiền khác nhau cho từng thành viên và xem hệ thống tổng hợp lại tổng số tiền.

**Acceptance Scenarios**:

1. **Given** đang ở màn hình chia tiền, **When** trưởng nhóm nhập một phụ phí chung (VD: 100k tiền nước), **Then** phụ phí này được chia đều vào khoản phụ phí của từng người.
2. **Given** đang ở màn hình chia tiền, **When** trưởng nhóm chỉnh sửa tiền sân của Thành viên A từ 50k xuống 20k, **Then** hệ thống ghi nhận Thành viên A đóng 20k tiền sân.
3. **Given** đang ở màn hình chia tiền, **When** trưởng nhóm thêm 15k tiền nước riêng cho Thành viên B, **Then** tổng tiền phụ phí của Thành viên B tăng thêm 15k.

---

### User Story 3 - Validate and Finalize Split (Priority: P2)

Là một Trưởng nhóm, tôi muốn chốt danh sách chia tiền và thông báo cho các thành viên, để mọi người biết chính xác số tiền mình cần đóng.

**Why this priority**: Đóng gói quy trình và lưu trữ dữ liệu vào hệ thống.

**Independent Test**: Test bằng cách nhấn chốt chia tiền và kiểm tra xem dữ liệu có được lưu trữ thành công và hiển thị cho các thành viên khác hay không.

**Acceptance Scenarios**:

1. **Given** tổng số tiền chia cho các thành viên khớp với tổng chi phí trận đấu, **When** trưởng nhóm nhấn "Chốt chia tiền", **Then** hệ thống lưu dữ liệu và trạng thái trận đấu chuyển thành "Đã chia tiền".
2. **Given** tổng số tiền chia cho các thành viên không khớp với tổng chi phí trận đấu (thiếu hoặc thừa), **When** trưởng nhóm nhấn "Chốt chia tiền", **Then** hệ thống hiện cảnh báo xác nhận xem trưởng nhóm có chắc chắn muốn chốt với sự chênh lệch này không.

---

### Edge Cases

- What happens when một thành viên được điểm danh nhưng thực tế không chơi và trưởng nhóm chỉnh sửa số tiền của người đó về 0? (Hệ thống phải cho phép tổng tiền của 1 người = 0).
- How does system handle việc trưởng nhóm vô tình thoát app khi đang chia tiền dở dang? (Cần cảnh báo mất dữ liệu chưa lưu hoặc auto-save draft).
- What happens when tổng tiền tùy chỉnh chênh lệch quá lớn so với tiền sân thực tế? (Chỉ hiện cảnh báo, quyền quyết định cuối cùng vẫn thuộc về trưởng nhóm).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống MUST cho phép Trưởng nhóm truy cập chức năng "Chia tiền" đối với các lịch thi đấu (Schedules) đã kết thúc và đã chốt điểm danh.
- **FR-002**: Hệ thống MUST tự động tính toán mức chia đều cơ bản (Base Split) bằng cách lấy Tổng tiền sân chia cho Tổng số người đã điểm danh (có mặt).
- **FR-003**: Hệ thống MUST cho phép Trưởng nhóm nhập các loại Phụ phí chung (ví dụ: Nước uống, Cầu lông) và tự động chia đều phụ phí này cho người tham gia.
- **FR-004**: Hệ thống MUST cung cấp giao diện để Trưởng nhóm tùy chỉnh trực tiếp (ghi đè) "Tiền sân" cho từng cá nhân cụ thể.
- **FR-005**: Hệ thống MUST cung cấp giao diện để Trưởng nhóm tùy chỉnh trực tiếp (ghi đè) "Phụ phí" cho từng cá nhân cụ thể.
- **FR-006**: Hệ thống MUST tính toán và hiển thị theo thời gian thực Tổng tiền thu được từ các cá nhân so với Tổng chi phí gốc, làm nổi bật sự chênh lệch (nếu có).
- **FR-007**: Hệ thống MUST cho phép Trưởng nhóm lưu (Chốt) kết quả chia tiền và cập nhật trạng thái chi phí cho các `ScheduleParticipants` liên quan.

### Key Entities *(include if feature involves data)*

- **Schedule**: Chứa thông tin tổng tiền sân (CourtCost) và trạng thái hiện tại (Đã chia tiền hay chưa).
- **ScheduleParticipant**: Thực thể đại diện cho thành viên tham gia, cần được bổ sung lưu trữ các trường `CalculatedCourtCost` (Tiền sân phải đóng), `CalculatedAdditionalCost` (Phụ phí phải đóng), `TotalAmountDue` (Tổng tiền phải đóng).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Trưởng nhóm có thể hoàn thành việc chia tiền tùy chỉnh cho một nhóm 10 người trong vòng dưới 2 phút.
- **SC-002**: 100% các khoản chia tiền tùy chỉnh khi cộng lại được hệ thống tính toán chính xác tổng phụ phí và tổng tiền sân mà không xảy ra lỗi sai số làm tròn (rounding errors).
- **SC-003**: Mỗi thành viên tham gia có thể nhìn thấy chi tiết khoản đóng góp của mình (Tiền sân + Phụ phí) rõ ràng, giảm 80% các câu hỏi thắc mắc dành cho trưởng nhóm sau trận đấu.

## Assumptions

- Thông tin về tiền đặt sân (CourtCost) và danh sách điểm danh (Attendance) đã có sẵn và ổn định trong hệ thống Backend.
- Tính năng này chỉ tập trung vào việc **tính toán và phân bổ chi phí**, việc thanh toán thực tế (chuyển khoản, tiền mặt) sẽ được xử lý ngoài luồng (out-of-band) hoặc ở một module Wallet riêng biệt.
- Ứng dụng Android đã có sẵn màn hình Chi tiết lịch thi đấu để tích hợp nút "Chia tiền" vào.
