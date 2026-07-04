# Phase 0: Outline & Research

## Backend API Capabilities vs Requirements

- **Requirement**: "tùy chỉnh phần tiền phụ phí và tiền sân cho từng người khác nhau".
- **Backend Current State**: `CalculateSplitBillRequest` chấp nhận một trường `CustomAmounts` dạng `Dictionary<Guid, decimal>`. Trong hàm xử lý `CalculateAndSaveSplitBillAsync`, thuật toán tính cho mỗi participant là:
  `p.CostToPay = request.CustomAmounts[p.UserId] + (request.ExtraFee / totalParticipants)`
  Hệ thống backend tự động chia đều `ExtraFee` cho tất cả mọi người và cộng dồn vào `CustomAmounts` (coi như tiền sân tùy chỉnh). Backend không có tính năng lưu trữ "Phụ phí riêng" (Custom Extra Fee) hay "Tiền sân riêng" (Custom Court Cost) độc lập trong DB, nó chỉ lưu duy nhất một trường `CostToPay` ở `ScheduleParticipant`.

## Decision: Frontend Math Workaround
- **Decision**: Để tuân thủ luật "Không được sửa Backend" nhưng vẫn đạt được yêu cầu đặc tả (cho phép trưởng nhóm nhập tùy chỉnh riêng Tiền sân và Phụ phí trên UI), ứng dụng Android (Frontend) sẽ xử lý ghép số liệu trước khi gọi API.
- **Rationale**: 
  1. Trên UI: Hiển thị 2 cột (hoặc 2 ô nhập) cho mỗi user: Tiền Sân (Mặc định = BaseCourtCost / N) và Phụ Phí (Mặc định = ExtraFee / N).
  2. Người dùng nhập xong, tổng số tiền người đó phải trả là `Target = UserCourt + UserExtra`.
  3. Để API backend tính ra đúng `Target`, frontend sẽ truyền lên:
     - `ExtraFee` = Tổng tất cả phụ phí của mọi người (Để backend lưu thuộc tính `ExtraFee` đúng tổng số).
     - `CustomAmounts[userId]` = `Target - (TotalExtraFee / N)`.
     Khi backend tính toán: `p.CostToPay = CustomAmounts[userId] + (TotalExtraFee / N)`, kết quả sẽ quay lại đúng bằng `Target`.
- **Alternatives considered**: 
  - Yêu cầu sửa backend để hỗ trợ lưu chi tiết tách bạch từng người (Bị loại vì vi phạm luật Backend Immutability).
  - Không truyền `ExtraFee` lên backend (truyền = 0) và gộp toàn bộ vào `CustomAmounts`. (Bị loại vì sẽ làm mất thông tin tổng phụ phí chung `schedule.ExtraFee`).

## Architecture & Integration

- Trạng thái màn hình hiện tại `split_bill_screen.dart` đã có hỗ trợ "Chia đều (Auto)" và "Mức cố định". Ta sẽ thêm tuỳ chọn thứ 3: "Tùy chỉnh cá nhân (Custom)".
- Màn hình hiển thị danh sách `_participants` sẽ được đổi thành các TextField cho phép nhập tiền khi chọn chế độ "Custom".
- Các giá trị nhập sẽ được gom lại tạo thành tham số `customAmounts` để gửi đi trong POST request.

## Constitution Check
- **Backend Immutability**: Đã tuân thủ, không sửa đổi BE, dùng thuật toán bù trừ trên FE.
- **No Hardcoding**: Tuân thủ, sử dụng tỷ lệ và model linh động.
- **Clean Code & Architecture**: Cập nhật logic trong thư mục `presentation/screens` và `models` của Clean Architecture.
