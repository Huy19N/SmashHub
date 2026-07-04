# Tasks: Cost Splitting Android

**Input**: Design documents from `/specs/001-cost-splitting-android/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

*(Không có task nào trong giai đoạn này vì chúng ta chỉ chỉnh sửa màn hình hiện có).*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T001 Thêm cấu trúc dữ liệu `ParticipantSplitData` (internal state) lưu tiền sân, phụ phí tuỳ chỉnh và `TextEditingController` vào State của `split_bill_screen.dart`.
- [x] T002 Cập nhật hàm `_loadParticipants()` trong `split_bill_screen.dart` để khởi tạo giá trị mặc định cho `ParticipantSplitData` khi load danh sách.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Initiate Cost Splitting (Priority: P1) 🎯 MVP

**Goal**: Cho phép trưởng nhóm bắt đầu chia tiền, có thêm lựa chọn "Custom".

**Independent Test**: Mở màn hình chia tiền, tích chọn được "Tùy chỉnh cá nhân".

### Implementation for User Story 1

- [x] T003 [US1] Thêm Radio button "Tùy chỉnh (Custom)" vào phần CHẾ ĐỘ CHIA TIỀN trong `AndroidApp/lib/src/features/community/presentation/screens/split_bill_screen.dart`.
- [x] T004 [US1] Xử lý sự kiện `onChanged` của Radio button để thay đổi `_splitMode` thành `custom`.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Customize Individual Costs (Priority: P1)

**Goal**: Cho phép trưởng nhóm nhập tiền sân và phụ phí riêng biệt cho từng cá nhân.

**Independent Test**: Khi ở chế độ Custom, danh sách người chơi hiển thị 2 ô nhập Tiền Sân và Phụ Phí thay vì chỉ hiện trạng thái đóng tiền.

### Implementation for User Story 2

- [x] T005 [US2] Thay đổi logic render danh sách người chơi (`ListView.builder`) trong `split_bill_screen.dart` để hiển thị 2 `TextFormField` (Tiền sân, Phụ phí) khi `_splitMode == 'custom'`.
- [x] T006 [US2] Xử lý lưu state tự động khi giá trị trong các TextFormField thay đổi vào biến trạng thái đã tạo ở T001.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Validate and Finalize Split (Priority: P2)

**Goal**: Chốt danh sách chia tiền bằng cách gửi dữ liệu bù trừ qua API.

**Independent Test**: Test thực tế gửi API xem số tiền có được chia đúng không.

### Implementation for User Story 3

- [x] T007 [US3] Cập nhật hàm `_calculateSplitBill` trong `split_bill_screen.dart` để thu thập dữ liệu nếu `_splitMode == 'custom'`.
- [x] T008 [US3] Viết logic tính toán `customAmounts`: `(Tiền sân + Phụ phí) - (Tổng ExtraFee / Số lượng User)` cho từng người dùng.
- [x] T009 [US3] Bổ sung tham số `customAmounts` vào request body của `api/schedules/{scheduleId}/calculate-split-bill`.

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T010 [P] Ẩn field cấu hình "Phụ phí phát sinh chung" (extraFeeController) nếu người dùng chọn chế độ `custom` (vì ở chế độ custom sẽ dùng phụ phí riêng từng người cộng lại).
- [x] T011 Chạy quickstart.md validation end-to-end.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Xong
- **Foundational (Phase 2)**: Xong
- **User Stories (Phase 3+)**: Có thể triển khai tuần tự.

### User Story Dependencies

- **User Story 1 (P1)**: T003, T004
- **User Story 2 (P1)**: T005, T006 (Cần giao diện US1 hoàn tất).
- **User Story 3 (P2)**: T007, T008, T009 (Cần US2 để có dữ liệu gửi).

### Parallel Opportunities

- Cả màn hình hiện tại gói gọn trong 1 file nên làm tuần tự từ trên xuống dưới (T001 -> T010) là hợp lý nhất.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Hoàn thành Setup + Foundational
2. US1 hoàn thành để lộ ra UI.
3. Chuyển qua US2 để nhập.
4. US3 gọi API kết thúc feature.

---

## Notes

- Chú ý các `TextEditingController` tạo ra trong ListView cần được quản lý tốt để tránh rò rỉ bộ nhớ (dispose khi cần thiết).
