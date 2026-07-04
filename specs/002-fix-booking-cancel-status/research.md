# Research: fix-booking-cancel-status

## Decision: App-Side API Call for Cancellation
**Rationale**: When the user clicks the "Back" button or the WebView intercepts a cancellation URL during checkout on the `CheckoutScreen`, the Android App currently only closes the screen (`Navigator.pop(false)`) without notifying the backend. Since the backend treats the booking as "Pending" while waiting for the payment gateway webhook, it will remain "Pending" indefinitely (or until a cron job expires it) unless explicitly told. We must call the existing `BookingRepository.cancelBooking(bookingId)` right before we pop the screen.
**Alternatives considered**: Modifying the backend payment webhook to handle UI-driven cancellation. However, this violates the "Không được chỉnh sửa backend" rule. The App-Side API Call uses existing infrastructure.

## Decision: Injecting Repository / ApiClient into CheckoutScreen
**Rationale**: Currently, `CheckoutScreen` does not have access to `BookingRepository`. It can instantiate `ApiClient` and manually call `DELETE /api/bookings/{bookingId}`, or we can instantiate `BookingRepositoryImpl(BookingRemoteDataSource(ApiClient()))` inside `_CheckoutScreenState` to call it. Since `cancelBooking` exists in the repository, we will instantiate it and call it.
**Alternatives considered**: Passing `BookingRepository` from `SlotSelectionScreen`. This requires modifying the constructor of `CheckoutScreen`, but is cleaner architecture. We will instantiate it locally inside `initState` of `CheckoutScreen` to minimize touch points.
