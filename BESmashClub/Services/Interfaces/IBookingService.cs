using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Entites.DTOs.Bookings;
using Entites.DTOs.Common;

namespace Services.Interfaces;

public interface IBookingService
{
    Task<BookingResponse> CreateBookingAsync(Guid userId, CreateBookingRequest request);
    Task<BatchBookingResponse> CreateBatchBookingAsync(Guid userId, List<CreateBookingRequest> requests);
    Task<PagedResult<BookingResponse>> GetBookingsByUserAsync(Guid userId, PaginationParams pagination);
    Task<BookingResponse> GetBookingDetailAsync(Guid bookingId);
    Task<BookingResponse> UpdateBookingAsync(Guid userId, Guid bookingId, UpdateBookingRequest request);
    Task CancelBookingAsync(Guid userId, Guid bookingId, string? reason = null);
}
