using System;

namespace Entites.Models;

public partial class PostReport
{
    public Guid ReportId { get; set; }

    public Guid PostId { get; set; }

    public Guid ReporterId { get; set; }

    public string Reason { get; set; }

    public int Status { get; set; } = 1;

    public DateTime? CreatedAt { get; set; }

    public virtual Post Post { get; set; }

    public virtual User Reporter { get; set; }
}
