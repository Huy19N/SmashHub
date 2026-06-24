using System.Security.Claims;
using Entites.DTOs.Common;
using Entites.DTOs.Teams;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace APIWebApp.Controllers;

[Authorize]
[ApiController]
[Route("api/teams/{teamId:guid}/members")]
public class TeamMembersController : ControllerBase
{
    private readonly ITeamService _teamService;

    public TeamMembersController(ITeamService teamService)
    {
        _teamService = teamService;
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Lấy danh sách thành viên trong team.
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetMembers(Guid teamId)
    {
        var result = await _teamService.GetMembersAsync(teamId);
        return Ok(ApiResponse<List<TeamMemberResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Cập nhật thông tin thành viên (Leader đổi role, cập nhật Wins/Losses).
    /// </summary>
    [HttpPatch("{userId:guid}")]
    public async Task<IActionResult> UpdateMember(Guid teamId, Guid userId, [FromBody] UpdateMemberRequest request)
    {
        try
        {
            var result = await _teamService.UpdateMemberAsync(GetCurrentUserId(), teamId, userId, request);
            return Ok(ApiResponse<TeamMemberResponse>.SuccessResponse(result, "Cập nhật thành viên thành công."));
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
    /// Xóa thành viên khỏi nhóm (Leader kick) hoặc tự rời nhóm.
    /// </summary>
    [HttpDelete("{userId:guid}")]
    public async Task<IActionResult> RemoveMember(Guid teamId, Guid userId)
    {
        try
        {
            await _teamService.RemoveMemberAsync(GetCurrentUserId(), teamId, userId);
            return Ok(ApiResponse.SuccessResponse("Đã xóa thành viên khỏi nhóm."));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
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
