using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Facilities;

public class FacilityBankAccountRequest
{
    [Required]
    public string BankName { get; set; }

    [Required]
    public string AccountNumber { get; set; }

    [Required]
    public string AccountHolder { get; set; }
}
