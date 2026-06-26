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
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetTeams([FromQuery] string? search, [FromQuery] PaginationParams pagination)
    {
        var result = await _teamService.GetTeamsAsync(GetCurrentUserId(), search, pagination);
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
    /// Cập nhật ảnh đại diện nhóm (Chỉ Leader).
    /// </summary>
    [Authorize]
    [HttpPost("{teamId:guid}/avatar")]
    public async Task<IActionResult> UpdateAvatar(Guid teamId, IFormFile file, [FromServices] IFileService fileService)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse.ErrorResponse("Tệp tải lên không hợp lệ hoặc rỗng."));

        if (!file.ContentType.StartsWith("image/"))
            return BadRequest(ApiResponse.ErrorResponse("Vui lòng tải lên tệp hình ảnh hợp lệ."));

        try
        {
            var userId = GetCurrentUserId();
            var fileName = file.FileName;
            var mimeType = file.ContentType;

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var fileData = ms.ToArray();

            // Save file in LocalFiles table with purpose 'Avatar' and type 'Image'
            var fileId = await fileService.UploadFileAsync(userId, fileName, fileData, "Image", "Avatar", mimeType);

            // Update team profile
            var team = await _teamService.UpdateAvatarAsync(userId, teamId, fileId);

            return Ok(ApiResponse<TeamDetailResponse>.SuccessResponse(team, "Cập nhật ảnh đại diện nhóm thành công."));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResponse(ex.Message));
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
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }
}
