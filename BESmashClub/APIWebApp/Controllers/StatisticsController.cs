using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Entites.DTOs.Common;
using Entites.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Repositories.Context;

namespace APIWebApp.Controllers;

[Authorize]
[ApiController]
[Route("api/statistics")]
public class StatisticsController : ControllerBase
{
    private readonly SmashClubContext _context;

    public StatisticsController(SmashClubContext context)
    {
        _context = context;
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("me")]
    public async Task<IActionResult> GetMyStatistics()
    {
        var userId = GetCurrentUserId();

        // Find user role to determine if they are a FacilityOwner (RoleId = 3)
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound(ApiResponse.ErrorResponse("Không tìm thấy người dùng."));

        var response = new UserStatisticsResponse
        {
            IsLeader = await _context.TeamMembers.AnyAsync(tm => tm.UserId == userId && tm.TeamRoleId == 1),
            IsMember = await _context.TeamMembers.AnyAsync(tm => tm.UserId == userId && tm.TeamRoleId == 2),
            IsFacilityOwner = user.RoleId == 3
        };

        // 1. General Stats (applicable to all users)
        var wins = await _context.TeamMembers.Where(tm => tm.UserId == userId).SumAsync(tm => tm.Wins);
        var losses = await _context.TeamMembers.Where(tm => tm.UserId == userId).SumAsync(tm => tm.Losses);
        
        // Find most played sport
        var mostPlayedSport = await _context.ScheduleParticipants
            .Where(sp => sp.UserId == userId)
            .GroupBy(sp => sp.Schedule.Booking.Court.Sport.SportName)
            .OrderByDescending(g => g.Count())
            .Select(g => g.Key)
            .FirstOrDefaultAsync() ?? "Chưa có";

        response.GeneralStats = new GeneralStatsDto
        {
            TotalMatchesJoined = await _context.ScheduleParticipants.CountAsync(sp => sp.UserId == userId),
            TotalSpending = await _context.Payments
                .Where(p => p.UserId == userId && p.StatusId == 2) // status 2 is Paid
                .SumAsync(p => p.Amount),
            Wins = wins,
            Losses = losses,
            WinRate = (wins + losses) > 0 ? Math.Round((double)wins / (wins + losses) * 100, 1) : 0,
            MostPlayedSport = mostPlayedSport
        };

        // 2. Leader Stats (if user is team leader)
        if (response.IsLeader)
        {
            var ledTeamIds = await _context.TeamMembers
                .Where(tm => tm.UserId == userId && tm.TeamRoleId == 1)
                .Select(tm => tm.TeamId)
                .ToListAsync();

            var hostedSessionsCount = await _context.Schedules
                .CountAsync(s => ledTeamIds.Contains(s.HostTeamId));

            var totalAdvancedBookingFee = await _context.Schedules
                .Where(s => ledTeamIds.Contains(s.HostTeamId))
                .Select(s => s.Booking)
                .Where(b => b.BookedByUserId == userId && b.StatusId == 2) // Paid/Confirmed
                .SumAsync(b => b.TotalCost);

            var totalMembersManaged = await _context.TeamMembers
                .Where(tm => ledTeamIds.Contains(tm.TeamId) && tm.UserId != userId)
                .Select(tm => tm.UserId)
                .Distinct()
                .CountAsync();

            response.LeaderStats = new LeaderStatsDto
            {
                HostedSessionsCount = hostedSessionsCount,
                TotalAdvancedBookingFee = totalAdvancedBookingFee ?? 0,
                TotalMembersManaged = totalMembersManaged
            };
        }

        // 3. Member Stats (if user is team member)
        if (response.IsMember)
        {
            var memberTeamIds = await _context.TeamMembers
                .Where(tm => tm.UserId == userId && tm.TeamRoleId == 2)
                .Select(tm => tm.TeamId)
                .ToListAsync();

            var totalSchedulesCount = await _context.Schedules
                .CountAsync(s => memberTeamIds.Contains(s.HostTeamId));

            var totalAttended = await _context.ScheduleParticipants
                .CountAsync(sp => sp.UserId == userId && sp.IsAttended && memberTeamIds.Contains(sp.Schedule.HostTeamId));

            var totalContributedFees = await _context.ScheduleParticipants
                .Where(sp => sp.UserId == userId && sp.IsAttended && memberTeamIds.Contains(sp.Schedule.HostTeamId))
                .SumAsync(sp => sp.Schedule.CostPerPerson);

            response.MemberStats = new MemberStatsDto
            {
                TotalSchedulesCount = totalSchedulesCount,
                TotalAttended = totalAttended,
                AttendanceRate = totalSchedulesCount > 0 ? Math.Round((double)totalAttended / totalSchedulesCount * 100, 1) : 0,
                TotalContributedFees = totalContributedFees ?? 0
            };
        }

        // 4. Facility Owner Stats (if RoleId = 3)
        if (response.IsFacilityOwner)
        {
            var myFacilityIds = await _context.Facilities
                .Where(f => f.OwnerId == userId)
                .Select(f => f.FacilityId)
                .ToListAsync();

            var myBookingQuery = _context.Bookings
                .Where(b => myFacilityIds.Contains(b.Court.FacilityId) && b.StatusId == 2); // Status 2 = Confirmed/Paid

            // Total bookings & unique customers
            var totalBookingsCount = await myBookingQuery.CountAsync();
            var uniqueCustomersCount = await myBookingQuery.Select(b => b.BookedByUserId).Distinct().CountAsync();
            var totalRevenue = await myBookingQuery.SumAsync(b => b.TotalCost) ?? 0;

            // Most booked court
            var mostBookedCourtObj = await myBookingQuery
                .GroupBy(b => new { b.CourtId, b.Court.CourtName, FacilityName = b.Court.Facility.Name })
                .OrderByDescending(g => g.Count())
                .Select(g => new { g.Key.CourtName, g.Key.FacilityName, Count = g.Count() })
                .FirstOrDefaultAsync();
            var mostBookedCourt = mostBookedCourtObj != null ? $"{mostBookedCourtObj.CourtName} ({mostBookedCourtObj.FacilityName})" : "Chưa có";

            // Peak hour
            var peakHourObj = await myBookingQuery
                .GroupBy(b => b.StartTime.Hour)
                .OrderByDescending(g => g.Count())
                .Select(g => new { Hour = g.Key, Count = g.Count() })
                .FirstOrDefaultAsync();
            var peakHour = peakHourObj != null ? $"{peakHourObj.Hour}:00 - {peakHourObj.Hour + 1}:00" : "Chưa có";

            // Pull raw bookings for last 7 days, months, years to aggregate in memory safely
            var today = DateTime.Today;
            
            // Daily Stats (last 7 days)
            var last7Days = Enumerable.Range(0, 7)
                .Select(i => today.AddDays(-i))
                .OrderBy(d => d)
                .ToList();
            
            var rawDailyBookings = await myBookingQuery
                .Where(b => b.StartTime >= today.AddDays(-6))
                .Select(b => new { Date = b.StartTime.Date, Cost = b.TotalCost ?? 0 })
                .ToListAsync();

            var dailyStats = last7Days.Select(day => new ChartItemDto
            {
                Label = day.ToString("dd/MM"),
                Revenue = rawDailyBookings.Where(b => b.Date == day).Sum(b => b.Cost),
                Count = rawDailyBookings.Count(b => b.Date == day)
            }).ToList();

            // Monthly Stats (12 months of current year)
            var currentYear = today.Year;
            var rawMonthlyBookings = await myBookingQuery
                .Where(b => b.StartTime.Year == currentYear)
                .Select(b => new { Month = b.StartTime.Month, Cost = b.TotalCost ?? 0 })
                .ToListAsync();

            var monthlyStats = Enumerable.Range(1, 12).Select(month => new ChartItemDto
            {
                Label = $"Th. {month}",
                Revenue = rawMonthlyBookings.Where(b => b.Month == month).Sum(b => b.Cost),
                Count = rawMonthlyBookings.Count(b => b.Month == month)
            }).ToList();

            // Yearly Stats (past 3 years)
            var rawYearlyBookings = await myBookingQuery
                .Select(b => new { Year = b.StartTime.Year, Cost = b.TotalCost ?? 0 })
                .ToListAsync();

            var years = rawYearlyBookings.Select(b => b.Year).Distinct().OrderBy(y => y).ToList();
            if (!years.Contains(currentYear)) years.Add(currentYear);
            // Limit to last 3 years
            years = years.OrderByDescending(y => y).Take(3).OrderBy(y => y).ToList();

            var yearlyStats = years.Select(year => new ChartItemDto
            {
                Label = $"Năm {year}",
                Revenue = rawYearlyBookings.Where(b => b.Year == year).Sum(b => b.Cost),
                Count = rawYearlyBookings.Count(b => b.Year == year)
            }).ToList();

            response.FacilityOwnerStats = new FacilityOwnerStatsDto
            {
                TotalBookingsCount = totalBookingsCount,
                UniqueCustomersCount = uniqueCustomersCount,
                PeakHour = peakHour,
                MostBookedCourt = mostBookedCourt,
                TotalRevenue = totalRevenue,
                DailyStats = dailyStats,
                MonthlyStats = monthlyStats,
                YearlyStats = yearlyStats
            };
        }

        return Ok(ApiResponse<UserStatisticsResponse>.SuccessResponse(response));
    }
}

// ─── DTO Definitions ──────────────────────────────────────

public class UserStatisticsResponse
{
    public bool IsLeader { get; set; }
    public bool IsMember { get; set; }
    public bool IsFacilityOwner { get; set; }
    public GeneralStatsDto GeneralStats { get; set; }
    public LeaderStatsDto LeaderStats { get; set; }
    public MemberStatsDto MemberStats { get; set; }
    public FacilityOwnerStatsDto FacilityOwnerStats { get; set; }
}

public class GeneralStatsDto
{
    public int TotalMatchesJoined { get; set; }
    public decimal TotalSpending { get; set; }
    public int Wins { get; set; }
    public int Losses { get; set; }
    public double WinRate { get; set; }
    public string MostPlayedSport { get; set; }
}

public class LeaderStatsDto
{
    public int HostedSessionsCount { get; set; }
    public decimal TotalAdvancedBookingFee { get; set; }
    public int TotalMembersManaged { get; set; }
}

public class MemberStatsDto
{
    public int TotalSchedulesCount { get; set; }
    public int TotalAttended { get; set; }
    public double AttendanceRate { get; set; }
    public decimal TotalContributedFees { get; set; }
}

public class FacilityOwnerStatsDto
{
    public int TotalBookingsCount { get; set; }
    public int UniqueCustomersCount { get; set; }
    public string PeakHour { get; set; }
    public string MostBookedCourt { get; set; }
    public decimal TotalRevenue { get; set; }
    public List<ChartItemDto> DailyStats { get; set; }
    public List<ChartItemDto> MonthlyStats { get; set; }
    public List<ChartItemDto> YearlyStats { get; set; }
}

public class ChartItemDto
{
    public string Label { get; set; }
    public decimal Revenue { get; set; }
    public int Count { get; set; }
}
