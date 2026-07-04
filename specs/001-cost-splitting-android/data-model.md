# Data Models

## Client-side Models (Dart)

### `CalculateSplitBillRequest`
Data structure used to send calculation parameters to the backend.

- `extraFee` (double): Tổng tất cả phụ phí.
- `extraFeeNote` (String?): Ghi chú phụ phí.
- `fixedAmountPerPerson` (double?): Dành cho chế độ chia mức cố định.
- `customAmounts` (Map<String, double>?): Dành cho chế độ "Tùy chỉnh cá nhân". Map từ `userId` sang số tiền được tính bằng công thức bù trừ.

### `ParticipantSplitData` (Internal UI State)
Used internally within the state of `SplitBillScreen` to track what the Team Leader is typing.

- `userId` (String)
- `fullName` (String)
- `customCourtCost` (double): Tiền sân tuỳ chỉnh cho user này.
- `customExtraFee` (double): Phụ phí tuỳ chỉnh cho user này.

**State Transition**:
- Khi chế độ "Custom" được bật, state sẽ khởi tạo mảng `ParticipantSplitData` với giá trị mặc định là Tiền sân = Tổng tiền / N, Phụ phí = 0.
- Khi gửi request, hệ thống sẽ tính `Target = customCourtCost + customExtraFee` và truyền lên dưới dạng tham số thuật toán bù trừ.
