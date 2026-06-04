namespace Services.Settings;

public class PayOSSettings
{
    public string ClientId { get; set; }
    public string ApiKey { get; set; }
    public string ChecksumKey { get; set; }
    public string ReturnUrl { get; set; }
    public string CancelUrl { get; set; }
    public string WebhookUrl { get; set; }

    /// <summary>
    /// Thời gian hết hạn payment cho booking (phút). Default: 15 phút.
    /// </summary>
    public int BookingPaymentExpirationMinutes { get; set; } = 15;
}
