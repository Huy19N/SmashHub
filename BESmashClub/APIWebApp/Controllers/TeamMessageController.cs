using Entites.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using System.Security.Claims;

namespace APIWebApp.Controllers
{
    [Route("api/{teamId:guid}/messages")]
    [ApiController]
    public class TeamMessageController : ControllerBase
    {
        private readonly ITeamMessageService _teamMessageService;

        public TeamMessageController(ITeamMessageService teamMessageService)
        {
            _teamMessageService = teamMessageService;
        }

        private Guid GetCurrentUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        [HttpGet]
        public async Task<IActionResult> GetTeamMessages([FromQuery] Guid teamId, [FromQuery] PaginationParams pagination)
        {
            var userId = GetCurrentUserId();

            return Ok();
        }
        
        [HttpPost]
        public async Task<IActionResult> SendMessage(Guid teamId, [FromBody] string content)
        {
            var userId = GetCurrentUserId();




            return Ok();
        }
        
        [HttpDelete]
        public async Task<IActionResult> DeleteMessage([FromQuery] Guid teamId, [FromQuery] Guid messageId)
        {
            var userId = GetCurrentUserId();
            return Ok();
        }
    }
}
