using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entites.DTOs
{
    public class EmailConfirmationRequest
    {
        [Required]
        public string Code { get; set; } = null!;
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

    }
}
