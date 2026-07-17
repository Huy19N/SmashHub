using System;
using System.Collections.Generic;
using System.Linq;
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
using StackExchange.Redis;

namespace Services.Implementations;

public class PaymentService : IPaymentService
{
    private readonly UnitOfWork _unitOfWork;
    private readonly PayOSSettings _payOSSettings;
    private readonly PayOSClient _payOSClient;
    private readonly IEmailService _emailService;
    private readonly IConnectionMultiplexer _redis;

    public PaymentService(UnitOfWork unitOfWork, IOptions<PayOSSettings> payOSSettings, IEmailService emailService, IConnectionMultiplexer redis)
    {
        _unitOfWork = unitOfWork;
        _payOSSettings = payOSSettings.Value;
        _emailService = emailService;
        _redis = redis;

        // Initialize PayOS client with platform credentials
        _payOSClient = new PayOSClient(new PayOSOptions
        {
            ClientId = _payOSSettings.ClientId ?? "",
            ApiKey = _payOSSettings.ApiKey ?? "",
            ChecksumKey = _payOSSettings.ChecksumKey ?? ""
        });
    }

    private bool IsPayOSConfigured()
    {
        return !string.IsNullOrWhiteSpace(_payOSSettings.ClientId) &&
               _payOSSettings.ClientId != "YOUR_PAYOS_CLIENT_ID" &&
               !string.IsNullOrWhiteSpace(_payOSSettings.ApiKey) &&
               _payOSSettings.ApiKey != "YOUR_PAYOS_API_KEY" &&
               !string.IsNullOrWhiteSpace(_payOSSettings.ChecksumKey) &&
               _payOSSettings.ChecksumKey != "YOUR_PAYOS_CHECKSUM_KEY";
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

        var db = _redis.GetDatabase();
        var lockKey = $"lock:payment:sub:{userId}:{request.PlanId}";
        var lockValue = Guid.NewGuid().ToString();
        var lockAcquired = await db.LockTakeAsync(lockKey, lockValue, TimeSpan.FromSeconds(10));

        if (!lockAcquired)
            throw new InvalidOperationException("Giao dịch đang được xử lý, vui lòng thử lại sau!");

        try
        {
            // 3. Check if there's already a pending payment for this plan
            var existingPayment = await _unitOfWork.Payments.GetByReferenceIdAsync(
                $"SUB_{userId}_{request.PlanId}", "Subscription");
        if (existingPayment != null && existingPayment.StatusId == 1) // Pending
        {
            existingPayment.StatusId = 3; // Cancelled
            await _unitOfWork.Payments.UpdateAsync(existingPayment);
        }

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

        if (!IsPayOSConfigured())
        {
            payment.Note = $"https://pay.payos.vn/mock-payment/{payment.PaymentId}";
        }
        else
        {
            var paymentLink = await _payOSClient.PaymentRequests.CreateAsync(payosRequest);
            payment.Note = paymentLink.CheckoutUrl;
        }

        await _unitOfWork.Payments.CreateAsync(payment);

        return MapToResponse(payment);
        }
        finally
        {
            await db.LockReleaseAsync(lockKey, lockValue);
        }
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

        if (booking.TotalCost == null || booking.TotalCost < 2000)
            throw new InvalidOperationException("Chi phí booking phải từ 2,000 VNĐ trở lên để thanh toán qua cổng PayOS.");

        // 2. Lock to prevent duplicate payment creations for the same booking
        var db = _redis.GetDatabase();
        var lockKey = $"lock:payment:booking:{bookingId}";
        var lockValue = Guid.NewGuid().ToString();
        var lockAcquired = await db.LockTakeAsync(lockKey, lockValue, TimeSpan.FromSeconds(10));

        if (!lockAcquired)
            throw new InvalidOperationException("Giao dịch đang được xử lý, vui lòng thử lại sau!");

        try
        {
            // 3. Check for existing pending payment
            var existingPayment = await _unitOfWork.Payments.GetByReferenceIdAsync(
                bookingId.ToString(), "Booking");
        if (existingPayment != null && existingPayment.StatusId == 1)
        {
            existingPayment.StatusId = 3; // Cancelled
            await _unitOfWork.Payments.UpdateAsync(existingPayment);
        }

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
            Description = $"BK {bookingId.ToString().Substring(0, 8).ToUpper()}",
            ReturnUrl = $"{_payOSSettings.ReturnUrl}?type=booking&orderId={payment.PaymentId}",
            CancelUrl = $"{_payOSSettings.CancelUrl}?type=booking&orderId={payment.PaymentId}"
        };

        var activePayOSClient = _payOSClient;
        var isConfigured = IsPayOSConfigured();

        if (booking.Court?.FacilityId != null)
        {
            var context = _unitOfWork.Payments.GetContext();
            var facilityConfig = await context.Set<FacilityPaymentConfig>()
                .FirstOrDefaultAsync(c => c.FacilityId == booking.Court.FacilityId && c.IsActive && c.PaymentModel == 3);

            if (facilityConfig != null && !string.IsNullOrEmpty(facilityConfig.ApiKey))
            {
                try
                {
                    var keys = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(facilityConfig.ApiKey);
                    if (keys != null)
                    {
                        var clientId = keys.GetValueOrDefault("ClientId");
                        var apiKey = keys.GetValueOrDefault("ApiKey");
                        var checksumKey = keys.GetValueOrDefault("ChecksumKey");

                        if (!string.IsNullOrEmpty(clientId) && !string.IsNullOrEmpty(apiKey) && !string.IsNullOrEmpty(checksumKey))
                        {
                            activePayOSClient = new PayOSClient(new PayOSOptions
                            {
                                ClientId = clientId,
                                ApiKey = apiKey,
                                ChecksumKey = checksumKey
                            });
                            payment.FacilityConfigId = facilityConfig.ConfigId;
                            isConfigured = true;
                        }
                    }
                }
                catch { /* Ignore */ }
            }
        }

        if (!isConfigured)
        {
            payment.Note = $"https://pay.payos.vn/mock-payment/{payment.PaymentId}";
        }
        else
        {
            var paymentLink = await activePayOSClient.PaymentRequests.CreateAsync(payosRequest);
            payment.Note = paymentLink.CheckoutUrl;
        }

        await _unitOfWork.Payments.CreateAsync(payment);

        return MapToResponse(payment);
        }
        finally
        {
            await db.LockReleaseAsync(lockKey, lockValue);
        }
    }

    public async Task<PaymentResponse> CreateBatchBookingPaymentAsync(Guid userId, List<Guid> bookingIds, decimal totalAmount, string description)
    {
        if (bookingIds == null || bookingIds.Count == 0)
            throw new ArgumentException("Danh sách mã đặt sân không được trống.");

        if (totalAmount < 2000)
            throw new InvalidOperationException("Chi phí booking phải từ 2,000 VNĐ trở lên để thanh toán qua cổng PayOS.");

        var refId = string.Join(",", bookingIds);

        var db = _redis.GetDatabase();
        var lockKey = $"lock:payment:batch:{refId}";
        var lockValue = Guid.NewGuid().ToString();
        var lockAcquired = await db.LockTakeAsync(lockKey, lockValue, TimeSpan.FromSeconds(10));

        if (!lockAcquired)
            throw new InvalidOperationException("Giao dịch đang được xử lý, vui lòng thử lại sau!");

        try
        {
            var existingPayment = await _unitOfWork.Payments.GetByReferenceIdAsync(refId, "Booking");
            if (existingPayment != null && existingPayment.StatusId == 1)
            {
                existingPayment.StatusId = 3;
                await _unitOfWork.Payments.UpdateAsync(existingPayment);
            }

            var orderCode = GenerateOrderCode();

        var payment = new Payment
        {
            PaymentId = Guid.NewGuid(),
            OrderCode = orderCode,
            PaymentType = "Booking",
            ReferenceId = refId,
            UserId = userId,
            Amount = totalAmount,
            Description = description,
            StatusId = 1, // Pending
            PaymentMethod = "Gateway",
            CreatedAt = DateTime.Now
        };

        var payosRequest = new CreatePaymentLinkRequest
        {
            OrderCode = orderCode,
            Amount = (int)totalAmount,
            Description = TruncateDescription(description),
            ReturnUrl = $"{_payOSSettings.ReturnUrl}?type=booking&orderId={payment.PaymentId}",
            CancelUrl = $"{_payOSSettings.CancelUrl}?type=booking&orderId={payment.PaymentId}"
        };

        var activePayOSClient = _payOSClient;
        var isConfigured = IsPayOSConfigured();

        var firstBookingId = bookingIds.First();
        var firstBooking = await _unitOfWork.Booking.GetDetailAsync(firstBookingId);
        var facilityId = firstBooking?.Court?.FacilityId;

        if (facilityId != null)
        {
            var context = _unitOfWork.Payments.GetContext();
            var facilityConfig = await context.Set<FacilityPaymentConfig>()
                .FirstOrDefaultAsync(c => c.FacilityId == facilityId && c.IsActive && c.PaymentModel == 3);

            if (facilityConfig != null && !string.IsNullOrEmpty(facilityConfig.ApiKey))
            {
                try
                {
                    var keys = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(facilityConfig.ApiKey);
                    if (keys != null)
                    {
                        var clientId = keys.GetValueOrDefault("ClientId");
                        var apiKey = keys.GetValueOrDefault("ApiKey");
                        var checksumKey = keys.GetValueOrDefault("ChecksumKey");

                        if (!string.IsNullOrEmpty(clientId) && !string.IsNullOrEmpty(apiKey) && !string.IsNullOrEmpty(checksumKey))
                        {
                            activePayOSClient = new PayOSClient(new PayOSOptions
                            {
                                ClientId = clientId,
                                ApiKey = apiKey,
                                ChecksumKey = checksumKey
                            });
                            payment.FacilityConfigId = facilityConfig.ConfigId;
                            isConfigured = true;
                        }
                    }
                }
                catch { /* Ignore */ }
            }
        }

        if (!isConfigured)
        {
            payment.Note = $"https://pay.payos.vn/mock-payment/{payment.PaymentId}";
        }
        else
        {
            var paymentLink = await activePayOSClient.PaymentRequests.CreateAsync(payosRequest);
            payment.Note = paymentLink.CheckoutUrl;
        }

        await _unitOfWork.Payments.CreateAsync(payment);
        return MapToResponse(payment);
        }
        finally
        {
            await db.LockReleaseAsync(lockKey, lockValue);
        }
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
        if (splitAmount < 2000)
            throw new InvalidOperationException("Số tiền chia đôi phải từ 2,000 VNĐ trở lên để thanh toán qua cổng PayOS.");

        var db = _redis.GetDatabase();
        var lockKey = $"lock:payment:split:{acceptanceId}";
        var lockValue = Guid.NewGuid().ToString();
        var lockAcquired = await db.LockTakeAsync(lockKey, lockValue, TimeSpan.FromSeconds(10));

        if (!lockAcquired)
            throw new InvalidOperationException("Giao dịch đang được xử lý, vui lòng thử lại sau!");

        try
        {
            // Kiểm tra xem đã có giao dịch đang chờ nào chưa
            var existingPayment = await _unitOfWork.Payments.GetByReferenceIdAsync(
                acceptanceId.ToString(), "Booking");
        if (existingPayment != null && existingPayment.StatusId == 1)
        {
            existingPayment.StatusId = 3; // Cancelled
            await _unitOfWork.Payments.UpdateAsync(existingPayment);
        }

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

        // 5. Create PayOS payment link
        var payosRequest = new CreatePaymentLinkRequest
        {
            OrderCode = orderCode,
            Amount = (int)splitAmount,
            Description = TruncateDescription($"SmashGhep {booking.Court?.CourtName}"),
            ReturnUrl = $"{_payOSSettings.ReturnUrl}?type=booking&orderId={payment.PaymentId}",
            CancelUrl = $"{_payOSSettings.CancelUrl}?type=booking&orderId={payment.PaymentId}"
        };

        var activePayOSClient = _payOSClient;
        var isConfigured = IsPayOSConfigured();

        if (booking.Court?.FacilityId != null)
        {
            var facilityConfig = await context.Set<FacilityPaymentConfig>()
                .FirstOrDefaultAsync(c => c.FacilityId == booking.Court.FacilityId && c.IsActive && c.PaymentModel == 3);

            if (facilityConfig != null && !string.IsNullOrEmpty(facilityConfig.ApiKey))
            {
                try
                {
                    var keys = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(facilityConfig.ApiKey);
                    if (keys != null)
                    {
                        var clientId = keys.GetValueOrDefault("ClientId");
                        var apiKey = keys.GetValueOrDefault("ApiKey");
                        var checksumKey = keys.GetValueOrDefault("ChecksumKey");

                        if (!string.IsNullOrEmpty(clientId) && !string.IsNullOrEmpty(apiKey) && !string.IsNullOrEmpty(checksumKey))
                        {
                            activePayOSClient = new PayOSClient(new PayOSOptions
                            {
                                ClientId = clientId,
                                ApiKey = apiKey,
                                ChecksumKey = checksumKey
                            });
                            payment.FacilityConfigId = facilityConfig.ConfigId;
                            isConfigured = true;
                        }
                    }
                }
                catch { /* Ignore */ }
            }
        }

        if (!isConfigured)
        {
            payment.Note = $"https://pay.payos.vn/mock-payment/{payment.PaymentId}";
        }
        else
        {
            var paymentLink = await activePayOSClient.PaymentRequests.CreateAsync(payosRequest);
            payment.Note = paymentLink.CheckoutUrl;
        }

        await _unitOfWork.Payments.CreateAsync(payment);

        return MapToResponse(payment);
        }
        finally
        {
            await db.LockReleaseAsync(lockKey, lockValue);
        }
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

        // 3. Verify Signature
        try
        {
            await _payOSClient.Webhooks.VerifyAsync(webhook);
        }
        catch (Exception ex)
        {
            throw new UnauthorizedAccessException($"Chữ ký Webhook không hợp lệ: {ex.Message}");
        }

        // 4. Check if payment was successful
        if (webhook.Success)
        {
            // Update payment status
            payment.StatusId = 2; // Paid
            payment.PaidAt = DateTime.Now;
            payment.GatewayTransactionId = webhook.Data.PaymentLinkId;
            payment.Status = null;
            payment.User = null;
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
            payment.Status = null;
            payment.User = null;
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

        // 3. Xác định PayOSClient tương ứng (Admin hoặc Chủ cơ sở) và Verify Signature
        var activePayOSClient = _payOSClient;
        if (payment.FacilityConfigId.HasValue)
        {
            var context = _unitOfWork.Payments.GetContext();
            var facilityConfig = await context.Set<FacilityPaymentConfig>()
                .FirstOrDefaultAsync(c => c.ConfigId == payment.FacilityConfigId.Value);

            if (facilityConfig != null && !string.IsNullOrEmpty(facilityConfig.ApiKey))
            {
                try
                {
                    var keys = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(facilityConfig.ApiKey);
                    if (keys != null)
                    {
                        var clientId = keys.GetValueOrDefault("ClientId");
                        var apiKey = keys.GetValueOrDefault("ApiKey");
                        var checksumKey = keys.GetValueOrDefault("ChecksumKey");

                        if (!string.IsNullOrEmpty(clientId) && !string.IsNullOrEmpty(apiKey) && !string.IsNullOrEmpty(checksumKey))
                        {
                            activePayOSClient = new PayOSClient(new PayOSOptions
                            {
                                ClientId = clientId,
                                ApiKey = apiKey,
                                ChecksumKey = checksumKey
                            });
                        }
                    }
                }
                catch { /* Ignore */ }
            }
        }

        try
        {
            await activePayOSClient.Webhooks.VerifyAsync(webhook);
        }
        catch (Exception ex)
        {
            throw new UnauthorizedAccessException($"Chữ ký Webhook không hợp lệ: {ex.Message}");
        }

        var refIds = payment.ReferenceId.Contains(",")
            ? payment.ReferenceId.Split(',').Select(Guid.Parse).ToList()
            : new List<Guid> { Guid.Parse(payment.ReferenceId) };

        if (webhook.Success)
        {
            // 3. Update payment status
            payment.StatusId = 2; // Paid
            payment.PaidAt = DateTime.Now;
            payment.GatewayTransactionId = webhook.Data.PaymentLinkId;
            payment.Status = null;
            payment.User = null;
            await _unitOfWork.Payments.UpdateAsync(payment);

            // 4. Kiểm tra xem ReferenceId là Booking hay MatchAcceptance
            foreach (var refId in refIds)
            {
                var booking = await _unitOfWork.Booking.GetDetailAsync(refId);
                if (booking != null)
                {
                    if (booking.StatusId == 1)
                    {
                        booking.StatusId = 2; // Confirmed
                        await _unitOfWork.Booking.UpdateAsync(booking);

                        // 5. Tạo payout record cho facility owner nếu KHÔNG dùng BYOG
                        var isByog = payment.FacilityConfigId.HasValue;
                        var facility = booking.Court?.Facility;

                        if (facility != null && !isByog)
                        {
                            var bankAccount = await _unitOfWork.FacilityBankAccounts
                                .GetByFacilityIdAsync(facility.FacilityId);

                            var payout = new Payout
                            {
                                PayoutId = Guid.NewGuid(),
                                PaymentId = payment.PaymentId,
                                FacilityId = facility.FacilityId,
                                OwnerUserId = facility.OwnerId,
                                Amount = booking.TotalCost ?? 0,
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
                                    Balance = booking.TotalCost ?? 0,
                                    TotalEarned = booking.TotalCost ?? 0,
                                    LastUpdatedAt = DateTime.Now
                                };
                                await context.Set<FacilityWallet>().AddAsync(wallet);
                            }
                            else
                            {
                                wallet.Balance += booking.TotalCost ?? 0;
                                wallet.TotalEarned += booking.TotalCost ?? 0;
                                wallet.LastUpdatedAt = DateTime.Now;
                                context.Entry(wallet).State = EntityState.Modified;
                            }
                            await context.SaveChangesAsync();
                        }

                        if (facility != null)
                        {
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
        }
        else
        {
            // Payment cancelled
            payment.StatusId = 3; // Cancelled
            payment.Status = null;
            payment.User = null;
            await _unitOfWork.Payments.UpdateAsync(payment);

            foreach (var refId in refIds)
            {
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
    }

    #endregion

    #region Query

    public async Task<bool> CancelPaymentAsync(long orderCode, Guid userId)
    {
        var payment = await _unitOfWork.Payments.GetByOrderCodeAsync(orderCode);
        if (payment == null || payment.UserId != userId)
            return false;

        if (payment.StatusId != 1) // Not pending
            return false;

        // Update payment status
        payment.StatusId = 3; // Cancelled
        payment.Status = null;
        payment.User = null;
        await _unitOfWork.Payments.UpdateAsync(payment);

        if (payment.PaymentType == "Booking")
        {
            var refIds = payment.ReferenceId.Contains(",")
                ? payment.ReferenceId.Split(',').Select(Guid.Parse).ToList()
                : new List<Guid> { Guid.Parse(payment.ReferenceId) };

            foreach (var refId in refIds)
            {
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
                    var context = _unitOfWork.Payments.GetContext();
                    var acceptance = await context.Set<MatchAcceptance>().FirstOrDefaultAsync(ma => ma.AcceptanceId == refId);
                    if (acceptance != null)
                    {
                        acceptance.StatusId = 3; // Rejected/Cancelled
                        context.Entry(acceptance).State = EntityState.Modified;

                        var challenge = await _unitOfWork.MatchChallenges.GetByIdAsync(acceptance.ChallengeId);
                        if (challenge != null)
                        {
                            challenge.StatusId = 1; // Re-open challenge
                            await _unitOfWork.MatchChallenges.UpdateAsync(challenge);
                        }
                        await context.SaveChangesAsync();
                    }
                }
            }
        }

        return true;
    }

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
    /// PayOS description has a max length of 25 characters and allows only basic ASCII
    /// </summary>
    private static string TruncateDescription(string description)
    {
        var normalized = RemoveDiacritics(description);
        var clean = System.Text.RegularExpressions.Regex.Replace(normalized, @"[^a-zA-Z0-9\s]", "");
        return clean.Length > 25 ? clean[..25] : clean;
    }

    private static string RemoveDiacritics(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return text;
        
        var normalizedString = text.Normalize(System.Text.NormalizationForm.FormD);
        var stringBuilder = new System.Text.StringBuilder(capacity: normalizedString.Length);

        for (int i = 0; i < normalizedString.Length; i++)
        {
            char c = normalizedString[i];
            var unicodeCategory = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != System.Globalization.UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(c);
            }
        }

        return stringBuilder.ToString().Normalize(System.Text.NormalizationForm.FormC).Replace("Đ", "D").Replace("đ", "d");
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
