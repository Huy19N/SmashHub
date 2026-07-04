using Entites.DTOs.Common;
using Entites.DTOs.Social;

namespace Services.Interfaces;

public interface ISocialService
{
    Task<PostDto> CreatePostAsync(Guid userId, CreatePostRequest request);
    Task<PagedResult<PostDto>> GetPostsAsync(PaginationParams pagination, Guid? currentUserId = null);
    Task<PagedResult<PostDto>> GetPostsByFacilityAsync(int facilityId, PaginationParams pagination, Guid? currentUserId = null);
    Task<PagedResult<PostDto>> GetPostsByTeamAsync(Guid teamId, PaginationParams pagination, Guid? currentUserId = null);
    Task<PostDto> GetPostDetailAsync(Guid postId, Guid? currentUserId = null);
    Task LikePostAsync(Guid userId, Guid postId);
    Task UnlikePostAsync(Guid userId, Guid postId);
    Task<CommentDto> AddCommentAsync(Guid userId, Guid postId, string content);
    Task<PagedResult<CommentDto>> GetCommentsAsync(Guid postId, PaginationParams pagination);
    
    // Moderation & Reporting
    Task SoftDeletePostAsync(Guid userId, Guid postId, bool isAdmin);
    Task SoftDeleteCommentAsync(Guid userId, Guid commentId, bool isAdmin);
    Task ReportPostAsync(Guid userId, Guid postId, string reason);
    Task ReportCommentAsync(Guid userId, Guid commentId, string reason);
    
    // Admin specific
    Task<PagedResult<PostDto>> GetPendingPostsAsync(PaginationParams pagination);
    Task ApprovePostAsync(Guid postId);
    Task RejectPostAsync(Guid postId);
    Task<object> GetPendingReportsAsync(PaginationParams pagination);
    Task ResolveReportAsync(string reportId, Guid adminId, string action);
    Task DismissReportAsync(string reportId, Guid adminId);
}
