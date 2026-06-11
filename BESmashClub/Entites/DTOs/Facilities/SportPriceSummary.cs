namespace Entites.DTOs.Facilities;

public class SportPriceSummary
{
    public int SportId { get; set; }
    public string SportName { get; set; }
    public decimal MinPrice { get; set; }
    public decimal MaxPrice { get; set; }
}
