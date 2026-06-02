using Entites.DTOs.Common;
using Entites.DTOs.Teams;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using System.Security.Claims;

namespace APIWebApp.Controllers
{
    [Route("api/teams/{teamId:guid}/messages")]
    [ApiController]
    [Authorize]
    public class TeamMessageController : ControllerBase
    {
        private readonly ITeamService _teamService;

        public TeamMessageController(ITeamService teamService)
        {
            _teamService = teamService;
        }

        private Guid GetCurrentUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        /// <summary>
        /// Lấy tin nhắn của team (có phân trang & tìm kiếm).
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetTeamMessages(
            Guid teamId, [FromQuery] string? search, [FromQuery] PaginationParams pagination)
        {
            try
            {
                var result = await _teamService.GetTeamMessagesAsync(teamId, search, pagination);
                return Ok(ApiResponse<PagedResult<TeamMessageResponse>>.SuccessResponse(result));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse.ErrorResponse(ex.Message));
            }
        }

        /// <summary>
        /// Gửi tin nhắn vào team chat.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> SendMessage(Guid teamId, [FromBody] CreateTeamMessageRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _teamService.SendTeamMessageAsync(userId, teamId, request.Content);
                return Ok(ApiResponse<TeamMessageResponse>.SuccessResponse(result, "Gửi tin nhắn thành công."));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ex.Message));
            }
        }

        /// <summary>
        /// Xóa tin nhắn (soft delete). Chỉ người gửi hoặc Leader mới có quyền.
        /// </summary>
        [HttpDelete("{messageId:guid}")]
        public async Task<IActionResult> DeleteMessage(Guid teamId, Guid messageId)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _teamService.RemoveTeamMessageAsync(userId, messageId);
                return Ok(ApiResponse.SuccessResponse("Đã xóa tin nhắn."));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse.ErrorResponse(ex.Message));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid();
            }
        }
    }
}
