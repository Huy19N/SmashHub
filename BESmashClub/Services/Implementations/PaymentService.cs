using Entites.DTOs.Common;
using Entites.DTOs.Payments;
using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using PayOS;
using PayOS.Models.V2.PaymentRequests;
using PayOS.Models.Webhooks;
using Repositories;
using Services.Interfaces;
using Services.Settings;

namespace Services.Implementations;

public class PaymentService : IPaymentService
{
    private readonly UnitOfWork _unitOfWork;
    private readonly PayOSSettings _payOSSettings;
    private readonly PayOSClient _payOSClient;
    private readonly IEmailService _emailService;

    public PaymentService(UnitOfWork unitOfWork, IOptions<PayOSSettings> payOSSettings, IEmailService emailService)
    {
        _unitOfWork = unitOfWork;
        _payOSSettings = payOSSettings.Value;
        _emailService = emailService;

        // Initialize PayOS client with platform credentials
        _payOSClient = new PayOSClient(new PayOSOptions
        {
            ClientId = _payOSSettings.ClientId,
            ApiKey = _payOSSettings.ApiKey,
            ChecksumKey = _payOSSettings.ChecksumKey
        });
    }

    #region Feature 1: Subscription Payment

    public async Task<PaymentResponse> CreateSubscriptionPaymentAsync(Guid userId, CreateSubscriptionPaymentRequest request)
    {
        // 1. Validate plan exists and is active
        var plan = await _unitOfWork.SubscriptionPlans.GetDetailAsync(request.PlanId);
        if (plan == null || !plan.IsActive)
            throw new KeyNotFoundException("Gói đăng ký không tồn tại hoặc đã ngừng hoạt động.");

        if (plan.Price <= 0)
            throw new InvalidOperationException("Gói miễn phí không cần thanh toán.");

        // 2. Check if user already has an active subscription for this tier
        var activeSub = await _unitOfWork.UserSubscriptions.GetActiveSubscriptionAsync(userId);
        if (activeSub != null && activeSub.Plan.TierId == plan.TierId)
            throw new InvalidOperationException($"Bạn đã có gói {activeSub.Plan.Tier.TierName} đang hoạt động.");

        // 3. Check if there's already a pending payment for this plan
        var existingPayment = await _unitOfWork.Payments.GetByReferenceIdAsync(
            $"SUB_{userId}_{request.PlanId}", "Subscription");
        if (existingPayment != null && existingPayment.StatusId == 1) // Pending
            throw new InvalidOperationException("Bạn đã có giao dịch đang chờ thanh toán cho gói này.");

        // 4. Generate unique order code (timestamp-based to ensure uniqueness)
        var orderCode = GenerateOrderCode();

        // 5. Create Payment record
        var payment = new Payment
        {
            PaymentId = Guid.NewGuid(),
            OrderCode = orderCode,
            PaymentType = "Subscription",
            ReferenceId = $"SUB_{userId}_{request.PlanId}",
            UserId = userId,
            Amount = plan.Price,
            Description = $"Đăng ký gói {plan.Tier.TierName} - {plan.DurationMonths} tháng",
            StatusId = 1, // Pending
            PaymentMethod = "Gateway",
            CreatedAt = DateTime.Now
        };

        // 6. Create PayOS payment link
        var payosRequest = new CreatePaymentLinkRequest
        {
            OrderCode = orderCode,
            Amount = (int)plan.Price,
            Description = TruncateDescription($"SmashClub {plan.Tier.TierName} {plan.DurationMonths}T"),
            ReturnUrl = $"{_payOSSettings.ReturnUrl}?type=subscription&orderId={payment.PaymentId}",
            CancelUrl = $"{_payOSSettings.CancelUrl}?type=subscription&orderId={payment.PaymentId}"
        };

        var paymentLink = await _payOSClient.PaymentRequests.CreateAsync(payosRequest);

        payment.Note = paymentLink.CheckoutUrl;

        await _unitOfWork.Payments.CreateAsync(payment);

        return MapToResponse(payment);
    }

    #endregion

    #region Feature 2: Booking Payment

    public async Task<PaymentResponse> CreateBookingPaymentAsync(Guid userId, Guid bookingId)
    {
        // 1. Load booking with court and facility info
        var booking = await _unitOfWork.Booking.GetDetailAsync(bookingId);
        if (booking == null)
            throw new KeyNotFoundException("Không tìm thấy booking.");

        if (booking.BookedByUserId != userId)
            throw new UnauthorizedAccessException("Bạn không có quyền thanh toán booking này.");

        if (booking.StatusId != 1) // Only Pending bookings
            throw new InvalidOperationException("Booking không ở trạng thái chờ thanh toán.");

        if (booking.TotalCost == null || booking.TotalCost <= 0)
            throw new InvalidOperationException("Chi phí booking không hợp lệ.");

        // 2. Check for existing pending payment
        var existingPayment = await _unitOfWork.Payments.GetByReferenceIdAsync(
            bookingId.ToString(), "Booking");
        if (existingPayment != null && existingPayment.StatusId == 1)
            throw new InvalidOperationException("Booking này đã có giao dịch đang chờ thanh toán.");

        // 3. Generate order code
        var orderCode = GenerateOrderCode();

        // 4. Create Payment record
        var payment = new Payment
        {
            PaymentId = Guid.NewGuid(),
            OrderCode = orderCode,
            PaymentType = "Booking",
            ReferenceId = bookingId.ToString(),
            UserId = userId,
            Amount = booking.TotalCost.Value,
            Description = $"Đặt sân {booking.Court?.CourtName} - {booking.Court?.Facility?.Name}",
            StatusId = 1, // Pending
            PaymentMethod = "Gateway",
            CreatedAt = DateTime.Now
        };

        // 5. Create PayOS payment link
        var payosRequest = new CreatePaymentLinkRequest
        {
            OrderCode = orderCode,
            Amount = (int)booking.TotalCost.Value,
            Description = TruncateDescription($"SmashClub San {booking.Court?.CourtName}"),
            ReturnUrl = $"{_payOSSettings.ReturnUrl}?type=booking&orderId={payment.PaymentId}",
            CancelUrl = $"{_payOSSettings.CancelUrl}?type=booking&orderId={payment.PaymentId}"
        };

        var paymentLink = await _payOSClient.PaymentRequests.CreateAsync(payosRequest);

        payment.Note = paymentLink.CheckoutUrl;

        await _unitOfWork.Payments.CreateAsync(payment);

        return MapToResponse(payment);
    }

    public async Task<PaymentResponse> CreateSplitBookingPaymentAsync(Guid userId, Guid acceptanceId)
    {
        var context = _unitOfWork.Payments.GetContext();
        var acceptance = await context.Set<MatchAcceptance>()
            .Include(ma => ma.ChallengerTeam)
            .Include(ma => ma.Challenge).ThenInclude(c => c.Schedule).ThenInclude(s => s.Booking).ThenInclude(b => b.Court).ThenInclude(c => c.Facility)
            .FirstOrDefaultAsync(ma => ma.AcceptanceId == acceptanceId);

        if (acceptance == null)
            throw new KeyNotFoundException("Không tìm thấy yêu cầu gia nhập trận ghép đấu.");

        var challenge = acceptance.Challenge;
        var booking = challenge?.Schedule?.Booking;
        if (booking == null)
            throw new InvalidOperationException("Không tìm thấy thông tin đặt sân liên kết với trận ghép này.");

        // Chia đôi chi phí đặt sân
        var splitAmount = (booking.TotalCost ?? 0) / 2;
        if (splitAmount <= 0)
            throw new InvalidOperationException("Số tiền chia đôi không hợp lệ.");

        // Kiểm tra xem đã có giao dịch đang chờ nào chưa
        var existingPayment = await _unitOfWork.Payments.GetByReferenceIdAsync(
            acceptanceId.ToString(), "Booking");
        if (existingPayment != null && existingPayment.StatusId == 1)
            throw new InvalidOperationException("Bạn đã có giao dịch đang chờ thanh toán cho lượt ghép đấu này.");

        var orderCode = GenerateOrderCode();

        var payment = new Payment
        {
            PaymentId = Guid.NewGuid(),
            OrderCode = orderCode,
            PaymentType = "Booking",
            ReferenceId = acceptanceId.ToString(),
            UserId = userId,
            Amount = splitAmount,
            Description = $"Ghép đấu 50% tiền sân {booking.Court?.CourtName}",
            StatusId = 1, // Pending
            PaymentMethod = "Gateway",
            CreatedAt = DateTime.Now
        };

        var payosRequest = new CreatePaymentLinkRequest
        {
            OrderCode = orderCode,
            Amount = (int)splitAmount,
            Description = TruncateDescription($"SmashGhep {booking.Court?.CourtName}"),
            ReturnUrl = $"{_payOSSettings.ReturnUrl}?type=booking&orderId={payment.PaymentId}",
            CancelUrl = $"{_payOSSettings.CancelUrl}?type=booking&orderId={payment.PaymentId}"
        };

        var paymentLink = await _payOSClient.PaymentRequests.CreateAsync(payosRequest);

        payment.Note = paymentLink.CheckoutUrl;

        await _unitOfWork.Payments.CreateAsync(payment);

        return MapToResponse(payment);
    }

    #endregion

    #region Webhook Handlers

    public async Task HandleSubscriptionWebhookAsync(string webhookBody)
    {
        // 1. Parse and verify webhook
        var webhook = System.Text.Json.JsonSerializer.Deserialize<Webhook>(webhookBody);
        if (webhook == null)
            throw new InvalidOperationException("Invalid webhook data.");

        // 2. Find payment by order code
        var payment = await _unitOfWork.Payments.GetByOrderCodeAsync(webhook.Data.OrderCode);
        if (payment == null || payment.PaymentType != "Subscription")
            return; // Silently ignore unknown webhooks

        if (payment.StatusId != 1) // Already processed
            return;

        // 3. Check if payment was successful
        if (webhook.Success)
        {
            // Update payment status
            payment.StatusId = 2; // Paid
            payment.PaidAt = DateTime.Now;
            payment.GatewayTransactionId = webhook.Data.PaymentLinkId;
            await _unitOfWork.Payments.UpdateAsync(payment);

            // 4. Parse reference to get plan info: SUB_{userId}_{planId}
            var parts = payment.ReferenceId.Split('_');
            if (parts.Length >= 3)
            {
                var userId = Guid.Parse(parts[1]);
                var planId = int.Parse(parts[2]);

                var plan = await _unitOfWork.SubscriptionPlans.GetDetailAsync(planId);
                if (plan != null)
                {
                    // Deactivate old subscriptions
                    await _unitOfWork.UserSubscriptions.DeactivateAllAsync(userId);

                    // Create new subscription
                    var subscription = new UserSubscription
                    {
                        UserSubscriptionId = Guid.NewGuid(),
                        UserId = userId,
                        PlanId = planId,
                        StartDate = DateTime.Now,
                        EndDate = DateTime.Now.AddMonths(plan.DurationMonths),
                        IsTrial = false,
                        IsActive = true,
                        CreatedAt = DateTime.Now
                    };

                    await _unitOfWork.UserSubscriptions.CreateAsync(subscription);
                }
            }
        }
        else
        {
            // Payment cancelled
            payment.StatusId = 3; // Cancelled
            await _unitOfWork.Payments.UpdateAsync(payment);
        }
    }

    public async Task HandleBookingWebhookAsync(string webhookBody)
    {
        // 1. Parse webhook
        var webhook = System.Text.Json.JsonSerializer.Deserialize<Webhook>(webhookBody);
        if (webhook == null)
            throw new InvalidOperationException("Invalid webhook data.");

        // 2. Find payment by order code
        var payment = await _unitOfWork.Payments.GetByOrderCodeAsync(webhook.Data.OrderCode);
        if (payment == null || payment.PaymentType != "Booking")
            return;

        if (payment.StatusId != 1)
            return;

        var refId = Guid.Parse(payment.ReferenceId);

        if (webhook.Success)
        {
            // 3. Update payment status
            payment.StatusId = 2; // Paid
            payment.PaidAt = DateTime.Now;
            payment.GatewayTransactionId = webhook.Data.PaymentLinkId;
            await _unitOfWork.Payments.UpdateAsync(payment);

            // 4. Kiểm tra xem ReferenceId là Booking hay MatchAcceptance
            var booking = await _unitOfWork.Booking.GetDetailAsync(refId);
            if (booking != null)
            {
                if (booking.StatusId == 1)
                {
                    booking.StatusId = 2; // Confirmed
                    await _unitOfWork.Booking.UpdateAsync(booking);

                    // 5. Tạo payout record cho facility owner
                    var facility = booking.Court?.Facility;
                    if (facility != null)
                    {
                        var bankAccount = await _unitOfWork.FacilityBankAccounts
                            .GetByFacilityIdAsync(facility.FacilityId);

                        var payout = new Payout
                        {
                            PayoutId = Guid.NewGuid(),
                            PaymentId = payment.PaymentId,
                            FacilityId = facility.FacilityId,
                            OwnerUserId = facility.OwnerId,
                            Amount = payment.Amount,
                            StatusId = 1, // Pending
                            BankAccountNo = bankAccount?.AccountNumber,
                            BankName = bankAccount?.BankName,
                            AccountHolder = bankAccount?.AccountHolder,
                            CreatedAt = DateTime.Now
                        };

                        await _unitOfWork.Payouts.CreateAsync(payout);

                        // 5.1 Cập nhật ví cơ sở
                        var context = _unitOfWork.Users.GetContext();
                        var wallet = await context.Set<FacilityWallet>()
                            .FirstOrDefaultAsync(w => w.FacilityId == facility.FacilityId);
                        if (wallet == null)
                        {
                            wallet = new FacilityWallet
                            {
                                FacilityId = facility.FacilityId,
                                Balance = payment.Amount,
                                TotalEarned = payment.Amount,
                                LastUpdatedAt = DateTime.Now
                            };
                            await context.Set<FacilityWallet>().AddAsync(wallet);
                        }
                        else
                        {
                            wallet.Balance += payment.Amount;
                            wallet.TotalEarned += payment.Amount;
                            wallet.LastUpdatedAt = DateTime.Now;
                            context.Entry(wallet).State = EntityState.Modified;
                        }
                        await context.SaveChangesAsync();

                        // Gửi email thông báo cho chủ sân
                        try
                        {
                            await _emailService.SendBookingNotificationToOwnerAsync(booking);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Gửi email thông báo lịch đặt cho chủ sân thất bại: {ex.Message}");
                        }
                    }
                }
            }
            else
            {
                // Đây là trường hợp thanh toán tiền ghép đấu (MatchAcceptance)
                var context = _unitOfWork.Payments.GetContext();
                var acceptance = await context.Set<MatchAcceptance>()
                    .Include(ma => ma.Challenge).ThenInclude(c => c.Schedule).ThenInclude(s => s.Booking)
                    .FirstOrDefaultAsync(ma => ma.AcceptanceId == refId);

                if (acceptance != null)
                {
                    // Đánh dấu đã thanh toán thành công
                    Console.WriteLine($"Matchmaking paid! Refund 50% ({payment.Amount}) to host user: {acceptance.Challenge.Schedule.Booking.BookedByUserId}");
                    // Chấp nhận đã duyệt hoàn thành
                    acceptance.StatusId = 2; // Accepted / Paid
                    context.Entry(acceptance).State = EntityState.Modified;
                    await context.SaveChangesAsync();
                }
            }
        }
        else
        {
            // Payment cancelled
            payment.StatusId = 3; // Cancelled
            await _unitOfWork.Payments.UpdateAsync(payment);

            var booking = await _unitOfWork.Booking.GetByIdAsync(refId);
            if (booking != null)
            {
                if (booking.StatusId == 1)
                {
                    booking.StatusId = 3; // Cancelled
                    await _unitOfWork.Booking.UpdateAsync(booking);
                }
            }
            else
            {
                // Trường hợp hủy thanh toán ghép đấu
                var context = _unitOfWork.Payments.GetContext();
                var acceptance = await context.Set<MatchAcceptance>().FirstOrDefaultAsync(ma => ma.AcceptanceId == refId);
                if (acceptance != null)
                {
                    acceptance.StatusId = 3; // Rejected/Cancelled
                    context.Entry(acceptance).State = EntityState.Modified;
                    await context.SaveChangesAsync();

                    var challenge = await _unitOfWork.MatchChallenges.GetByIdAsync(acceptance.ChallengeId);
                    if (challenge != null)
                    {
                        challenge.StatusId = 1; // Mở lại tin ghép đấu để người khác đăng ký
                        await _unitOfWork.MatchChallenges.UpdateAsync(challenge);
                    }
                }
            }
        }
    }

    #endregion

    #region Query

    public async Task<PaymentResponse> GetPaymentByIdAsync(Guid paymentId)
    {
        var payment = await _unitOfWork.Payments.GetDetailAsync(paymentId);
        if (payment == null)
            throw new KeyNotFoundException("Không tìm thấy giao dịch.");

        return MapToResponse(payment);
    }

    public async Task<PagedResult<PaymentResponse>> GetPaymentsByUserAsync(Guid userId, PaginationParams pagination)
    {
        var (items, totalCount) = await _unitOfWork.Payments
            .GetByUserIdAsync(userId, pagination.PageNumber, pagination.PageSize);

        return new PagedResult<PaymentResponse>
        {
            Items = items.Select(MapToResponse).ToList(),
            TotalCount = totalCount,
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }

    #endregion

    #region Helpers

    private static long GenerateOrderCode()
    {
        // Use timestamp + random to ensure uniqueness
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var random = new Random().Next(100, 999);
        return long.Parse($"{timestamp % 10000000000}{random}");
    }

    /// <summary>
    /// PayOS description has a max length of 25 characters
    /// </summary>
    private static string TruncateDescription(string description)
    {
        return description.Length > 25 ? description[..25] : description;
    }

    private static PaymentResponse MapToResponse(Payment p)
    {
        return new PaymentResponse
        {
            PaymentId = p.PaymentId,
            OrderCode = p.OrderCode,
            PaymentType = p.PaymentType,
            ReferenceId = p.ReferenceId,
            UserId = p.UserId,
            UserName = p.User?.FullName,
            Amount = p.Amount,
            Description = p.Description,
            StatusId = p.StatusId,
            StatusName = p.Status?.StatusName,
            PaymentProvider = p.PaymentMethod,
            CheckoutUrl = p.Note,
            TransactionId = p.GatewayTransactionId,
            CreatedAt = p.CreatedAt,
            PaidAt = p.PaidAt
        };
    }

    #endregion
}
