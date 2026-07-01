using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Repositories.Context;
using Services.Interfaces;

namespace Services.Implementations
{
    public class AdminService : IAdminService
    {
        private readonly SmashClubContext _context;

        public AdminService(SmashClubContext context)
        {
            _context = context;
        }

        public async Task<object> GetSystemStatisticsAsync()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalPlayers = await _context.Users.CountAsync(u => u.RoleId == 2);
            var totalOwners = await _context.Users.CountAsync(u => u.RoleId == 3);
            var totalFacilities = await _context.Facilities.CountAsync();
            var totalCourts = await _context.Courts.CountAsync();
            var totalBookings = await _context.Bookings.CountAsync();
            var totalRevenue = await _context.Payments
                .Where(p => p.StatusId == 2) // Paid
                .SumAsync(p => p.Amount);

            // Recent 10 bookings
            var recentBookings = await _context.Bookings
                .Include(b => b.Court).ThenInclude(c => c.Facility)
                .Include(b => b.BookedByUser)
                .Include(b => b.Status)
                .OrderByDescending(b => b.CreatedAt)
                .Take(10)
                .Select(b => new
                {
                    b.BookingId,
                    CustomerName = b.BookedByUserId != null ? b.BookedByUser.FullName : b.CustomerNameOffline,
                    CustomerEmail = b.BookedByUserId != null ? b.BookedByUser.Email : "Khách vãng lai",
                    CourtName = b.Court.CourtName,
                    FacilityName = b.Court.Facility.Name,
                    b.StartTime,
                    b.EndTime,
                    b.TotalCost,
                    b.StatusId,
                    StatusName = b.Status.StatusName,
                    b.CreatedAt
                })
                .ToListAsync();

            // Monthly revenue for the past 6 months
            var today = DateTime.Today;
            var monthlyRevenue = new List<object>();
            for (int i = 5; i >= 0; i--)
            {
                var targetMonth = today.AddMonths(-i);
                var startOfMonth = new DateTime(targetMonth.Year, targetMonth.Month, 1);
                var endOfMonth = startOfMonth.AddMonths(1).AddTicks(-1);

                var revenue = await _context.Payments
                    .Where(p => p.StatusId == 2 && p.PaidAt >= startOfMonth && p.PaidAt <= endOfMonth)
                    .SumAsync(p => p.Amount);

                var bookingCount = await _context.Bookings
                    .Where(b => b.StatusId == 2 && b.StartTime >= startOfMonth && b.StartTime <= endOfMonth)
                    .CountAsync();

                monthlyRevenue.Add(new
                {
                    Label = $"{targetMonth.Month}/{targetMonth.Year}",
                    Revenue = revenue,
                    BookingCount = bookingCount
                });
            }

            return new
            {
                TotalUsers = totalUsers,
                TotalPlayers = totalPlayers,
                TotalOwners = totalOwners,
                TotalFacilities = totalFacilities,
                TotalCourts = totalCourts,
                TotalBookings = totalBookings,
                TotalRevenue = totalRevenue,
                RecentBookings = recentBookings,
                MonthlyRevenue = monthlyRevenue
            };
        }

        public async Task<object> GetAllUsersAsync()
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new
                {
                    u.UserId,
                    u.FullName,
                    u.Email,
                    u.PhoneNumber,
                    u.RoleId,
                    RoleName = u.Role.RoleName,
                    u.CreatedAt,
                    IsActive = u.IsActive ?? false,
                    u.BanUntil
                })
                .ToListAsync();

            return users;
        }

        public async Task<bool> ChangeUserRoleAsync(Guid userId, int roleId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) throw new KeyNotFoundException("Không tìm thấy người dùng.");

            var roleExists = await _context.UserRoles.AnyAsync(r => r.RoleId == roleId);
            if (!roleExists) throw new ArgumentException("Role ID không hợp lệ.");

            user.RoleId = roleId;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<string> ToggleUserStatusAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) throw new KeyNotFoundException("Không tìm thấy người dùng.");

            user.IsActive = !(user.IsActive ?? false);
            await _context.SaveChangesAsync();

            return (user.IsActive ?? false) ? "Kích hoạt tài khoản thành công." : "Khóa tài khoản thành công.";
        }

        public async Task<object> GetAllFacilitiesAsync()
        {
            var facilities = await _context.Facilities
                .Include(f => f.Owner)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new
                {
                    f.FacilityId,
                    f.Name,
                    f.City,
                    f.District,
                    f.Address,
                    f.PhoneNumber,
                    f.CreatedAt,
                    f.StatusId,
                    OwnerName = f.Owner.FullName,
                    OwnerEmail = f.Owner.Email
                })
                .ToListAsync();

            return facilities;
        }

        public async Task<bool> DeleteFacilityAsync(int facilityId)
        {
            var facility = await _context.Facilities.FindAsync(facilityId);
            if (facility == null) throw new KeyNotFoundException("Không tìm thấy cơ sở.");
            
            facility.IsDelete = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<object> GetPayoutRequestsAsync()
        {
            var requests = await _context.PayoutRequests
                .Include(pr => pr.Facility).ThenInclude(f => f.Owner)
                .Include(pr => pr.BankAccount)
                .OrderByDescending(pr => pr.RequestedAt)
                .Select(pr => new
                {
                    pr.PayoutId,
                    pr.FacilityId,
                    FacilityName = pr.Facility.Name,
                    OwnerName = pr.Facility.Owner.FullName,
                    OwnerEmail = pr.Facility.Owner.Email,
                    pr.Amount,
                    pr.BankAccountId,
                    pr.BankAccount.BankName,
                    pr.BankAccount.AccountNumber,
                    pr.BankAccount.AccountHolder,
                    pr.StatusId,
                    StatusName = pr.StatusId == 1 ? "Pending" : pr.StatusId == 2 ? "Completed" : "Failed",
                    pr.TransactionRef,
                    pr.RequestedAt,
                    pr.ProcessedAt,
                    pr.Note
                })
                .ToListAsync();

            return requests;
        }

        public async Task<bool> ApprovePayoutRequestAsync(Guid payoutId, string transactionRef, string note)
        {
            var payoutRequest = await _context.PayoutRequests
                .Include(pr => pr.Facility)
                .FirstOrDefaultAsync(pr => pr.PayoutId == payoutId);

            if (payoutRequest == null) throw new KeyNotFoundException("Không tìm thấy yêu cầu rút tiền.");
            if (payoutRequest.StatusId != 1) throw new InvalidOperationException("Yêu cầu này đã được xử lý trước đó.");

            var wallet = await _context.FacilityWallets
                .FirstOrDefaultAsync(w => w.FacilityId == payoutRequest.FacilityId);

            if (wallet == null || wallet.Balance < payoutRequest.Amount)
                throw new InvalidOperationException("Số dư tài khoản ví của cơ sở không đủ để rút.");

            wallet.Balance -= payoutRequest.Amount;
            wallet.LastUpdatedAt = DateTime.Now;

            payoutRequest.StatusId = 2; // Completed
            payoutRequest.ProcessedAt = DateTime.Now;
            payoutRequest.TransactionRef = transactionRef ?? "BANK_TRANSFER_OK";
            payoutRequest.Note = note ?? "Yêu cầu rút tiền được Admin phê duyệt.";

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RejectPayoutRequestAsync(Guid payoutId, string note)
        {
            var payoutRequest = await _context.PayoutRequests.FindAsync(payoutId);

            if (payoutRequest == null) throw new KeyNotFoundException("Không tìm thấy yêu cầu rút tiền.");
            if (payoutRequest.StatusId != 1) throw new InvalidOperationException("Yêu cầu này đã được xử lý trước đó.");

            payoutRequest.StatusId = 3; // Failed/Rejected
            payoutRequest.ProcessedAt = DateTime.Now;
            payoutRequest.Note = note ?? "Yêu cầu rút tiền bị Admin từ chối.";

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
