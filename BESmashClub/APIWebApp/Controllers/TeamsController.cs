using System.Security.Claims;
using Entites.DTOs.Common;
using Entites.DTOs.Teams;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace APIWebApp.Controllers;

[ApiController]
[Route("api/teams")]
public class TeamsController : ControllerBase
{
    private readonly ITeamService _teamService;

    public TeamsController(ITeamService teamService)
    {
        _teamService = teamService;
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Tạo team mới (User tạo sẽ tự động trở thành Leader).
    /// </summary>
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateTeam([FromBody] CreateTeamRequest request)
    {
        var result = await _teamService.CreateTeamAsync(GetCurrentUserId(), request);
        return CreatedAtAction(nameof(GetTeamDetail), new { teamId = result.TeamId },
            ApiResponse<TeamDetailResponse>.SuccessResponse(result, "Tạo team thành công."));
    }

    /// <summary>
    /// Lấy danh sách teams (có search, pagination).
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetTeams([FromQuery] string? search, [FromQuery] PaginationParams pagination)
    {
        var result = await _teamService.GetTeamsAsync(search, pagination);
        return Ok(ApiResponse<PagedResult<TeamResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Lấy thông tin chi tiết của một team.
    /// </summary>
    [HttpGet("{teamId:guid}")]
    public async Task<IActionResult> GetTeamDetail(Guid teamId)
    {
        try
        {
            var result = await _teamService.GetTeamDetailAsync(teamId);
            return Ok(ApiResponse<TeamDetailResponse>.SuccessResponse(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Cập nhật thông tin team (Chỉ Leader).
    /// </summary>
    [Authorize]
    [HttpPut("{teamId:guid}")]
    public async Task<IActionResult> UpdateTeam(Guid teamId, [FromBody] UpdateTeamRequest request)
    {
        try
        {
            var result = await _teamService.UpdateTeamAsync(GetCurrentUserId(), teamId, request);
            return Ok(ApiResponse<TeamDetailResponse>.SuccessResponse(result, "Cập nhật team thành công."));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Giải tán team (Chỉ Leader).
    /// </summary>
    [Authorize]
    [HttpDelete("{teamId:guid}")]
    public async Task<IActionResult> DeleteTeam(Guid teamId)
    {
        try
        {
            await _teamService.DeleteTeamAsync(GetCurrentUserId(), teamId);
            return Ok(ApiResponse.SuccessResponse("Giải tán team thành công."));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }
}
