# Implementation Plan: fix-booking-cancel-status

**Branch**: `[002-fix-booking-cancel-status]` | **Date**: 2026-07-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-fix-booking-cancel-status/spec.md`

## Summary

The user is experiencing an issue where cancelling out of the payment screen leaves the booking status as "Pending". We will fix this by capturing the cancellation event in `CheckoutScreen` (both WebView redirect and hardware/software Back button) and making an API call (`DELETE /api/bookings/{bookingId}`) to manually cancel the booking on the backend before popping the navigation stack.

## Technical Context

**Language/Version**: Dart 3.x / Flutter

**Primary Dependencies**: `webview_flutter`, internal `ApiClient`, `BookingRepository`

**Target Platform**: Android

**Project Type**: Mobile App

**Constraints**: "Không được chỉnh sửa backend" (Backend Immutability). Must use existing `DELETE /api/bookings/{bookingId}` API.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Backend rule check: Backend is entirely immutable. No backend files will be touched. The solution relies 100% on frontend changes.

## Project Structure

### Documentation (this feature)

```text
specs/002-fix-booking-cancel-status/
├── plan.md              
├── research.md          
├── data-model.md        
├── quickstart.md        
├── contracts/           
└── tasks.md             
```

### Source Code

```text
AndroidApp/
└── lib/src/features/booking/presentation/screens/
    └── checkout_screen.dart
```

**Structure Decision**: Single screen update. We will inject the API call logic into the existing `checkout_screen.dart`.
