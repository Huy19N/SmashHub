using System;
using System.Collections.Generic;

namespace Entites.DTOs.Schedules;

public class CalculateSplitBillRequest
{
    public decimal ExtraFee { get; set; }
    public string? ExtraFeeNote { get; set; }
    public decimal? FixedAmountPerPerson { get; set; }
    public Dictionary<Guid, decimal>? CustomAmounts { get; set; }
}
