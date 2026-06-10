using Entites.DTOs.Common;
using Entites.DTOs.Payments;

namespace Services.Interfaces;

public interface IPaymentService
{
    // Feature 1: Subscription Payment
    Task<PaymentResponse> CreateSubscriptionPaymentAsync(Guid userId, CreateSubscriptionPaymentRequest request);

    // Feature 2: Booking Payment (called internally after booking creation)
    Task<PaymentResponse> CreateBookingPaymentAsync(Guid userId, Guid bookingId);
    Task<PaymentResponse> CreateSplitBookingPaymentAsync(Guid userId, Guid acceptanceId);

    // Webhook handlers
    Task HandleSubscriptionWebhookAsync(string webhookBody);
    Task HandleBookingWebhookAsync(string webhookBody);

    // Query
    Task<PaymentResponse> GetPaymentByIdAsync(Guid paymentId);
    Task<PagedResult<PaymentResponse>> GetPaymentsByUserAsync(Guid userId, PaginationParams pagination);
}
