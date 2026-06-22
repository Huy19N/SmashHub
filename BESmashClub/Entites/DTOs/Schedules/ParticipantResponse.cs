namespace Entites.DTOs.Schedules;

public class ParticipantResponse
{
    public Guid UserId { get; set; }
    public string FullName { get; set; }
    public bool IsAttended { get; set; }
    public DateTime? JoinedAt { get; set; }
    public decimal CostToPay { get; set; }
    public bool IsPaid { get; set; }
}
