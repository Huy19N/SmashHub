# Tasks: Optimize Android Performance and UX

**Input**: Design documents from `/specs/003-optimize-android-performance-ux/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure
*(No setup tasks needed, project is already initialized)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented
*(No foundational tasks needed)*

---

## Phase 3: User Story 1 - Optimize App Performance for Production (Priority: P1)

**Goal**: Ensure the app launches quickly and runs smoothly without lag.

**Independent Test**: Measure app startup time and frame rate using release build.

### Implementation for User Story 1

- [x] T001 [P] [US1] Update `AndroidApp/android/app/build.gradle` to ensure `minifyEnabled true` and `shrinkResources true` are configured in the `release` build type to optimize the APK/AAB size and startup performance.

**Checkpoint**: At this point, the release build should be optimized for performance.

---

## Phase 4: User Story 2 - Improve UI Readability and Input UX (Priority: P1)

**Goal**: Improve text legibility, contrast, and input/button tap targets.

**Independent Test**: Navigate to forms (login, checkout) and verify text visibility, field borders, and button tap areas (48x48dp minimum).

### Implementation for User Story 2

- [x] T002 [US2] Update `AndroidApp/lib/src/shared/theme/app_theme.dart` to improve text contrast and typography (adjust colors, font size/weight) in `TextTheme`.
- [x] T003 [US2] Update `AndroidApp/lib/src/shared/theme/app_theme.dart` to add clear borders and padding to `InputDecorationTheme`.
- [x] T004 [US2] Update `AndroidApp/lib/src/shared/theme/app_theme.dart` to set minimum tap target size (48x48 logical pixels) for `ElevatedButtonThemeData`, `OutlinedButtonThemeData`, and `TextButtonThemeData`.

**Checkpoint**: At this point, the entire application will adopt the improved UI and UX configurations.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T005 Run quickstart.md validation to ensure performance and UI improvements work correctly.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: N/A
- **Foundational (Phase 2)**: N/A
- **User Stories (Phase 3+)**: US1 and US2 can run in parallel since they touch completely different domains (Gradle build config vs Flutter theme).
- **Polish (Final Phase)**: Depends on US1 and US2 completion.

### User Story Dependencies

- **User Story 1 (P1)**: Independent.
- **User Story 2 (P1)**: Independent.

### Within Each User Story

- Tasks in US2 should be implemented sequentially as they modify the same file (`app_theme.dart`).

### Parallel Opportunities

- T001 and T002 can be started in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3: User Story 1
2. **STOP and VALIDATE**: Build and test release APK independently.
3. Continue to User Story 2.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Verify tests fail before implementing
- Commit after each task or logical group
- Avoid: cross-story dependencies that break independence
