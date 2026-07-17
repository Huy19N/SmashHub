using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Repositories;
using Services.Interfaces;

namespace Services.Implementations;

public class PaymentCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<PaymentCleanupService> _logger;

    public PaymentCleanupService(IServiceProvider serviceProvider, ILogger<PaymentCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("PaymentCleanupService is starting.");
        
        // Check every minute
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(1));

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await CleanupExpiredPaymentsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred executing PaymentCleanupService.");
            }
        }
    }

    private async Task CleanupExpiredPaymentsAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
        var paymentService = scope.ServiceProvider.GetRequiredService<IPaymentService>();
        
        var cutoffTime = DateTime.Now.AddMinutes(-10);
        
        var context = unitOfWork.Payments.GetContext();
        var expiredPayments = await context.Set<Payment>()
            .Where(p => p.StatusId == 1 && p.PaymentType == "Booking" && p.CreatedAt < cutoffTime)
            .ToListAsync(stoppingToken);

        if (expiredPayments.Any())
        {
            _logger.LogInformation($"Found {expiredPayments.Count} expired pending payments to cancel.");
            
            foreach (var payment in expiredPayments)
            {
                _logger.LogInformation($"Cancelling expired payment {payment.OrderCode} (User: {payment.UserId})");
                await paymentService.CancelPaymentAsync(payment.OrderCode, payment.UserId);
            }
        }
    }
}
