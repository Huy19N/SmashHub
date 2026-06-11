namespace Entites.DTOs.Facilities;

public class SportPriceDetailResponse
{
    public int SportId { get; set; }
    public string SportName { get; set; }
    public List<PriceDetail> PriceDetails { get; set; } = new();

    public class PriceDetail
    {
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public decimal Cost { get; set; }
        public int DurationMinutes { get; set; }
    }
}
