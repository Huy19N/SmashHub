using System;

namespace Entites.Models;

public partial class UserBlock
{
    public Guid BlockerId { get; set; }

    public Guid BlockedId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User Blocker { get; set; }

    public virtual User Blocked { get; set; }
}
