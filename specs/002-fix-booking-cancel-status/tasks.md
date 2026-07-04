# Tasks: fix-booking-cancel-status

**Input**: Design documents from `/specs/002-fix-booking-cancel-status/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-contracts.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure
*(No setup tasks required for this bug fix as the project is already initialized)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented
*(No foundational tasks required for this bug fix as the repository and API client are already available)*

---

## Phase 3: User Story 1 - Cancel Booking from Payment Screen (Priority: P1) 🎯 MVP

**Goal**: Ensure that cancelling out of the checkout screen calls the backend API to transition the booking status from "Pending" to "Cancel".

**Independent Test**: Initiate a booking, reach the payment screen, press the back/cancel button, and verify the booking history shows "Cancel".

### Implementation for User Story 1

- [x] T001 [US1] Initialize `BookingRepositoryImpl` with `ApiClient` in `_CheckoutScreenState` in `AndroidApp/lib/src/features/booking/presentation/screens/checkout_screen.dart`
- [x] T002 [US1] Update `_handlePaymentCancelled` and Back button dialog in `AndroidApp/lib/src/features/booking/presentation/screens/checkout_screen.dart` to await `_bookingRepository.cancelBooking(widget.bookingId)` before popping the navigator, handling loading state appropriately.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T003 Run quickstart.md validation to ensure the bug is fixed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: N/A
- **Foundational (Phase 2)**: N/A
- **User Stories (Phase 3+)**: Can start immediately.
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies.

### Within Each User Story

- Initialize repository before using it.

### Parallel Opportunities

- N/A

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3: User Story 1
2. **STOP and VALIDATE**: Test User Story 1 independently
3. Deploy/demo if ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
