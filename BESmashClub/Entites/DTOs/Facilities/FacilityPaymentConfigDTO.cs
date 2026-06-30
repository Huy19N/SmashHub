using System;

namespace Entites.DTOs.Facilities;

public class FacilityPaymentConfigRequest
{
    public int PaymentModel { get; set; } // 1: Thu hộ (Escrow), 3: BYOG (Trực tiếp qua PayOS cá nhân)
    public string? ClientId { get; set; }
    public string? ApiKey { get; set; }
    public string? ChecksumKey { get; set; }
}

public class FacilityPaymentConfigResponse
{
    public Guid ConfigId { get; set; }
    public int FacilityId { get; set; }
    public int PaymentModel { get; set; }
    public string? ClientId { get; set; }
    public string? ApiKey { get; set; }
    public string? ChecksumKey { get; set; }
    public bool IsActive { get; set; }
}
