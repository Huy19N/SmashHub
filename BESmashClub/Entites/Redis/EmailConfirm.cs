using System;

namespace Entites.Redis
{
    public class EmailConfirm
    {
        public string Email { get; set; }
        public string ConfirmationCode { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsVerified { get; set; }
    }
}
