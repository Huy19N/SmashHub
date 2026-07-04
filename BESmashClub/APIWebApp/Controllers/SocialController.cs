using System.Security.Claims;
using Entites.DTOs.Common;
using Entites.DTOs.Social;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace APIWebApp.Controllers;

[Authorize]
[ApiController]
[Route("api/social")]
public class SocialController : ControllerBase
{
    private readonly ISocialService _socialService;

    public SocialController(ISocialService socialService)
    {
        _socialService = socialService;
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private Guid? GetCurrentUserIdSafe()
    {
        var claim = User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(claim)) return null;
        return Guid.TryParse(claim, out var parsedGuid) ? parsedGuid : null;
    }

    [HttpPost("posts")]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostRequest request)
    {
        var result = await _socialService.CreatePostAsync(GetCurrentUserId(), request);
        return Ok(ApiResponse<PostDto>.SuccessResponse(result, "Đăng bài viết thành công."));
    }

    [HttpGet("posts")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPosts([FromQuery] PaginationParams pagination)
    {
        var result = await _socialService.GetPostsAsync(pagination, GetCurrentUserIdSafe());
        return Ok(ApiResponse<PagedResult<PostDto>>.SuccessResponse(result));
    }

    [HttpGet("facilities/{facilityId:int}/posts")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPostsByFacility(int facilityId, [FromQuery] PaginationParams pagination)
    {
        var result = await _socialService.GetPostsByFacilityAsync(facilityId, pagination, GetCurrentUserIdSafe());
        return Ok(ApiResponse<PagedResult<PostDto>>.SuccessResponse(result));
    }

    [HttpGet("teams/{teamId:guid}/posts")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPostsByTeam(Guid teamId, [FromQuery] PaginationParams pagination)
    {
        var result = await _socialService.GetPostsByTeamAsync(teamId, pagination, GetCurrentUserIdSafe());
        return Ok(ApiResponse<PagedResult<PostDto>>.SuccessResponse(result));
    }

    [HttpGet("posts/{postId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPostDetail(Guid postId)
    {
        try
        {
            var result = await _socialService.GetPostDetailAsync(postId, GetCurrentUserIdSafe());
            return Ok(ApiResponse<PostDto>.SuccessResponse(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    [HttpPost("posts/{postId:guid}/like")]
    public async Task<IActionResult> LikePost(Guid postId)
    {
        try
        {
            await _socialService.LikePostAsync(GetCurrentUserId(), postId);
            return Ok(ApiResponse.SuccessResponse("Thích bài viết thành công."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResponse($"Đã xảy ra lỗi: {ex.Message}"));
        }
    }

    [HttpDelete("posts/{postId:guid}/like")]
    public async Task<IActionResult> UnlikePost(Guid postId)
    {
        await _socialService.UnlikePostAsync(GetCurrentUserId(), postId);
        return Ok(ApiResponse.SuccessResponse("Bỏ thích bài viết thành công."));
    }

    [HttpPost("posts/{postId:guid}/comments")]
    public async Task<IActionResult> AddComment(Guid postId, [FromBody] Entites.DTOs.Social.CreateCommentRequest request)
    {
        try
        {
            var result = await _socialService.AddCommentAsync(GetCurrentUserId(), postId, request.Content);
            return Ok(ApiResponse<CommentDto>.SuccessResponse(result, "Bình luận thành công."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    [HttpGet("posts/{postId:guid}/comments")]
    [AllowAnonymous]
    public async Task<IActionResult> GetComments(Guid postId, [FromQuery] PaginationParams pagination)
    {
        var result = await _socialService.GetCommentsAsync(postId, pagination);
        return Ok(ApiResponse<PagedResult<CommentDto>>.SuccessResponse(result));
    }

    [HttpDelete("posts/{postId:guid}")]
    public async Task<IActionResult> DeletePost(Guid postId)
    {
        try
        {
            bool isAdmin = User.IsInRole("Admin");
            await _socialService.SoftDeletePostAsync(GetCurrentUserId(), postId, isAdmin);
            return Ok(ApiResponse.SuccessResponse("Đã xóa bài viết."));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    [HttpDelete("comments/{commentId:guid}")]
    public async Task<IActionResult> DeleteComment(Guid commentId)
    {
        try
        {
            bool isAdmin = User.IsInRole("Admin");
            await _socialService.SoftDeleteCommentAsync(GetCurrentUserId(), commentId, isAdmin);
            return Ok(ApiResponse.SuccessResponse("Đã xóa bình luận."));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    [HttpPost("posts/{postId:guid}/report")]
    public async Task<IActionResult> ReportPost(Guid postId, [FromBody] ReportPostRequest request)
    {
        try
        {
            await _socialService.ReportPostAsync(GetCurrentUserId(), postId, request.Reason);
            return Ok(ApiResponse.SuccessResponse("Đã gửi báo cáo vi phạm."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    [HttpPost("comments/{commentId:guid}/report")]
    public async Task<IActionResult> ReportComment(Guid commentId, [FromBody] ReportPostRequest request)
    {
        try
        {
            await _socialService.ReportCommentAsync(GetCurrentUserId(), commentId, request.Reason);
            return Ok(ApiResponse.SuccessResponse("Đã gửi báo cáo vi phạm bình luận."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    [HttpGet("report-reasons")]
    [AllowAnonymous]
    public IActionResult GetReportReasons()
    {
        var reasons = new List<string>
        {
            "Coordinating Harm and Promoting Crime",
            "Dangerous Organizations and Individuals",
            "Fraud, Scams, and Deceptive Practices",
            "Restricted Goods and Services",
            "Violence and Incitement",
            "Adult Sexual Exploitation",
            "Bullying and Harassment",
            "Child Sexual Exploitation, Abuse, and Nudity",
            "Human Exploitation",
            "Suicide, Self-Injury, and Eating Disorders",
            "Adult Nudity and Sexual Activity",
            "Adult Sexual Solicitation and Sexually Explicit Language",
            "Hateful Conduct",
            "Privacy Violations",
            "Violent and Graphic Content",
            "Account Integrity",
            "Authentic Identity Representation",
            "Cybersecurity",
            "Inauthentic Behavior",
            "Memorialization",
            "Misinformation",
            "Spam",
            "Third-Party Intellectual Property Infringement",
            "Using Meta Intellectual Property and Licenses",
            "Additional Protection of Minors",
            "Locally Illegal Content, Products, or Services",
            "User Requests"
        };
        return Ok(ApiResponse<List<string>>.SuccessResponse(reasons));
    }
}
