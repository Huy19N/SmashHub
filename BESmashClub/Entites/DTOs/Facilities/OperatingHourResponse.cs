namespace Entites.DTOs.Facilities;

public class OperatingHourResponse
{
    public int OperatingHourId { get; set; }
    public int FacilityId { get; set; }
    public int DayOfWeek { get; set; }
    public string OpenTime { get; set; }
    public string CloseTime { get; set; }
}
