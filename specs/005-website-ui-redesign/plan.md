# Implementation Plan: Nâng cấp giao diện Website SmashClub (Preserve Mode)

**Branch**: `[005-website-ui-redesign]` | **Date**: 2026-07-05 | **Spec**: [spec.md](file:///d:/Github/SmashClub/specs/005-website-ui-redesign/spec.md)

**Input**: Feature specification from `/specs/005-website-ui-redesign/spec.md`

## Summary

Nâng cấp giao diện (UI) trang chủ Website SmashClub nhằm loại bỏ các pattern thiết kế mặc định thường gặp do AI sinh ra (AI-slop tells) như lạm dụng nhãn phụ (eyebrow), hiệu ứng nhấp nháy liên tục (perpetual glowing blobs), cấu trúc lặp lại zigzag, và nút bấm trùng lặp. Đặc biệt tối ưu hóa và đảm bảo tính responsive cho màn hình di động, trong khi giữ nguyên kiến trúc URL và logic hệ thống hiện tại. Bảo vệ tuyệt đối hiệu ứng Hero Scroll-Triggered Video theo đúng Constitution.

## Technical Context

**Language/Version**: JavaScript (ES6+), CSS3 (Tailwind)

**Primary Dependencies**: React 18, Vite, Tailwind CSS, Lucide React, AOS (Animate on Scroll)

**Storage**: N/A

**Testing**: N/A (Manual visual verification)

**Target Platform**: Web (Desktop & Mobile Responsive)

**Project Type**: Web application (Frontend)

**Performance Goals**: Giữ nguyên hiệu năng tải trang, cải thiện rendering frame rate bằng cách loại bỏ các animation loop không cần thiết (`animate-pulse`).

**Constraints**: Không được can thiệp vào logic video scroll-sync ở trang chủ.

**Scale/Scope**: Chỉ thay đổi UI ở các trang giao diện người dùng.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **VI. UI/Design Standard:** Tuân thủ. Kế hoạch này được lập ra chính xác để đáp ứng Design Standard chống AI-slop. 
- **Protected Asset:** Đã xác định rõ component `HomePage.jsx` và cam kết KHÔNG chạm vào đoạn code điều khiển video playback (scroll trigger).

## Project Structure

### Documentation (this feature)

```text
specs/005-website-ui-redesign/
├── plan.md              # This file
├── research.md          # Research on component mapping and CSS optimization
├── data-model.md        # N/A
├── quickstart.md        # Steps to visually verify the redesign
```

### Source Code (repository root)

```text
Website/
├── src/
│   ├── features/home/
│   │   ├── components/
│   │   │   ├── CollectionsSection.jsx
│   │   │   ├── ContactSection.jsx
│   │   │   └── PremiumSection.jsx
│   │   └── pages/
│   │       └── HomePage.jsx
│   └── App.jsx
```

**Structure Decision**: Giữ nguyên kiến trúc Feature-Sliced Design (FSD) cơ bản của Frontend. Chỉ cập nhật CSS classes (Tailwind) và sắp xếp lại các block JSX trong các component thuộc `features/home` và gỡ bỏ Floating Theme Switcher trong `App.jsx`.
