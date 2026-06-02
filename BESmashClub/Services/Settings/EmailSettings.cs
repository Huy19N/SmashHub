namespace Services.Settings;

public class EmailSettings
{
    public string SmtpHost { get; set; } = "smtp.gmail.com";
    public int SmtpPort { get; set; } = 587;
    public string SenderEmail { get; set; } = null!;
    public string SenderName { get; set; } = "SmashClub";
    public string AppPassword { get; set; } = null!;
}
