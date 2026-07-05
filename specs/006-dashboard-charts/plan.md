# Implementation Plan: Dashboard Charts

**Branch**: `006-dashboard-charts` | **Date**: 2026-07-05 | **Spec**: [spec.md](file:///D:/Github/SmashClub/specs/006-dashboard-charts/spec.md)

## Summary

Dựa trên yêu cầu, chúng ta cần bổ sung các biểu đồ thống kê chuyên sâu cho 3 roles: Player (Tiến bộ, Khung giờ, Phân bổ sân), Court Owner (Customer Retention, Tỉ lệ lấp đầy, Dự báo doanh thu), và Admin (Doanh thu, Tăng trưởng user). Biểu đồ cần đáp ứng tính năng tương tác cao (Drill-down, zoom/pan) và render mượt mà dưới 2 giây.

## Technical Context

**Language/Version**: React 19 (Vite)

**Primary Dependencies**: `recharts` (Thư viện biểu đồ cần cài đặt thêm vì đáp ứng tốt React, hỗ trợ animation và drill-down dễ dàng qua custom event).

**Storage**: N/A (Data fetch từ API)

**Testing**: Linter (ESLint) và manual visual QA trên trình duyệt mô phỏng mobile.

**Target Platform**: Web (Desktop & Mobile Responsive)

**Project Type**: Web application

**Performance Goals**: <2s render time, mượt mà ở 60fps (hoạt ảnh animation).

**Constraints**: Bắt buộc tuân thủ Dark Mode và UI/UX Premium (không dùng AI slop, gradient lộn xộn).

**Scale/Scope**: Dashboard cho 3 roles, khoảng 10-12 loại chart khác nhau.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

1. **No Hardcoding**: Các URL gọi data thống kê phải từ API (VD: `api/stats/...`), không hardcode số liệu tĩnh vào chart.
2. **Clean Code & Architecture (FSD)**: Đặt các component chart vào các feature folder tương ứng: `src/features/dashboard/components/...`, `src/features/admin/components/...`, `src/features/profiles/components/...`.
3. **Backend Immutability**: Không sửa C# Backend. Sử dụng data mock nếu backend chưa có endpoint aggregation. (Giả định mock ở service layer).
4. **UI/Design Standard**: Dùng Tailwind thiết lập tooltip, màu sắc biểu đồ phải hài hòa với SmashHub Dark Theme.

## Project Structure

### Documentation (this feature)

```text
specs/006-dashboard-charts/
├── plan.md              # Kế hoạch triển khai
├── research.md          # Đánh giá thư viện Chart
├── data-model.md        # Cấu trúc dữ liệu API trả về
└── quickstart.md        # Hướng dẫn chạy thử
```

### Source Code

```text
Website/src/features/
├── dashboard/ (Role: Court Owner)
│   ├── components/charts/
│   │   ├── RevenueChart.jsx
│   │   ├── UtilizationHeatmap.jsx
│   │   └── CustomerRetentionChart.jsx
├── profiles/ (Role: Player)
│   ├── components/charts/
│   │   ├── PlayerProgressChart.jsx
│   │   ├── PlayTimeBarChart.jsx
│   │   └── OpponentPieChart.jsx
└── admin/ (Role: Admin)
    ├── components/charts/
    │   ├── PlatformRevenueChart.jsx
    │   ├── UserGrowthChart.jsx
    │   └── RoleDistributionChart.jsx
```

**Structure Decision**: Giữ nguyên kiến trúc Feature-Sliced Design. Chart của role nào thì đặt vào feature của role đó (`dashboard` cho chủ sân, `profiles` cho người chơi, `admin` cho quản trị viên).
