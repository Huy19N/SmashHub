using System.Security.Claims;
using Entites.DTOs.Common;
using Entites.DTOs.Matchmaking;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace APIWebApp.Controllers;

[ApiController]
[Route("api/matchmaking")]
[Authorize]
public class MatchmakingController : ControllerBase
{
    private readonly IMatchmakingService _matchmakingService;

    public MatchmakingController(IMatchmakingService matchmakingService)
    {
        _matchmakingService = matchmakingService;
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Tạo yêu cầu ghép đấu (chỉ Leader đội chủ nhà).
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateChallenge([FromBody] CreateMatchChallengeRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _matchmakingService.CreateChallengeAsync(userId, request);
            return Ok(ApiResponse<MatchChallengeResponse>.SuccessResponse(result, "Tạo tin ghép đấu thành công."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Lấy danh sách các tin ghép đấu đang tìm đối thủ (Public).
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetActiveChallenges([FromQuery] int? sportId, [FromQuery] string? city, [FromQuery] string? district)
    {
        var result = await _matchmakingService.GetActiveChallengesAsync(sportId, city, district);
        return Ok(ApiResponse<List<MatchChallengeResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// API lấy danh sách sân có trận chờ ghép đấu để hiển thị trên bản đồ (Public).
    /// Chỉ hiển thị tên cơ sở, ID cơ sở, tọa độ Latitude/Longitude và số tin ghép đang hoạt động.
    /// </summary>
    [HttpGet("map")]
    [AllowAnonymous]
    public async Task<IActionResult> GetChallengesForMap()
    {
        var result = await _matchmakingService.GetChallengesForMapAsync();
        return Ok(ApiResponse<List<MatchChallengeMapResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Đăng ký tham gia ghép đấu với tư cách đối thủ (chỉ Leader đội khách).
    /// </summary>
    [HttpPost("{challengeId:guid}/join")]
    public async Task<IActionResult> JoinChallenge(Guid challengeId, [FromBody] JoinMatchRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _matchmakingService.JoinChallengeAsync(userId, challengeId, request.ChallengerTeamId);
            return Ok(ApiResponse<MatchAcceptanceResponse>.SuccessResponse(result, "Gửi yêu cầu tham gia ghép đấu thành công."));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Xem danh sách các đội đăng ký tham gia ghép đấu (chỉ Leader đội chủ nhà).
    /// </summary>
    [HttpGet("{challengeId:guid}/acceptances")]
    public async Task<IActionResult> GetAcceptances(Guid challengeId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _matchmakingService.GetAcceptancesAsync(userId, challengeId);
            return Ok(ApiResponse<List<MatchAcceptanceResponse>>.SuccessResponse(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    /// <summary>
    /// Duyệt/Từ chối yêu cầu tham gia ghép đấu (chỉ Leader đội chủ nhà).
    /// </summary>
    [HttpPost("acceptances/{acceptanceId:guid}/respond")]
    public async Task<IActionResult> RespondToAcceptance(Guid acceptanceId, [FromQuery] bool accept)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _matchmakingService.RespondToAcceptanceAsync(userId, acceptanceId, accept);
            var statusMessage = accept ? "Chấp nhận yêu cầu thành công. Hệ thống đã gửi hóa đơn chia đôi phí cho đối thủ." : "Từ chối yêu cầu thành công.";
            return Ok(ApiResponse.SuccessResponse(statusMessage));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }
}
