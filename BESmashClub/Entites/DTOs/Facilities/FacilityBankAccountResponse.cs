namespace Entites.DTOs.Facilities;

public class FacilityBankAccountResponse
{
    public int BankAccountId { get; set; }
    public int FacilityId { get; set; }
    public string FacilityName { get; set; }
    public string BankName { get; set; }
    public string AccountNumber { get; set; }
    public string AccountHolder { get; set; }
    public bool? IsPrimary { get; set; }
    public bool IsActive { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
