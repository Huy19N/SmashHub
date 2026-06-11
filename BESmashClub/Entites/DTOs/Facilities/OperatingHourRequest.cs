using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Facilities;

public class OperatingHourRequest
{
    [Range(2, 8, ErrorMessage = "Ngày trong tuần phải từ 2 (Thứ Hai) đến 8 (Chủ Nhật).")]
    public int DayOfWeek { get; set; }

    [Required]
    [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Giờ mở cửa phải có định dạng HH:mm.")]
    public string OpenTime { get; set; }

    [Required]
    [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Giờ đóng cửa phải có định dạng HH:mm.")]
    public string CloseTime { get; set; }
}
