using Entites.DTOs.Common;

namespace Services.Interfaces;

public interface IStatusService
{
    Task<List<StatusResponse>> GetBookingStatusesAsync();
    Task<List<StatusResponse>> GetCourtStatusesAsync();
    Task<List<StatusResponse>> GetPaymentStatusesAsync();
    Task<List<StatusResponse>> GetPayoutStatusesAsync();
}
