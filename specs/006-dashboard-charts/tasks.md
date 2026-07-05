# Tasks: Dashboard Charts

**Input**: Design documents from `/specs/006-dashboard-charts/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Cài đặt thư viện `recharts` vào dự án Website bằng lệnh `npm install recharts` (chạy tại thư mục `Website`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Tạo thư mục `components/charts` tại các feature: `dashboard`, `profiles`, `admin`.
- [x] T003 Thiết lập utility chung để format Tooltip Dark Mode cho toàn bộ chart (đặt tại `src/components/ui/ChartTooltip.jsx` hoặc tạo style mixin CSS).

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Player Charts (Priority: P1) 🎯 MVP

**Goal**: Bổ sung biểu đồ thống kê chuyên sâu cho Người chơi (Player) để theo dõi sự tiến bộ, tần suất chơi và loại sân yêu thích.

**Independent Test**: Đăng nhập quyền Player, truy cập trang Profile và kiểm tra các biểu đồ render mượt mà (dưới 2s).

### Implementation for User Story 1

- [x] T004 [P] [US1] Khởi tạo Mock Data cho Player (`PlayerProgressData`, `PlayTimeData`) tại `src/features/profiles/api/mockPlayerStats.js`.
- [x] T005 [P] [US1] Tạo component `PlayerProgressChart` (Recharts LineChart) tại `src/features/profiles/components/charts/PlayerProgressChart.jsx`.
- [x] T006 [P] [US1] Tạo component `PlayTimeBarChart` (Recharts BarChart) tại `src/features/profiles/components/charts/PlayTimeBarChart.jsx`.
- [x] T007 [P] [US1] Tạo component `OpponentPieChart` (Recharts PieChart) tại `src/features/profiles/components/charts/OpponentPieChart.jsx`.
- [x] T008 [US1] Tích hợp 3 biểu đồ trên vào trang `src/features/profiles/pages/ProfilePage.jsx` và hiển thị Skeleton Loader khi load mock data.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Court Owner Charts (Priority: P2)

**Goal**: Bổ sung biểu đồ thống kê cho Chủ sân (Court Owner) để phân tích doanh thu, mật độ sử dụng sân, và độ giữ chân khách hàng (Retention).

**Independent Test**: Đăng nhập quyền Chủ sân, truy cập Dashboard và tương tác (Drill-down / Zoom) với biểu đồ doanh thu, xem Heatmap mật độ giờ.

### Implementation for User Story 2

- [x] T009 [P] [US2] Khởi tạo Mock Data cho Chủ sân (`RevenueForecastData`, `UtilizationData`) tại `src/features/dashboard/api/mockOwnerStats.js`.
- [x] T010 [P] [US2] Tạo component `RevenueChart` (Recharts ComposedChart kết hợp Line & Bar cho Actual vs Forecast) tại `src/features/dashboard/components/charts/RevenueChart.jsx`.
- [x] T011 [P] [US2] Tạo component `UtilizationHeatmap` (Custom Heatmap với Recharts Scatter/Cell) tại `src/features/dashboard/components/charts/UtilizationHeatmap.jsx`.
- [x] T012 [P] [US2] Tạo component `CustomerRetentionChart` (Recharts AreaChart) tại `src/features/dashboard/components/charts/CustomerRetentionChart.jsx`.
- [x] T013 [US2] Tích hợp các biểu đồ vào trang `src/features/dashboard/pages/DashboardPage.jsx` kèm tính năng lọc thời gian (Date Range Filter).

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Admin Charts (Priority: P3)

**Goal**: Bổ sung biểu đồ vĩ mô cho Quản trị viên (Admin) để giám sát tăng trưởng người dùng và tổng doanh thu toàn nền tảng.

**Independent Test**: Đăng nhập Admin, vào Admin Dashboard, hover xem chi tiết doanh thu Platform Fee.

### Implementation for User Story 3

- [x] T014 [P] [US3] Khởi tạo Mock Data cho Admin (`PlatformRevenueData`, `UserGrowthData`) tại `src/features/admin/api/mockAdminStats.js`.
- [x] T015 [P] [US3] Tạo component `PlatformRevenueChart` (Recharts AreaChart) tại `src/features/admin/components/charts/PlatformRevenueChart.jsx`.
- [x] T016 [P] [US3] Tạo component `UserGrowthChart` (Recharts BarChart stacked) tại `src/features/admin/components/charts/UserGrowthChart.jsx`.
- [x] T017 [P] [US3] Tạo component `RoleDistributionChart` (Recharts PieChart) tại `src/features/admin/components/charts/RoleDistributionChart.jsx`.
- [x] T018 [US3] Tích hợp biểu đồ vào `src/features/admin/pages/AdminDashboard.jsx`.

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T019 Chạy Visual QA tổng thể cho cả 3 trang Dashboard trên Responsive Mobile (qua trình duyệt) để đảm bảo layout không bị tràn viền (overflow).
- [x] T020 Chạy `npm run lint` để kiểm tra lỗi cú pháp trong các components biểu đồ.
- [x] T021 Chạy `npm run build` để tối ưu thư viện `recharts` xem bundle size có hợp lệ không.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Parallel Opportunities

- Việc tạo các Mock API Data cho US1, US2, US3 (T004, T009, T014) hoàn toàn song song.
- Việc tạo các thành phần Chart Component tĩnh (không ghép Data vào Trang) đều chạy song song `[P]`.
- Chỉ các Task Tích hợp (T008, T013, T018) phải chờ các Task con của Story đó hoàn thành.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1 (Player Charts)
4. **STOP and VALIDATE**: Test User Story 1 (Chạy ứng dụng web và truy cập Profile).

### Incremental Delivery

1. Cài đặt Recharts và Base Tooltip UI.
2. Hoàn thành biểu đồ Player -> Test.
3. Hoàn thành biểu đồ Court Owner -> Test.
4. Hoàn thành biểu đồ Admin -> Test.
5. Kiểm tra Lint và Build tổng thể.
