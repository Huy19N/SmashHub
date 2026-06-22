using Entites.DTOs.Common;
using Entites.DTOs.Social;
using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories;
using Services.Interfaces;

namespace Services.Implementations;

public class SocialService : ISocialService
{
    private readonly UnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;

    public SocialService(UnitOfWork unitOfWork, INotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
    }

    public async Task<PostDto> CreatePostAsync(Guid userId, CreatePostRequest request)
    {
        var post = new Post
        {
            PostId = Guid.NewGuid(),
            AuthorUserId = userId,
            FacilityId = request.FacilityId,
            TeamId = request.TeamId,
            PostType = request.PostType,
            Content = request.Content,
            MediaFileId = request.MediaFileId,
            IsBoosted = false,
            CreatedAt = DateTime.Now
        };

        await _unitOfWork.Posts.CreateAsync(post);

        // Fetch to return
        return await GetPostDetailAsync(post.PostId);
    }

    public async Task<PagedResult<PostDto>> GetPostsAsync(PaginationParams pagination)
    {
        var (items, totalCount) = await _unitOfWork.Posts.GetPagedAsync(
            p => true,
            pagination.PageNumber,
            pagination.PageSize,
            query => query
                .Include(p => p.AuthorUser)
                .Include(p => p.Facility)
                .Include(p => p.Team)
                .OrderByDescending(p => p.IsBoosted)
                .ThenByDescending(p => p.CreatedAt)
        );

        return new PagedResult<PostDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }

    public async Task<PagedResult<PostDto>> GetPostsByFacilityAsync(int facilityId, PaginationParams pagination)
    {
        var (items, totalCount) = await _unitOfWork.Posts.GetPagedAsync(
            p => p.FacilityId == facilityId,
            pagination.PageNumber,
            pagination.PageSize,
            query => query
                .Include(p => p.AuthorUser)
                .Include(p => p.Facility)
                .Include(p => p.Team)
                .OrderByDescending(p => p.IsBoosted)
                .ThenByDescending(p => p.CreatedAt)
        );

        return new PagedResult<PostDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }

    public async Task<PagedResult<PostDto>> GetPostsByTeamAsync(Guid teamId, PaginationParams pagination)
    {
        var (items, totalCount) = await _unitOfWork.Posts.GetPagedAsync(
            p => p.TeamId == teamId,
            pagination.PageNumber,
            pagination.PageSize,
            query => query
                .Include(p => p.AuthorUser)
                .Include(p => p.Facility)
                .Include(p => p.Team)
                .OrderByDescending(p => p.CreatedAt)
        );

        return new PagedResult<PostDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }

    public async Task<PostDto> GetPostDetailAsync(Guid postId)
    {
        var context = _unitOfWork.Posts.GetContext();
        var post = await context.Set<Post>()
            .Include(p => p.AuthorUser)
            .Include(p => p.Facility)
            .Include(p => p.Team)
            .Include(p => p.PostComments)
            .Include(p => p.PostLikes)
            .FirstOrDefaultAsync(p => p.PostId == postId);

        if (post == null)
            throw new KeyNotFoundException("Không tìm thấy bài viết.");

        return MapToDto(post);
    }

    public async Task LikePostAsync(Guid userId, Guid postId)
    {
        var post = await _unitOfWork.Posts.GetByIdAsync(postId);
        if (post == null)
            throw new KeyNotFoundException("Không tìm thấy bài viết.");

        var existingLike = await _unitOfWork.PostLikes.FindAsync(l => l.PostId == postId && l.UserId == userId);
        if (!existingLike.Any())
        {
            var like = new PostLike
            {
                PostId = postId,
                UserId = userId,
                CreatedAt = DateTime.Now
            };
            await _unitOfWork.PostLikes.CreateAsync(like);

            // Notify author
            if (post.AuthorUserId != userId)
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                await _notificationService.CreateNotificationAsync(
                    post.AuthorUserId,
                    "Lượt thích mới",
                    $"{user?.FullName} đã thích bài viết của bạn.",
                    "PostLike",
                    postId
                );
            }
        }
    }

    public async Task UnlikePostAsync(Guid userId, Guid postId)
    {
        var existingLike = await _unitOfWork.PostLikes.FindAsync(l => l.PostId == postId && l.UserId == userId);
        var like = existingLike.FirstOrDefault();
        if (like != null)
        {
            await _unitOfWork.PostLikes.RemoveAsync(like);
        }
    }

    public async Task<CommentDto> AddCommentAsync(Guid userId, Guid postId, string content)
    {
        var post = await _unitOfWork.Posts.GetByIdAsync(postId);
        if (post == null)
            throw new KeyNotFoundException("Không tìm thấy bài viết.");

        var comment = new PostComment
        {
            CommentId = Guid.NewGuid(),
            PostId = postId,
            UserId = userId,
            Content = content,
            CreatedAt = DateTime.Now
        };

        await _unitOfWork.PostComments.CreateAsync(comment);

        var user = await _unitOfWork.Users.GetByIdAsync(userId);

        // Notify author
        if (post.AuthorUserId != userId)
        {
            await _notificationService.CreateNotificationAsync(
                post.AuthorUserId,
                "Bình luận mới",
                $"{user?.FullName} đã bình luận: {content}",
                "PostComment",
                postId
            );
        }

        return new CommentDto
        {
            CommentId = comment.CommentId,
            PostId = comment.PostId,
            UserId = comment.UserId,
            UserName = user?.FullName ?? "Unknown",
            UserAvatarId = user?.AvatarFileId,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt
        };
    }

    public async Task<PagedResult<CommentDto>> GetCommentsAsync(Guid postId, PaginationParams pagination)
    {
        var (items, totalCount) = await _unitOfWork.PostComments.GetPagedAsync(
            c => c.PostId == postId,
            pagination.PageNumber,
            pagination.PageSize,
            query => query.Include(c => c.User).OrderBy(c => c.CreatedAt)
        );

        var dtos = items.Select(c => new CommentDto
        {
            CommentId = c.CommentId,
            PostId = c.PostId,
            UserId = c.UserId,
            UserName = c.User?.FullName ?? "Unknown",
            UserAvatarId = c.User?.AvatarFileId,
            Content = c.Content,
            CreatedAt = c.CreatedAt
        }).ToList();

        return new PagedResult<CommentDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }

    private static PostDto MapToDto(Post p)
    {
        return new PostDto
        {
            PostId = p.PostId,
            AuthorUserId = p.AuthorUserId,
            AuthorName = p.AuthorUser?.FullName ?? "Unknown",
            FacilityId = p.FacilityId,
            FacilityName = p.Facility?.Name,
            TeamId = p.TeamId,
            TeamName = p.Team?.TeamName,
            PostType = p.PostType,
            Content = p.Content,
            MediaFileId = p.MediaFileId,
            IsBoosted = p.IsBoosted,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt,
            LikeCount = p.PostLikes?.Count ?? 0,
            CommentCount = p.PostComments?.Count ?? 0
        };
    }
}
