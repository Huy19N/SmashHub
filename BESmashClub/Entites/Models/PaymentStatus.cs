using System;
using System.Collections.Generic;

namespace Entites.Models;

public partial class PaymentStatus
{
    public int StatusId { get; set; }

    public string StatusName { get; set; }

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
