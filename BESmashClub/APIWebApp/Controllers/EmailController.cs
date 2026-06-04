using Entites.DTOs;
using Entites.DTOs.Bookings;
using Entites.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace APIWebApp.Controllers
{
    [Route("api/email")]
    [ApiController]
    public class EmailController : ControllerBase
    {
        private readonly IEmailService _emailService;
        public EmailController(IEmailService emailService)
        {
            _emailService = emailService;
        }
        [HttpPost("sendconfirmationemail")]
        [AllowAnonymous]
        public async Task<IActionResult> SendConfirmationEmail([FromBody] string request)
        {
            try
            {
                await _emailService.SendEmailConfirmationAsync(request);
                return Ok(ApiResponse.SuccessResponse("Gửi email xác nhận thành công."));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ex.Message));
            }
        }

        [HttpPost("verifycodenodelete")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyCodeNoDelete([FromBody] EmailConfirmationRequest request)
        {
            try
            {
                var result = await _emailService.VerifyEmailNoDeleteAsync(request.Code, request.Email);
                return Ok(ApiResponse<bool>.SuccessResponse(result));

            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse(ex.Message));
            }
            catch(InvalidOperationException ex){
                return BadRequest(ApiResponse<bool>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<bool>.ErrorResponse(ex.Message));
            }
                
        }
        [HttpPost("verifycode")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyCode([FromBody] EmailConfirmationRequest request)
        {
            try
            {
                var result = await _emailService.VerifyEmailAsync(request.Code, request.Email);
                return Ok(ApiResponse<bool>.SuccessResponse(result));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<bool>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

    }
}
