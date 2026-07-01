using System;

namespace Entites.Redis
{
    public class RefreshToken
    {
        public string Token { get; set; } = null!;
        public Guid UserId { get; set; }
        public string JwtId { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiredAt { get; set; }
        public bool IsActive { get; set; }
        public string? Ipaddress { get; set; }
        public string? UserAgent { get; set; }
    }
}
