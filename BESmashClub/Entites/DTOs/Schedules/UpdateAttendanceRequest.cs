using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Schedules;

public class UpdateAttendanceRequest
{
    [Required]
    public bool IsAttended { get; set; }
}
