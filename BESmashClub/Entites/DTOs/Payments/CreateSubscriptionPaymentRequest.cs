using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Payments;

public class CreateSubscriptionPaymentRequest
{
    [Required]
    public int PlanId { get; set; }
}
