using Entites.DTOs.Bookings;
using Entites.DTOs.Common;

namespace Services.Interfaces;

public interface IBookingService
{
    Task<BookingResponse> CreateBookingAsync(Guid userId, CreateBookingRequest request);
    Task<PagedResult<BookingResponse>> GetBookingsByUserAsync(Guid userId, PaginationParams pagination);
    Task<BookingResponse> GetBookingDetailAsync(Guid bookingId);
    Task<BookingResponse> UpdateBookingAsync(Guid userId, Guid bookingId, UpdateBookingRequest request);
    Task CancelBookingAsync(Guid userId, Guid bookingId);
}
