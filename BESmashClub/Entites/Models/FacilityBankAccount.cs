using System;

namespace Entites.Models;

public partial class FacilityBankAccount
{
    public int FacilityId { get; set; }

    public string BankName { get; set; }

    public string AccountNumber { get; set; }

    public string AccountHolder { get; set; }

    public bool IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Facility Facility { get; set; }
}
