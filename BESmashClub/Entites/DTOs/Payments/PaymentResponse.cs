namespace Entites.DTOs.Payments;

public class PaymentResponse
{
    public Guid PaymentId { get; set; }
    public long OrderCode { get; set; }
    public string PaymentType { get; set; }
    public string ReferenceId { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; }
    public int StatusId { get; set; }
    public string StatusName { get; set; }
    public string PaymentProvider { get; set; }
    public string CheckoutUrl { get; set; }
    public string TransactionId { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
}
