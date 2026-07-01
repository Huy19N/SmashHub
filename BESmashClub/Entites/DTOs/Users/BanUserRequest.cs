using System;

namespace Entites.DTOs.Users;

public class BanUserRequest
{
    public DateTime Until { get; set; }
    public string Reason { get; set; }
}
