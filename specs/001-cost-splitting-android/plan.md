# Implementation Plan: Cost Splitting Android

**Branch**: `001-cost-splitting-android` | **Date**: 2026-07-04 | **Spec**: [spec.md](file:///d:/Github/SmashClub/specs/001-cost-splitting-android/spec.md)

**Input**: Feature specification from `/specs/001-cost-splitting-android/spec.md`

## Summary

Bổ sung tính năng cho phép Trưởng nhóm tuỳ chỉnh chi tiết Tiền Sân và Phụ Phí cho từng người chơi trên màn hình `SplitBillScreen` (AndroidApp). Việc này giải quyết bài toán chia tiền linh hoạt khi có sự khác biệt về mức độ sử dụng sân hoặc dịch vụ.

## Technical Context

**Language/Version**: Dart (Flutter)

**Primary Dependencies**: Flutter SDK, Dio (cho Network calls).

**Storage**: Local State Management (`StatefulWidget` hiện tại) và lưu qua Backend API (không dùng local DB).

**Testing**: Kiểm tra bằng giao diện người dùng trực tiếp trên Android Emulator/Thiết bị thật.

**Target Platform**: Android.

**Project Type**: Mobile Application.

**Constraints**: Tuân thủ luật "Backend Immutability" - không được thay đổi cấu trúc bảng hay API Backend. Frontend phải đảm nhận thuật toán bù trừ để Backend lưu dữ liệu chính xác.

**Scale/Scope**: Màn hình `SplitBillScreen` của tính năng Community. Khoảng 2-3 widgets mới sẽ được thêm vào.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. No Hardcoding**: PASS - Dữ liệu lấy từ tham số `widget.scheduleId` hiện có.
- **II. Clean Code & Architecture Compliance**: PASS - Tuân thủ Clean Architecture tại tầng `presentation/screens`.
- **III. Backend Immutability**: PASS - Đã có giải pháp xử lý bằng bù trừ trên Frontend, không chạm vào Backend (`CalculateSplitBillRequest`).
- **IV. No Code Hallucination**: PASS - Đã rà soát kỹ file `split_bill_screen.dart` thực tế và `SchedulesController.cs`.
- **V. Strict Tooling Adherence**: PASS - Đã dùng grep và view_file.

## Project Structure

### Documentation (this feature)

```text
specs/001-cost-splitting-android/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
AndroidApp/lib/src/features/community/
├── presentation/
│   └── screens/
│       └── split_bill_screen.dart
```

**Structure Decision**: Cập nhật file màn hình hiện có `split_bill_screen.dart`, không tạo file cấu trúc mới do yêu cầu chỉnh sửa nhỏ trên UI.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Frontend bù trừ `CostToPay` thay vì gửi độc lập | Backend không hỗ trợ field lưu `CustomExtraFee` và theo Luật Cấm Sửa Backend | Không thể sửa Backend (Luật III) |
