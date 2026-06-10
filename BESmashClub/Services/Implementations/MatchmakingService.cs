using Entites.DTOs.Matchmaking;
using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories;
using Services.Interfaces;

namespace Services.Implementations;

public class MatchmakingService : IMatchmakingService
{
    private readonly UnitOfWork _unitOfWork;
    private readonly IPaymentService _paymentService;

    public MatchmakingService(UnitOfWork unitOfWork, IPaymentService paymentService)
    {
        _unitOfWork = unitOfWork;
        _paymentService = paymentService;
    }

    public async Task<MatchChallengeResponse> CreateChallengeAsync(Guid userId, CreateMatchChallengeRequest request)
    {
        var schedule = await _unitOfWork.Schedules.GetDetailAsync(request.ScheduleId);
        if (schedule == null)
            throw new KeyNotFoundException("Không tìm thấy lịch chơi.");

        if (!await _unitOfWork.TeamMembers.IsLeaderAsync(request.HostTeamId, userId))
            throw new UnauthorizedAccessException("Chỉ Leader của đội chủ nhà mới có quyền tạo ghép đấu.");

        var booking = schedule.Booking;
        if (booking == null)
            throw new InvalidOperationException("Lịch chơi chưa được liên kết với lượt đặt sân hợp lệ.");

        // Check if there is already an active challenge for this schedule
        var context = _unitOfWork.MatchChallenges.GetContext();
        var existing = await context.Set<MatchChallenge>()
            .FirstOrDefaultAsync(c => c.ScheduleId == request.ScheduleId && c.StatusId == 1);
        if (existing != null)
            throw new InvalidOperationException("Lịch chơi này đã có tin ghép đấu đang tìm đối thủ.");

        var challenge = new MatchChallenge
        {
            ChallengeId = Guid.NewGuid(),
            ScheduleId = request.ScheduleId,
            HostTeamId = request.HostTeamId,
            SportId = request.SportId,
            StatusId = 1, // Open
            TotalCost = booking.TotalCost ?? 0,
            IsCostSplit = request.IsCostSplit,
            Message = request.Message,
            CreatedAt = DateTime.Now
        };

        await _unitOfWork.MatchChallenges.CreateAsync(challenge);

        return await GetChallengeDetailResponseAsync(challenge.ChallengeId);
    }

    public async Task<List<MatchChallengeResponse>> GetActiveChallengesAsync(int? sportId, string? city, string? district)
    {
        var activeChallenges = await _unitOfWork.MatchChallenges.GetActiveChallengesAsync(sportId, city, district);
        return activeChallenges.Select(MapToResponse).ToList();
    }

    public async Task<List<MatchChallengeMapResponse>> GetChallengesForMapAsync()
    {
        var context = _unitOfWork.MatchChallenges.GetContext();
        
        return await context.Set<MatchChallenge>()
            .Where(m => m.StatusId == 1) // Open
            .Include(m => m.Schedule).ThenInclude(s => s.Booking).ThenInclude(b => b.Court).ThenInclude(c => c.Facility)
            .GroupBy(m => m.Schedule.Booking.Court.Facility)
            .Select(g => new MatchChallengeMapResponse
            {
                FacilityId = g.Key.FacilityId,
                FacilityName = g.Key.Name,
                Latitude = g.Key.Latitude,
                Longitude = g.Key.Longitude,
                ActiveChallengeCount = g.Count()
            })
            .ToListAsync();
    }

    public async Task<MatchAcceptanceResponse> JoinChallengeAsync(Guid userId, Guid challengeId, Guid challengerTeamId)
    {
        if (!await _unitOfWork.TeamMembers.IsLeaderAsync(challengerTeamId, userId))
            throw new UnauthorizedAccessException("Chỉ Leader mới có quyền đăng ký tham gia ghép đấu.");

        var challenge = await _unitOfWork.MatchChallenges.GetByIdAsync(challengeId);
        if (challenge == null || challenge.StatusId != 1)
            throw new InvalidOperationException("Trận ghép đấu không tồn tại hoặc đã đóng.");

        if (challenge.HostTeamId == challengerTeamId)
            throw new InvalidOperationException("Đội chủ nhà không thể tự gia nhập trận ghép đấu của mình.");

        // Check if already requested
        var context = _unitOfWork.MatchAcceptances.GetContext();
        var existing = await context.Set<MatchAcceptance>()
            .FirstOrDefaultAsync(ma => ma.ChallengeId == challengeId && ma.ChallengerTeamId == challengerTeamId);
        if (existing != null)
            throw new InvalidOperationException("Đội của bạn đã gửi yêu cầu gia nhập trận ghép này trước đó.");

        var acceptance = new MatchAcceptance
        {
            AcceptanceId = Guid.NewGuid(),
            ChallengeId = challengeId,
            ChallengerTeamId = challengerTeamId,
            StatusId = 1, // Pending
            CreatedAt = DateTime.Now
        };

        await _unitOfWork.MatchAcceptances.CreateAsync(acceptance);

        var challengerTeam = await _unitOfWork.Teams.GetByIdAsync(challengerTeamId);

        return new MatchAcceptanceResponse
        {
            AcceptanceId = acceptance.AcceptanceId,
            ChallengeId = acceptance.ChallengeId,
            ChallengerTeamId = acceptance.ChallengerTeamId,
            ChallengerTeamName = challengerTeam?.TeamName ?? "Đội đối thủ",
            StatusId = acceptance.StatusId,
            StatusName = "Pending",
            CreatedAt = acceptance.CreatedAt
        };
    }

    public async Task<List<MatchAcceptanceResponse>> GetAcceptancesAsync(Guid userId, Guid challengeId)
    {
        var challenge = await _unitOfWork.MatchChallenges.GetByIdAsync(challengeId);
        if (challenge == null)
            throw new KeyNotFoundException("Không tìm thấy trận ghép đấu.");

        if (!await _unitOfWork.TeamMembers.IsLeaderAsync(challenge.HostTeamId, userId))
            throw new UnauthorizedAccessException("Bạn không có quyền xem yêu cầu tham gia trận ghép này.");

        var acceptances = await _unitOfWork.MatchAcceptances.GetByChallengeIdAsync(challengeId);
        return acceptances.Select(ma => new MatchAcceptanceResponse
        {
            AcceptanceId = ma.AcceptanceId,
            ChallengeId = ma.ChallengeId,
            ChallengerTeamId = ma.ChallengerTeamId,
            ChallengerTeamName = ma.ChallengerTeam?.TeamName ?? "Đội đối thủ",
            StatusId = ma.StatusId,
            StatusName = ma.Status?.StatusName ?? "Pending",
            DecidedAt = ma.DecidedAt,
            CreatedAt = ma.CreatedAt
        }).ToList();
    }

    public async Task RespondToAcceptanceAsync(Guid userId, Guid acceptanceId, bool accept)
    {
        var acceptance = await _unitOfWork.MatchAcceptances.GetDetailAsync(acceptanceId);
        if (acceptance == null)
            throw new KeyNotFoundException("Không tìm thấy yêu cầu tham gia.");

        var challenge = await _unitOfWork.MatchChallenges.GetByIdAsync(acceptance.ChallengeId);
        if (challenge == null || challenge.StatusId != 1)
            throw new InvalidOperationException("Trận ghép đấu đã kết thúc hoặc không tồn tại.");

        if (!await _unitOfWork.TeamMembers.IsLeaderAsync(challenge.HostTeamId, userId))
            throw new UnauthorizedAccessException("Bạn không có quyền phê duyệt yêu cầu tham gia ghép đấu này.");

        var context = _unitOfWork.MatchAcceptances.GetContext();

        if (accept)
        {
            // 1. Chấp nhận yêu cầu này
            acceptance.StatusId = 2; // Accepted
            acceptance.DecidedAt = DateTime.Now;
            context.Entry(acceptance).State = EntityState.Modified;

            // 2. Từ chối tất cả các yêu cầu khác cho challenge này
            var otherAcceptances = await context.Set<MatchAcceptance>()
                .Where(ma => ma.ChallengeId == challenge.ChallengeId && ma.AcceptanceId != acceptanceId && ma.StatusId == 1)
                .ToListAsync();

            foreach (var oa in otherAcceptances)
            {
                oa.StatusId = 3; // Rejected
                oa.DecidedAt = DateTime.Now;
                context.Entry(oa).State = EntityState.Modified;
            }

            // 3. Cập nhật trạng thái ghép đấu thành Matched
            challenge.StatusId = 2; // Matched
            context.Entry(challenge).State = EntityState.Modified;

            await _unitOfWork.SaveChangesAsync();

            // 4. Nếu chia tiền sân (Cost Split), tạo link thanh toán 50% cho đội đối thủ
            if (challenge.IsCostSplit)
            {
                // Lấy User Leader của đội đối thủ để tạo giao dịch thanh toán
                var challengerLeader = await context.Set<TeamMember>()
                    .Include(tm => tm.User)
                    .FirstOrDefaultAsync(tm => tm.TeamId == acceptance.ChallengerTeamId && tm.TeamRoleId == 1); // 1: Leader

                if (challengerLeader != null)
                {
                    // Tạo hóa đơn thanh toán 50% cho đối thủ
                    await _paymentService.CreateSplitBookingPaymentAsync(challengerLeader.UserId, acceptance.AcceptanceId);
                }
            }
        }
        else
        {
            // Từ chối yêu cầu tham gia
            acceptance.StatusId = 3; // Rejected
            acceptance.DecidedAt = DateTime.Now;
            context.Entry(acceptance).State = EntityState.Modified;

            await _unitOfWork.SaveChangesAsync();
        }
    }

    #region Helpers

    private async Task<MatchChallengeResponse> GetChallengeDetailResponseAsync(Guid challengeId)
    {
        var challenge = await _unitOfWork.MatchChallenges.GetDetailAsync(challengeId);
        if (challenge == null)
            throw new KeyNotFoundException("Không tìm thấy trận ghép đấu.");
        return MapToResponse(challenge);
    }

    private static MatchChallengeResponse MapToResponse(MatchChallenge m)
    {
        return new MatchChallengeResponse
        {
            ChallengeId = m.ChallengeId,
            ScheduleId = m.ScheduleId,
            ScheduleTitle = m.Schedule?.Title ?? "Lịch chơi",
            HostTeamId = m.HostTeamId,
            HostTeamName = m.HostTeam?.TeamName ?? "Đội chủ nhà",
            SportId = m.SportId,
            SportName = m.Sport?.SportName ?? "Thể thao",
            StatusId = m.StatusId,
            StatusName = m.Status?.StatusName ?? "Open",
            TotalCost = m.TotalCost,
            IsCostSplit = m.IsCostSplit,
            Message = m.Message,
            CreatedAt = m.CreatedAt,
            FacilityName = m.Schedule?.Booking?.Court?.Facility?.Name,
            CourtName = m.Schedule?.Booking?.Court?.CourtName,
            StartTime = m.Schedule?.Booking?.StartTime ?? default,
            EndTime = m.Schedule?.Booking?.EndTime ?? default
        };
    }

    #endregion
}
