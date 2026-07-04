# Feature Specification: fix-booking-cancel-status

**Feature Branch**: `[002-fix-booking-cancel-status]`

**Created**: 2026-07-04

**Status**: Draft

**Input**: User description: "Khi người dùng đang ở màn hình thanh toán trên App Android nhưng nhấn hủy/quay lại, trạng thái đơn đặt sân trong 'Lịch sử đặt sân' bị kẹt ở mức 'Pending' thay vì chuyển sang 'Cancel'. Cần gọi API hủy đơn hoặc cập nhật lại UI state khi người dùng hủy thanh toán."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cancel Booking from Payment Screen (Priority: P1)

Users who initiate a booking but decide not to proceed with the payment should see their booking marked as "Canceled" in their booking history rather than remaining stuck in a "Pending" state.

**Why this priority**: Accurate booking status is critical for both the user's peace of mind and the court owner's availability management.

**Independent Test**: Can be fully tested by initiating a booking, reaching the payment screen, pressing the back/cancel button, and verifying the booking history.

**Acceptance Scenarios**:

1. **Given** a user is on the payment screen for a new booking, **When** they press the back button or explicitly cancel the payment, **Then** the booking status must be updated to "Cancel" in the backend and reflected in the UI.
2. **Given** a user has canceled a payment, **When** they navigate to "Lịch sử đặt sân" (Booking History), **Then** the canceled booking should clearly show a "Cancel" status badge instead of "Pending".

### Edge Cases

- What happens if the network connection drops exactly when the user presses back/cancel?
- What happens if the booking was somehow already processed or expired when they try to cancel it from the app?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST intercept the back/cancel action on the Payment Screen.
- **FR-002**: System MUST notify the backend (or internal state) that the payment was intentionally aborted to transition the booking status from "Pending" to "Cancel".
- **FR-003**: The "Lịch sử đặt sân" (Booking History) screen MUST display the updated "Cancel" status correctly.

### Key Entities

- **Booking (Đơn đặt sân)**: The record of the court reservation, including its payment status (Pending, Paid, Cancelled).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of explicitly aborted payments from the Payment Screen result in a "Cancel" status rather than remaining "Pending".
- **SC-002**: Users can see the updated status in their Booking History immediately after canceling.

## Assumptions

- There is already an existing Backend API endpoint to handle booking cancellations or status updates.
- The "Pending" status is currently only meant for bookings that are actively awaiting payment completion, not abandoned ones.
