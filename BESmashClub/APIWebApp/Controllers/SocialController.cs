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
        var result = await _socialService.GetPostsAsync(pagination);
        return Ok(ApiResponse<PagedResult<PostDto>>.SuccessResponse(result));
    }

    [HttpGet("facilities/{facilityId:int}/posts")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPostsByFacility(int facilityId, [FromQuery] PaginationParams pagination)
    {
        var result = await _socialService.GetPostsByFacilityAsync(facilityId, pagination);
        return Ok(ApiResponse<PagedResult<PostDto>>.SuccessResponse(result));
    }

    [HttpGet("teams/{teamId:guid}/posts")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPostsByTeam(Guid teamId, [FromQuery] PaginationParams pagination)
    {
        var result = await _socialService.GetPostsByTeamAsync(teamId, pagination);
        return Ok(ApiResponse<PagedResult<PostDto>>.SuccessResponse(result));
    }

    [HttpGet("posts/{postId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPostDetail(Guid postId)
    {
        try
        {
            var result = await _socialService.GetPostDetailAsync(postId);
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
}
