namespace Entites.DTOs.Payments;

public class PayoutResponse
{
    public Guid PayoutId { get; set; }
    public Guid PaymentId { get; set; }
    public int FacilityId { get; set; }
    public string FacilityName { get; set; }
    public Guid OwnerUserId { get; set; }
    public string OwnerName { get; set; }
    public decimal Amount { get; set; }
    public int StatusId { get; set; }
    public string StatusName { get; set; }
    public string BankAccountNo { get; set; }
    public string BankName { get; set; }
    public string AccountHolder { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string Note { get; set; }
}
