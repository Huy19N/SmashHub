using System;
using System.Threading.Tasks;

namespace Services.Interfaces
{
    public interface IAdminService
    {
        Task<object> GetSystemStatisticsAsync();
        Task<object> GetAllUsersAsync();
        Task<bool> ChangeUserRoleAsync(Guid userId, int roleId);
        Task<string> ToggleUserStatusAsync(Guid userId);
        
        Task<object> GetAllFacilitiesAsync();
        Task<bool> DeleteFacilityAsync(int facilityId);
        
        Task<object> GetPayoutRequestsAsync();
        Task<bool> ApprovePayoutRequestAsync(Guid payoutId, string transactionRef, string note);
        Task<bool> RejectPayoutRequestAsync(Guid payoutId, string note);
    }
}
