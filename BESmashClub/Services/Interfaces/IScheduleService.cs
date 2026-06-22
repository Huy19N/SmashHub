using Entites.DTOs.Schedules;

namespace Services.Interfaces;

public interface IScheduleService
{
    // Schedule CRUD
    Task<ScheduleResponse> CreateScheduleAsync(Guid userId, Guid teamId, CreateScheduleRequest request);
    Task<List<ScheduleResponse>> GetSchedulesByTeamAsync(Guid teamId);
    Task<ScheduleResponse> GetScheduleDetailAsync(Guid scheduleId);
    Task<ScheduleResponse> UpdateScheduleAsync(Guid userId, Guid scheduleId, UpdateScheduleRequest request);
    Task DeleteScheduleAsync(Guid userId, Guid scheduleId);

    // Participants
    Task<List<ParticipantResponse>> GetParticipantsAsync(Guid scheduleId);
    Task<ParticipantResponse> JoinScheduleAsync(Guid userId, Guid scheduleId);
    Task LeaveScheduleAsync(Guid userId, Guid scheduleId);
    Task UpdateAttendanceAsync(Guid currentUserId, Guid scheduleId, Guid targetUserId, UpdateAttendanceRequest request);
    Task UpdateSplitBillAsync(Guid currentUserId, Guid scheduleId, Guid targetUserId, Entites.DTOs.ScheduleParticipants.UpdateSplitBillRequest request);
    Task CalculateAndSaveSplitBillAsync(Guid currentUserId, Guid scheduleId, CalculateSplitBillRequest request);
}
