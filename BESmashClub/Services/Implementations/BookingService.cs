using Entites.DTOs.Bookings;
using Entites.DTOs.Common;
using Entites.Models;
using Repositories;
using Services.Interfaces;

namespace Services.Implementations;

public class BookingService : IBookingService
{
    private readonly UnitOfWork _unitOfWork;
    private readonly IPaymentService _paymentService;

    public BookingService(UnitOfWork unitOfWork, IPaymentService paymentService)
    {
        _unitOfWork = unitOfWork;
        _paymentService = paymentService;
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

        // Calculate total cost from CourtCosts
        var totalCost = await CalculateTotalCostAsync(request.CourtId, request.StartTime, request.EndTime);

        // Calculate Platform Fee
        var platformFeeSetting = await _unitOfWork.SystemSettings.GetByIdAsync("PLATFORM_FEE_PERCENTAGE");
        decimal feePercentage = platformFeeSetting != null ? decimal.Parse(platformFeeSetting.SettingValue) : 5.0m;
        decimal platformFee = Math.Round((totalCost * feePercentage) / 100m, 2);

        var booking = new Booking
        {
            BookingId = Guid.NewGuid(),
            CourtId = request.CourtId,
            BookedByUserId = userId,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            TotalCost = totalCost,
            PlatformFee = platformFee,
            StatusId = 1, // Pending
            CreatedAt = DateTime.Now
        };

        using var transaction = await _unitOfWork.Booking.GetContext().Database.BeginTransactionAsync();
        try
        {
            await _unitOfWork.Booking.CreateAsync(booking);

            // Create payment link via PayOS
            var paymentResult = await _paymentService.CreateBookingPaymentAsync(userId, booking.BookingId);

            await transaction.CommitAsync();

            var response = await GetBookingDetailAsync(booking.BookingId);
            response.PaymentUrl = paymentResult.CheckoutUrl;
            return response;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            if (ex is InvalidOperationException || ex is KeyNotFoundException)
                throw;
            throw new InvalidOperationException("Không thể tạo liên kết thanh toán. Lỗi: " + ex.Message);
        }
    }

    public async Task<BatchBookingResponse> CreateBatchBookingAsync(Guid userId, List<CreateBookingRequest> requests)
    {
        if (requests == null || requests.Count == 0)
            throw new ArgumentException("Danh sách yêu cầu đặt sân không được trống.");

        var response = new BatchBookingResponse();
        var bookingsToCreate = new List<Booking>();
        decimal totalCost = 0;
        var courtNames = new List<string>();

        // Validate all and calculate costs
        foreach (var request in requests)
        {
            var court = await _unitOfWork.Booking.GetCourtAsync(request.CourtId);
            if (court == null || !court.IsActive)
                throw new KeyNotFoundException($"Sân ID {request.CourtId} không tồn tại hoặc đã ngừng hoạt động.");

            if (request.StartTime >= request.EndTime)
                throw new InvalidOperationException($"Thời gian bắt đầu phải trước thời gian kết thúc ở sân {court.CourtName}.");

            if (request.StartTime < DateTime.Now)
                throw new InvalidOperationException($"Không thể đặt sân trong quá khứ ở sân {court.CourtName}.");

            if (!await _unitOfWork.Booking.IsTimeSlotAvailableAsync(request.CourtId, request.StartTime, request.EndTime))
                throw new InvalidOperationException($"Sân {court.CourtName} trong khung giờ {request.StartTime:HH:mm} - {request.EndTime:HH:mm} đã có người đặt.");

            var cost = await CalculateTotalCostAsync(request.CourtId, request.StartTime, request.EndTime);
            totalCost += cost;

            var platformFeeSetting = await _unitOfWork.SystemSettings.GetByIdAsync("PLATFORM_FEE_PERCENTAGE");
            decimal feePercentage = platformFeeSetting != null ? decimal.Parse(platformFeeSetting.SettingValue) : 5.0m;
            decimal platformFee = Math.Round((cost * feePercentage) / 100m, 2);

            var booking = new Booking
            {
                BookingId = Guid.NewGuid(),
                CourtId = request.CourtId,
                BookedByUserId = userId,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                TotalCost = cost,
                PlatformFee = platformFee,
                StatusId = 1, // Pending
                CreatedAt = DateTime.Now
            };

            bookingsToCreate.Add(booking);
            courtNames.Add(court.CourtName ?? "Sân");
        }

        using var transaction = await _unitOfWork.Booking.GetContext().Database.BeginTransactionAsync();
        try
        {
            foreach (var b in bookingsToCreate)
            {
                await _unitOfWork.Booking.CreateAsync(b);
            }

            var bookingIds = bookingsToCreate.Select(b => b.BookingId).ToList();
            var description = $"Dat nhieu san: {string.Join(", ", courtNames.Distinct())}";

            // Create a single consolidated payment
            var paymentResult = await _paymentService.CreateBatchBookingPaymentAsync(userId, bookingIds, totalCost, description);

            await transaction.CommitAsync();

            foreach (var b in bookingsToCreate)
            {
                var detail = await GetBookingDetailAsync(b.BookingId);
                response.Bookings.Add(detail);
            }
            response.PaymentUrl = paymentResult.CheckoutUrl;
            return response;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            if (ex is InvalidOperationException || ex is KeyNotFoundException)
                throw;
            throw new InvalidOperationException("Không thể tạo giao dịch đặt sân gộp. Lỗi: " + ex.Message);
        }
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

        // Recalculate total cost when time changes
        if (request.StartTime.HasValue || request.EndTime.HasValue)
        {
            booking.TotalCost = await CalculateTotalCostAsync(booking.CourtId, newStart, newEnd);
        }

        await _unitOfWork.Booking.UpdateAsync(booking);

        return await GetBookingDetailAsync(bookingId);
    }

    public async Task CancelBookingAsync(Guid userId, Guid bookingId, string? reason = null)
    {
        var booking = await _unitOfWork.Booking.GetByIdAsync(bookingId);
        if (booking == null)
            throw new KeyNotFoundException("Không tìm thấy booking.");

        if (booking.BookedByUserId != userId)
            throw new UnauthorizedAccessException("Bạn không có quyền hủy booking này.");

        if (booking.StatusId == 3)
            throw new InvalidOperationException("Booking đã được hủy trước đó.");

        booking.StatusId = 3; // Cancelled
        booking.CancellationReason = string.IsNullOrWhiteSpace(reason) ? "Người dùng tự hủy" : reason;
        await _unitOfWork.Booking.UpdateAsync(booking);
    }

    #region Helpers

    /// <summary>
    /// Tính tổng chi phí booking dựa trên CourtCost.
    /// Mỗi CourtCost định nghĩa: khung giờ (StartTime-EndTime), đơn vị tính phí (DurationMinutes), giá (Cost).
    /// Logic: tìm overlap giữa booking time và từng CourtCost, chia overlap cho DurationMinutes, nhân Cost.
    /// Nếu không có CourtCost nào cover toàn bộ khung giờ booking → throw exception.
    /// </summary>
    private async Task<decimal> CalculateTotalCostAsync(int courtId, DateTime bookingStart, DateTime bookingEnd)
    {
        var startTime = TimeOnly.FromDateTime(bookingStart);
        var endTime = TimeOnly.FromDateTime(bookingEnd);

        var sysDayOfWeek = (int)bookingStart.DayOfWeek;
        var dbDayOfWeek = sysDayOfWeek == 0 ? 8 : sysDayOfWeek + 1;

        var courtCosts = await _unitOfWork.CourtCosts.GetCostsForTimeRangeAsync(courtId, dbDayOfWeek, startTime, endTime);

        if (courtCosts.Count == 0)
            throw new InvalidOperationException("Không tìm thấy bảng giá cho khung giờ này. Vui lòng liên hệ chủ sân.");

        // Check coverage: verify that the union of all CourtCost ranges covers [startTime, endTime)
        var coveredMinutes = 0;
        var totalBookingMinutes = (int)(bookingEnd - bookingStart).TotalMinutes;

        decimal totalCost = 0;

        foreach (var cc in courtCosts)
        {
            // Calculate overlap between booking time and this CourtCost's time range
            var overlapStart = startTime > cc.StartTime ? startTime : cc.StartTime;
            var overlapEnd = endTime < cc.EndTime ? endTime : cc.EndTime;

            if (overlapStart >= overlapEnd)
                continue;

            var overlapMinutes = (int)(overlapEnd.ToTimeSpan() - overlapStart.ToTimeSpan()).TotalMinutes;
            coveredMinutes += overlapMinutes;

            // Cost = (overlapMinutes / DurationMinutes) * Cost
            var units = (decimal)overlapMinutes / cc.DurationMinutes;
            totalCost += units * cc.Cost;
        }

        if (coveredMinutes < totalBookingMinutes)
            throw new InvalidOperationException(
                $"Bảng giá chưa cover đủ khung giờ booking. " +
                $"Đã cover {coveredMinutes}/{totalBookingMinutes} phút. Vui lòng liên hệ chủ sân.");

        return Math.Round(totalCost, 2);
    }

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
            PlatformFee = b.PlatformFee ?? 0,
            StatusId = b.StatusId,
            StatusName = b.Status?.StatusName,
            CancellationReason = b.CancellationReason,
            HasSchedule = b.Schedules != null && b.Schedules.Any(),
            CreatedAt = b.CreatedAt
        };
    }

    #endregion
}

