using System.Collections.Generic;
using Entites.DTOs.Sports;

namespace Entites.DTOs.Users;

public class UserPublicResponse
{
    public Guid UserId { get; set; }
    public string FullName { get; set; }
    public DateTime? CreatedAt { get; set; }
    public Guid? AvatarFileId { get; set; }
    public List<UserSportProfileResponse> SportProfiles { get; set; } = new();
}
