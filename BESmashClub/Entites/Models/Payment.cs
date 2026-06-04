using System;
using System.Collections.Generic;

namespace Entites.Models;

public partial class Payment
{
    public Guid PaymentId { get; set; }

    public long OrderCode { get; set; }

    public string PaymentType { get; set; }

    public string ReferenceId { get; set; }

    public Guid UserId { get; set; }

    public decimal Amount { get; set; }

    public string Description { get; set; }

    public int StatusId { get; set; }

    public string PaymentProvider { get; set; }

    public string CheckoutUrl { get; set; }

    public string TransactionId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? PaidAt { get; set; }

    public virtual User User { get; set; }

    public virtual PaymentStatus Status { get; set; }

    public virtual ICollection<Payout> Payouts { get; set; } = new List<Payout>();
}
