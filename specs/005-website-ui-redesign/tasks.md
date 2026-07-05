# Tasks: Nâng cấp giao diện Website SmashClub (Preserve Mode)

**Input**: Design documents from `/specs/005-website-ui-redesign/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Khởi động và kiểm tra môi trường chạy Vite React cục bộ ở `Website/`

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Xác định đúng vị trí các component cần sửa và cô lập các đoạn code không được đụng vào (Protected Assets)

- [x] T002 Xác định logic video scroll-sync (từ line 57-90) tại `Website/src/features/home/pages/HomePage.jsx` để đảm bảo KHÔNG sửa hoặc vô tình xóa nó.

---

## Phase 3: User Story 1 - Nâng tầm trải nghiệm thị giác cao cấp (Priority: P1) 🎯 MVP

**Goal**: Loại bỏ hoàn toàn các pattern thiết kế AI-slop rườm rà (eyebrows, continuous glowing pulses, scroll hints).

**Independent Test**: Quan sát trực quan, đảm bảo nền tĩnh lặng cao cấp và sạch sẽ.

### Implementation for User Story 1

- [x] T003 [P] [US1] Xóa khối div chứa chữ "Cuộn để khám phá" và icon mũi tên `animate-bounce` tại `Website/src/features/home/pages/HomePage.jsx`
- [x] T004 [P] [US1] Xóa bỏ dòng chữ eyebrow "Nâng tầm trải nghiệm" (class: `uppercase tracking-wider`) và loại bỏ các thẻ `div` phát sáng nền (chứa `animate-pulse-slow`) tại `Website/src/features/home/components/PremiumSection.jsx`
- [x] T005 [P] [US1] Xóa bỏ dòng chữ eyebrow "Bộ Sưu Tập" và loại bỏ background blob (chứa `blur-[120px]`) tại `Website/src/features/home/components/CollectionsSection.jsx`
- [x] T006 [P] [US1] Xóa bỏ dòng chữ eyebrow "Liên hệ với chúng tôi" tại `Website/src/features/home/components/ContactSection.jsx`
- [x] T007 [P] [US1] Thay thế các khối chữ dùng cấu trúc gradient in nghiêng trang trí tại `Website/src/features/home/components/CollectionsSection.jsx` thành chữ typography thuần túy thanh lịch hơn.

**Checkpoint**: Không còn đốm sáng mờ chớp nháy và nhãn phụ (eyebrow) vô nghĩa.

---

## Phase 4: User Story 2 - Cải thiện cấu trúc bố cục chống nhàm chán (Priority: P2)

**Goal**: Đa dạng hóa bố cục để không lặp lại 50/50 Zigzag ở các thẻ. Hỗ trợ responsive mobile hoàn hảo.

**Independent Test**: Kích thước giao diện thu nhỏ xuống < 768px không bị tràn viền, các Section có bố cục mạch lạc.

### Implementation for User Story 2

- [x] T008 [US2] Cấu trúc lại bố cục của `Website/src/features/home/components/CollectionsSection.jsx` trên màn hình lớn để tối ưu khả năng hiển thị thẻ, khác biệt hẳn so với cấu trúc hai cột của phần Contact.
- [x] T009 [US2] Đảm bảo cấu trúc CSS Grid / Flex-col của `PremiumSection.jsx` hiển thị dọc tốt trên màn hình Mobile.
- [x] T010 [US2] Đảm bảo CSS của `CollectionsSection.jsx` không bị tràn viền (overflow-x) gây lỗi UI trên màn hình Mobile. (dưới 768px).

**Checkpoint**: Layout đa dạng và hoàn toàn Responsive trên Mobile.

---

## Phase 5: User Story 3 - Trải nghiệm điều hướng mạch lạc (Priority: P3)

**Goal**: Đồng bộ CTA và di chuyển/xóa nút Floating Theme Switcher lơ lửng.

**Independent Test**: Nút đặt sân giống hệt nhau, không còn nút lơ lửng góc dưới màn hình.

### Implementation for User Story 3

- [x] T011 [P] [US3] Cập nhật label của nút bấm từ "Gửi tin nhắn" thành "Đặt Sân Ngay" (hoặc đồng bộ theo từ khóa chính) tại `Website/src/features/home/components/ContactSection.jsx`
- [x] T012 [US3] Tìm và gỡ bỏ nút Floating Theme Switcher lơ lửng ở cuối màn hình đang được nhúng trong `Website/src/App.jsx`
- [x] T013 [US3] Thiết lập hardcode (khóa) Theme mặc định là "Dark" cho toàn trang chủ để duy trì định hướng Immersive hoặc đưa Theme Switcher lên Component Top Navbar của `Website/src/App.jsx`.

**Checkpoint**: Các nút CTA thống nhất, không còn Floating elements vướng víu.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T014 Chạy kiểm tra lint (`npm run lint` hoặc tương đương) để đảm bảo code gọn gàng, không có unused imports do quá trình dọn dẹp.
- [x] T015 Chạy Website trên local và kiểm tra responsive mode trên trình duyệt mô phỏng để xác nhận layout không bị vỡ.
- [x] T016 Build kiểm tra (`npm run build`) để đảm bảo quá trình optimize asset không gặp lỗi.đảm bảo code hoạt động ổn định.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Bắt đầu ngay.
- **Foundational (Phase 2)**: Ngay sau khi Setup. Xác định kỹ các file.
- **User Stories (Phase 3+)**: Có thể tiến hành theo đúng thứ tự P1 -> P2 -> P3. 
- **Polish (Final Phase)**: Chạy cuối cùng để QA.

### Parallel Opportunities

- Các task có đánh dấu [P] ở Phase 3 (T003 -> T007) có thể tiến hành sửa đồng thời vì nằm rải rác trên các components độc lập.
