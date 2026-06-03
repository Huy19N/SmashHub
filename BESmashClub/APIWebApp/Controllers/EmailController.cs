using Entites.DTOs.Bookings;
using Entites.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace APIWebApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmailController : ControllerBase
    {
        private readonly IEmailService _emailService;
        public EmailController(IEmailService emailService)
        {
            _emailService = emailService;
        }
        [HttpGet("{key:Guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> CheckKey(Guid key)
        {
            var result = await _emailService.CheckKey(key);
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }
    }
}
