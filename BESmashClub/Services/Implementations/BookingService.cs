using Entites.DTOs.Bookings;
using Entites.DTOs.Common;
using Entites.Models;
using Repositories;
using Services.Interfaces;

namespace Services.Implementations;

public class BookingService : IBookingService
{
    private readonly UnitOfWork _unitOfWork;

    public BookingService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<BookingResponse> CreateBookingAsync(Guid userId, CreateBookingRequest request)
    {
        // Validate court exists and is active
        var court = await _unitOfWork.Booking.GetCourtAsync(request.CourtId);
        if (court == null || !court.IsActive)
            throw new KeyNotFoundException("Sân không tồn tại hoặc đã ngừng hoạt động.");

        // Validate time
        if (request.StartTime >= request.EndTime)
            throw new InvalidOperationException("Thời gian bắt đầu phải trước thời gian kết thúc.");

        if (request.StartTime < DateTime.Now)
            throw new InvalidOperationException("Không thể đặt sân trong quá khứ.");

        // Check time slot availability
        if (!await _unitOfWork.Booking.IsTimeSlotAvailableAsync(request.CourtId, request.StartTime, request.EndTime))
            throw new InvalidOperationException("Khung giờ này đã có người đặt. Vui lòng chọn giờ khác.");

        // Calculate total cost based on duration (hours) and court cost
        var durationHours = (decimal)(request.EndTime - request.StartTime).TotalHours;

        var booking = new Booking
        {
            BookingId = Guid.NewGuid(),
            CourtId = request.CourtId,
            BookedByUserId = userId,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            TotalCost = 0, // Can be calculated from CourtCosts if needed
            StatusId = 1, // Pending
            CreatedAt = DateTime.Now
        };

        await _unitOfWork.Booking.CreateAsync(booking);

        return await GetBookingDetailAsync(booking.BookingId);
    }

    public async Task<PagedResult<BookingResponse>> GetBookingsByUserAsync(Guid userId, PaginationParams pagination)
    {
        var (items, totalCount) = await _unitOfWork.Booking
            .GetByUserIdAsync(userId, pagination.PageNumber, pagination.PageSize);

        return new PagedResult<BookingResponse>
        {
            Items = items.Select(MapToResponse).ToList(),
            TotalCount = totalCount,
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }

    public async Task<BookingResponse> GetBookingDetailAsync(Guid bookingId)
    {
        var booking = await _unitOfWork.Booking.GetDetailAsync(bookingId);
        if (booking == null)
            throw new KeyNotFoundException("Không tìm thấy booking.");

        return MapToResponse(booking);
    }

    public async Task<BookingResponse> UpdateBookingAsync(Guid userId, Guid bookingId, UpdateBookingRequest request)
    {
        var booking = await _unitOfWork.Booking.GetDetailAsync(bookingId);
        if (booking == null)
            throw new KeyNotFoundException("Không tìm thấy booking.");

        if (booking.BookedByUserId != userId)
            throw new UnauthorizedAccessException("Bạn không có quyền cập nhật booking này.");

        if (booking.StatusId != 1) // Only Pending can be updated
            throw new InvalidOperationException("Chỉ có thể cập nhật booking ở trạng thái Pending.");

        var newStart = request.StartTime ?? booking.StartTime;
        var newEnd = request.EndTime ?? booking.EndTime;

        if (newStart >= newEnd)
            throw new InvalidOperationException("Thời gian bắt đầu phải trước thời gian kết thúc.");

        // Check time slot if time changed
        if (request.StartTime.HasValue || request.EndTime.HasValue)
        {
            if (!await _unitOfWork.Booking.IsTimeSlotAvailableAsync(
                booking.CourtId, newStart, newEnd, bookingId))
                throw new InvalidOperationException("Khung giờ này đã có người đặt.");
        }

        booking.StartTime = newStart;
        booking.EndTime = newEnd;

        await _unitOfWork.Booking.UpdateAsync(booking);

        return await GetBookingDetailAsync(bookingId);
    }

    public async Task CancelBookingAsync(Guid userId, Guid bookingId)
    {
        var booking = await _unitOfWork.Booking.GetByIdAsync(bookingId);
        if (booking == null)
            throw new KeyNotFoundException("Không tìm thấy booking.");

        if (booking.BookedByUserId != userId)
            throw new UnauthorizedAccessException("Bạn không có quyền hủy booking này.");

        if (booking.StatusId == 3)
            throw new InvalidOperationException("Booking đã được hủy trước đó.");

        booking.StatusId = 3; // Cancelled
        await _unitOfWork.Booking.UpdateAsync(booking);
    }

    #region Helpers

    private static BookingResponse MapToResponse(Booking b)
    {
        return new BookingResponse
        {
            BookingId = b.BookingId,
            CourtId = b.CourtId,
            CourtName = b.Court?.CourtName,
            FacilityName = b.Court?.Facility?.Name,
            SportName = b.Court?.Sport?.SportName,
            BookedByUserId = b.BookedByUserId,
            BookedByUserName = b.BookedByUser?.FullName,
            StartTime = b.StartTime,
            EndTime = b.EndTime,
            TotalCost = b.TotalCost,
            StatusId = b.StatusId,
            StatusName = b.Status?.StatusName,
            CreatedAt = b.CreatedAt
        };
    }

    #endregion
}
