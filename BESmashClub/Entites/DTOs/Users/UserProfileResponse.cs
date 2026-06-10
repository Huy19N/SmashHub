namespace Entites.DTOs.Users;

public class UserProfileResponse
{
    public Guid UserId { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string RoleName { get; set; }
    public DateTime? CreatedAt { get; set; }
    public bool? IsActive { get; set; }
    public Guid? AvatarFileId { get; set; }
}
