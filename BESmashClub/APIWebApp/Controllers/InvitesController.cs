using System.Security.Claims;
using Entites.DTOs.Common;
using Entites.DTOs.Teams;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace APIWebApp.Controllers;

[ApiController]
public class InvitesController : ControllerBase
{
    private readonly ITeamService _teamService;

    public InvitesController(ITeamService teamService)
    {
        _teamService = teamService;
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Tạo link/token mời tham gia nhóm.
    /// </summary>
    [Authorize]
    [HttpPost("api/teams/{teamId:guid}/invites")]
    public async Task<IActionResult> CreateInvite(Guid teamId, [FromBody] CreateInviteRequest request)
    {
        try
        {
            var result = await _teamService.CreateInviteAsync(GetCurrentUserId(), teamId, request);
            return Ok(ApiResponse<InviteInfoResponse>.SuccessResponse(result, "Tạo lời mời thành công."));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Kiểm tra thông tin của link mời.
    /// </summary>
    [HttpGet("api/invites/{inviteToken}")]
    public async Task<IActionResult> GetInviteInfo(string inviteToken)
    {
        try
        {
            var result = await _teamService.GetInviteInfoAsync(inviteToken);
            return Ok(ApiResponse<InviteInfoResponse>.SuccessResponse(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// User xác nhận tham gia team thông qua link mời.
    /// </summary>
    [Authorize]
    [HttpPost("api/invites/{inviteToken}/accept")]
    public async Task<IActionResult> AcceptInvite(string inviteToken)
    {
        try
        {
            await _teamService.AcceptInviteAsync(GetCurrentUserId(), inviteToken);
            return Ok(ApiResponse.SuccessResponse("Tham gia nhóm thành công."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }
}
