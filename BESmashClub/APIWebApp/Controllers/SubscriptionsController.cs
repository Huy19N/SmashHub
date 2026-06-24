using Entites.DTOs.Common;
using Entites.Models;
using Microsoft.AspNetCore.Mvc;
using Repositories;
using Microsoft.EntityFrameworkCore;

namespace APIWebApp.Controllers;

[ApiController]
[Route("api/subscriptions")]
public class SubscriptionsController : ControllerBase
{
    private readonly UnitOfWork _unitOfWork;

    public SubscriptionsController(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet("plans")]
    public async Task<IActionResult> GetSubscriptionPlans()
    {
        var context = _unitOfWork.SubscriptionPlans.GetContext();
        var plans = await context.Set<SubscriptionPlan>()
            .Include(p => p.Tier)
            .OrderBy(p => p.Price)
            .Select(p => new
            {
                p.PlanId,
                p.TierId,
                p.DurationMonths,
                p.Price,
                TierName = p.Tier.TierName,
                Features = p.Tier.Features
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.SuccessResponse(plans));
    }
}
