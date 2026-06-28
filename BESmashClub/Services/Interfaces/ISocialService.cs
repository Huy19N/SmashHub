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
}
