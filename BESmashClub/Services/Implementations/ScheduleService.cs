using Entites.DTOs.Schedules;
using Entites.Models;
using Repositories;
using Services.Interfaces;

namespace Services.Implementations;

public class ScheduleService : IScheduleService
{
    private readonly UnitOfWork _unitOfWork;

    public ScheduleService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    #region Schedule CRUD

    public async Task<ScheduleResponse> CreateScheduleAsync(Guid userId, Guid teamId, CreateScheduleRequest request)
    {
        // Only Leader can create schedules
        if (!await _unitOfWork.TeamMembers.IsLeaderAsync(teamId, userId))
            throw new UnauthorizedAccessException("Chỉ Leader mới có quyền tạo lịch chơi.");

        var schedule = new Schedule
        {
            ScheduleId = Guid.NewGuid(),
            HostTeamId = teamId,
            Title = request.Title,
            SportId = request.SportId,
            Location = request.Location,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            MaxParticipants = request.MaxParticipants,
            TotalCost = request.TotalCost,
            CostNote = request.CostNote,
            CreatedAt = DateTime.Now
        };

        await _unitOfWork.Schedules.CreateAsync(schedule);

        return await GetScheduleDetailAsync(schedule.ScheduleId);
    }

    public async Task<List<ScheduleResponse>> GetSchedulesByTeamAsync(Guid teamId)
    {
        var schedules = await _unitOfWork.Schedules.GetByTeamIdAsync(teamId);
        return schedules.Select(MapToResponse).ToList();
    }

    public async Task<ScheduleResponse> GetScheduleDetailAsync(Guid scheduleId)
    {
        var schedule = await _unitOfWork.Schedules.GetDetailAsync(scheduleId);
        if (schedule == null)
            throw new KeyNotFoundException("Không tìm thấy lịch chơi.");

        return MapToResponse(schedule);
    }

    public async Task<ScheduleResponse> UpdateScheduleAsync(Guid userId, Guid scheduleId, UpdateScheduleRequest request)
    {
        var schedule = await _unitOfWork.Schedules.GetDetailAsync(scheduleId);
        if (schedule == null)
            throw new KeyNotFoundException("Không tìm thấy lịch chơi.");

        if (!await _unitOfWork.TeamMembers.IsLeaderAsync(schedule.HostTeamId, userId))
            throw new UnauthorizedAccessException("Chỉ Leader mới có quyền cập nhật lịch chơi.");

        if (!string.IsNullOrWhiteSpace(request.Title))
            schedule.Title = request.Title;

        if (!string.IsNullOrWhiteSpace(request.Location))
            schedule.Location = request.Location;

        if (request.StartTime.HasValue)
            schedule.StartTime = request.StartTime.Value;

        if (request.EndTime.HasValue)
            schedule.EndTime = request.EndTime.Value;

        if (request.MaxParticipants.HasValue)
            schedule.MaxParticipants = request.MaxParticipants.Value;

        if (request.TotalCost.HasValue)
            schedule.TotalCost = request.TotalCost.Value;

        if (request.CostNote != null)
            schedule.CostNote = request.CostNote;

        await _unitOfWork.Schedules.UpdateAsync(schedule);

        return await GetScheduleDetailAsync(scheduleId);
    }

    public async Task DeleteScheduleAsync(Guid userId, Guid scheduleId)
    {
        var schedule = await _unitOfWork.Schedules.GetByIdAsync(scheduleId);
        if (schedule == null)
            throw new KeyNotFoundException("Không tìm thấy lịch chơi.");

        if (!await _unitOfWork.TeamMembers.IsLeaderAsync(schedule.HostTeamId, userId))
            throw new UnauthorizedAccessException("Chỉ Leader mới có quyền hủy lịch chơi.");

        await _unitOfWork.Schedules.RemoveAsync(schedule);
    }

    #endregion

    #region Participants

    public async Task<List<ParticipantResponse>> GetParticipantsAsync(Guid scheduleId)
    {
        var participants = await _unitOfWork.ScheduleParticipants.GetByScheduleIdAsync(scheduleId);
        return participants.Select(p => new ParticipantResponse
        {
            UserId = p.UserId,
            FullName = p.User?.FullName,
            IsAttended = p.IsAttended,
            JoinedAt = p.JoinedAt
        }).ToList();
    }

    public async Task<ParticipantResponse> JoinScheduleAsync(Guid userId, Guid scheduleId)
    {
        var schedule = await _unitOfWork.Schedules.GetDetailAsync(scheduleId);
        if (schedule == null)
            throw new KeyNotFoundException("Không tìm thấy lịch chơi.");

        // Check if user is a team member
        if (!await _unitOfWork.TeamMembers.IsMemberAsync(schedule.HostTeamId, userId))
            throw new InvalidOperationException("Bạn phải là thành viên của nhóm để đăng ký tham gia.");

        // Check if already joined
        var existing = await _unitOfWork.ScheduleParticipants.GetParticipantAsync(scheduleId, userId);
        if (existing != null)
            throw new InvalidOperationException("Bạn đã đăng ký tham gia buổi chơi này.");

        // Check capacity
        var currentCount = await _unitOfWork.ScheduleParticipants.CountByScheduleIdAsync(scheduleId);
        if (currentCount >= schedule.MaxParticipants)
            throw new InvalidOperationException("Buổi chơi đã đầy.");

        var participant = new ScheduleParticipant
        {
            ScheduleId = scheduleId,
            UserId = userId,
            IsAttended = false,
            JoinedAt = DateTime.Now
        };

        await _unitOfWork.ScheduleParticipants.CreateAsync(participant);

        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        return new ParticipantResponse
        {
            UserId = userId,
            FullName = user?.FullName,
            IsAttended = false,
            JoinedAt = participant.JoinedAt
        };
    }

    public async Task LeaveScheduleAsync(Guid userId, Guid scheduleId)
    {
        var participant = await _unitOfWork.ScheduleParticipants.GetParticipantAsync(scheduleId, userId);
        if (participant == null)
            throw new KeyNotFoundException("Bạn chưa đăng ký tham gia buổi chơi này.");

        await _unitOfWork.ScheduleParticipants.RemoveAsync(participant);
    }

    public async Task UpdateAttendanceAsync(
        Guid currentUserId, Guid scheduleId, Guid targetUserId, UpdateAttendanceRequest request)
    {
        var schedule = await _unitOfWork.Schedules.GetByIdAsync(scheduleId);
        if (schedule == null)
            throw new KeyNotFoundException("Không tìm thấy lịch chơi.");

        // Only Leader can mark attendance
        if (!await _unitOfWork.TeamMembers.IsLeaderAsync(schedule.HostTeamId, currentUserId))
            throw new UnauthorizedAccessException("Chỉ Leader mới có quyền điểm danh.");

        var participant = await _unitOfWork.ScheduleParticipants.GetParticipantAsync(scheduleId, targetUserId);
        if (participant == null)
            throw new KeyNotFoundException("Người dùng chưa đăng ký tham gia buổi chơi này.");

        participant.IsAttended = request.IsAttended;
        await _unitOfWork.ScheduleParticipants.UpdateAsync(participant);
    }

    #endregion

    #region Helpers

    private static ScheduleResponse MapToResponse(Schedule schedule)
    {
        return new ScheduleResponse
        {
            ScheduleId = schedule.ScheduleId,
            HostTeamId = schedule.HostTeamId,
            HostTeamName = schedule.HostTeam?.TeamName,
            Title = schedule.Title,
            SportId = schedule.SportId,
            SportName = schedule.Sport?.SportName,
            Location = schedule.Location,
            StartTime = schedule.StartTime,
            EndTime = schedule.EndTime,
            MaxParticipants = schedule.MaxParticipants,
            CurrentParticipants = schedule.ScheduleParticipants?.Count ?? 0,
            TotalCost = schedule.TotalCost,
            CostNote = schedule.CostNote,
            CreatedAt = schedule.CreatedAt
        };
    }

    #endregion
}
