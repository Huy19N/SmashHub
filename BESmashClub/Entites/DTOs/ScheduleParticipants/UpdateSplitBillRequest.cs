using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.ScheduleParticipants;

public class UpdateSplitBillRequest
{
    [Required]
    public decimal CostToPay { get; set; }

    [Required]
    public bool IsPaid { get; set; }
}
