using Entites.DTOs.Common;
using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories;
using Services.Interfaces;

namespace Services.Implementations;

public class StatusService : IStatusService
{
    private readonly UnitOfWork _unitOfWork;

    public StatusService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<StatusResponse>> GetBookingStatusesAsync()
    {
        var statuses = await _unitOfWork.Booking.GetContext().BookingStatuses
            .Select(s => new StatusResponse { StatusId = s.StatusId, StatusName = s.StatusName })
            .ToListAsync();
        return statuses;
    }

    public async Task<List<StatusResponse>> GetCourtStatusesAsync()
    {
        var statuses = await _unitOfWork.Courts.GetContext().CourtStatuses
            .Select(s => new StatusResponse { StatusId = s.StatusId, StatusName = s.StatusName })
            .ToListAsync();
        return statuses;
    }

    public async Task<List<StatusResponse>> GetPaymentStatusesAsync()
    {
        var statuses = await _unitOfWork.Payments.GetContext().PaymentStatuses
            .Select(s => new StatusResponse { StatusId = s.StatusId, StatusName = s.StatusName })
            .ToListAsync();
        return statuses;
    }

    public async Task<List<StatusResponse>> GetPayoutStatusesAsync()
    {
        var statuses = await _unitOfWork.Payouts.GetContext().Set<PayoutStatus>()
            .Select(s => new StatusResponse { StatusId = s.StatusId, StatusName = s.StatusName })
            .ToListAsync();
        return statuses;
    }
}
