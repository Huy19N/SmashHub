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
    private readonly IContentModerationService _contentModeration;

    public SocialService(UnitOfWork unitOfWork, INotificationService notificationService, IContentModerationService contentModeration)
    {
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
        _contentModeration = contentModeration;
    }

    public async Task<PostDto> CreatePostAsync(Guid userId, CreatePostRequest request)
    {
        bool isClean = await _contentModeration.IsContentCleanAsync(request.Content);

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
            Status = isClean ? 1 : 3, // 1: Pending, 3: Rejected if bad words
            IsDeleted = false,
            CreatedAt = DateTime.Now
        };

        if (request.MediaFileIds != null && request.MediaFileIds.Any())
        {
            post.MediaFileId = request.MediaFileIds.First(); // Fallback
            int order = 0;
            foreach (var fileId in request.MediaFileIds)
            {
                post.PostMedia.Add(new PostMedia
                {
                    PostId = post.PostId,
                    FileId = fileId,
                    DisplayOrder = order++
                });
            }
        }

        await _unitOfWork.Posts.CreateAsync(post);

        // Fetch to return
        return await GetPostDetailAsync(post.PostId);
    }

    public async Task<PagedResult<PostDto>> GetPostsAsync(PaginationParams pagination, Guid? currentUserId = null)
    {
        List<Guid> blockedUserIds = new List<Guid>();
        if (currentUserId.HasValue)
        {
            // Get users blocked by current user, and users who blocked current user
            var blocks = await _unitOfWork.Context.UserBlocks
                .Where(b => b.BlockerId == currentUserId.Value || b.BlockedId == currentUserId.Value)
                .ToListAsync();
            blockedUserIds.AddRange(blocks.Select(b => b.BlockerId == currentUserId.Value ? b.BlockedId : b.BlockerId));
        }

        var (items, totalCount) = await _unitOfWork.Posts.GetPagedAsync(
            p => p.Status == 2 && !p.IsDeleted && (!currentUserId.HasValue || !blockedUserIds.Contains(p.AuthorUserId)),
            pagination.PageNumber,
            pagination.PageSize,
            query => query
                .Include(p => p.AuthorUser)
                .Include(p => p.Facility)
                .Include(p => p.Team)
                .Include(p => p.PostMedia)
                .Include(p => p.PostLikes)
                .Include(p => p.PostComments)
                .OrderByDescending(p => p.IsBoosted)
                .ThenByDescending(p => p.CreatedAt)
        );

        return new PagedResult<PostDto>
        {
            Items = items.Select(p => MapToDto(p, currentUserId)).ToList(),
            TotalCount = totalCount,
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }

    public async Task<PagedResult<PostDto>> GetPostsByFacilityAsync(int facilityId, PaginationParams pagination, Guid? currentUserId = null)
    {
        List<Guid> blockedUserIds = new List<Guid>();
        if (currentUserId.HasValue)
        {
            var blocks = await _unitOfWork.Context.UserBlocks
                .Where(b => b.BlockerId == currentUserId.Value || b.BlockedId == currentUserId.Value)
                .ToListAsync();
            blockedUserIds.AddRange(blocks.Select(b => b.BlockerId == currentUserId.Value ? b.BlockedId : b.BlockerId));
        }

        var (items, totalCount) = await _unitOfWork.Posts.GetPagedAsync(
            p => p.FacilityId == facilityId && p.Status == 2 && !p.IsDeleted && (!currentUserId.HasValue || !blockedUserIds.Contains(p.AuthorUserId)),
            pagination.PageNumber,
            pagination.PageSize,
            query => query
                .Include(p => p.AuthorUser)
                .Include(p => p.Facility)
                .Include(p => p.Team)
                .Include(p => p.PostMedia)
                .Include(p => p.PostLikes)
                .Include(p => p.PostComments)
                .OrderByDescending(p => p.IsBoosted)
                .ThenByDescending(p => p.CreatedAt)
        );

        return new PagedResult<PostDto>
        {
            Items = items.Select(p => MapToDto(p, currentUserId)).ToList(),
            TotalCount = totalCount,
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }

    public async Task<PagedResult<PostDto>> GetPostsByTeamAsync(Guid teamId, PaginationParams pagination, Guid? currentUserId = null)
    {
        List<Guid> blockedUserIds = new List<Guid>();
        if (currentUserId.HasValue)
        {
            var blocks = await _unitOfWork.Context.UserBlocks
                .Where(b => b.BlockerId == currentUserId.Value || b.BlockedId == currentUserId.Value)
                .ToListAsync();
            blockedUserIds.AddRange(blocks.Select(b => b.BlockerId == currentUserId.Value ? b.BlockedId : b.BlockerId));
        }

        var (items, totalCount) = await _unitOfWork.Posts.GetPagedAsync(
            p => p.TeamId == teamId && p.Status == 2 && !p.IsDeleted && (!currentUserId.HasValue || !blockedUserIds.Contains(p.AuthorUserId)),
            pagination.PageNumber,
            pagination.PageSize,
            query => query
                .Include(p => p.AuthorUser)
                .Include(p => p.Facility)
                .Include(p => p.Team)
                .Include(p => p.PostMedia)
                .Include(p => p.PostLikes)
                .Include(p => p.PostComments)
                .OrderByDescending(p => p.CreatedAt)
        );

        return new PagedResult<PostDto>
        {
            Items = items.Select(p => MapToDto(p, currentUserId)).ToList(),
            TotalCount = totalCount,
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }

    public async Task<PostDto> GetPostDetailAsync(Guid postId, Guid? currentUserId = null)
    {
        var context = _unitOfWork.Posts.GetContext();
        var post = await context.Set<Post>()
            .Include(p => p.AuthorUser)
            .Include(p => p.Facility)
            .Include(p => p.Team)
            .Include(p => p.PostMedia)
            .Include(p => p.PostComments.Where(c => !c.IsDeleted))
            .Include(p => p.PostLikes)
            .FirstOrDefaultAsync(p => p.PostId == postId && !p.IsDeleted);

        if (post == null)
            throw new KeyNotFoundException("Không tìm thấy bài viết hoặc bài viết đã bị xóa.");

        return MapToDto(post, currentUserId);
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
            c => c.PostId == postId && !c.IsDeleted,
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

    public async Task SoftDeletePostAsync(Guid userId, Guid postId, bool isAdmin)
    {
        var post = await _unitOfWork.Posts.GetByIdAsync(postId);
        if (post == null) throw new KeyNotFoundException("Bài viết không tồn tại.");

        if (!isAdmin && post.AuthorUserId != userId)
            throw new UnauthorizedAccessException("Bạn không có quyền xóa bài viết này.");

        post.IsDeleted = true;
        await _unitOfWork.Posts.UpdateAsync(post);
    }

    public async Task SoftDeleteCommentAsync(Guid userId, Guid commentId, bool isAdmin)
    {
        var comment = await _unitOfWork.PostComments.GetByIdAsync(commentId);
        if (comment == null) throw new KeyNotFoundException("Bình luận không tồn tại.");

        if (!isAdmin && comment.UserId != userId)
            throw new UnauthorizedAccessException("Bạn không có quyền xóa bình luận này.");

        comment.IsDeleted = true;
        await _unitOfWork.PostComments.UpdateAsync(comment);
    }

    public async Task ReportPostAsync(Guid userId, Guid postId, string reason)
    {
        var post = await _unitOfWork.Posts.GetByIdAsync(postId);
        if (post == null || post.IsDeleted) throw new KeyNotFoundException("Bài viết không tồn tại.");

        var report = new PostReport
        {
            ReportId = Guid.NewGuid(),
            PostId = postId,
            ReporterId = userId,
            Reason = reason,
            Status = 1, // Pending
            CreatedAt = DateTime.Now
        };

        await _unitOfWork.Context.PostReports.AddAsync(report);
        await _unitOfWork.Context.SaveChangesAsync();
    }

    public async Task<PagedResult<PostDto>> GetPendingPostsAsync(PaginationParams pagination)
    {
        var (items, totalCount) = await _unitOfWork.Posts.GetPagedAsync(
            p => p.Status == 1 && !p.IsDeleted,
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
            Items = items.Select(p => MapToDto(p)).ToList(),
            TotalCount = totalCount,
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }

    public async Task ApprovePostAsync(Guid postId)
    {
        var post = await _unitOfWork.Posts.GetByIdAsync(postId);
        if (post == null) throw new KeyNotFoundException("Bài viết không tồn tại.");

        post.Status = 2; // Approved
        await _unitOfWork.Posts.UpdateAsync(post);
    }

    public async Task RejectPostAsync(Guid postId)
    {
        var post = await _unitOfWork.Posts.GetByIdAsync(postId);
        if (post == null) throw new KeyNotFoundException("Bài viết không tồn tại.");

        post.Status = 3; // Rejected
        await _unitOfWork.Posts.UpdateAsync(post);
    }

    private static PostDto MapToDto(Post p, Guid? currentUserId = null)
    {
        return new PostDto
        {
            PostId = p.PostId,
            AuthorUserId = p.AuthorUserId,
            AuthorName = p.AuthorUser?.FullName ?? "Unknown",
            AuthorAvatarId = p.AuthorUser?.AvatarFileId,
            FacilityId = p.FacilityId,
            FacilityName = p.Facility?.Name,
            TeamId = p.TeamId,
            TeamName = p.Team?.TeamName,
            PostType = p.PostType,
            Content = p.Content,
            MediaFileId = p.MediaFileId,
            MediaFileIds = p.PostMedia != null && p.PostMedia.Any() 
                ? p.PostMedia.OrderBy(m => m.DisplayOrder).Select(m => m.FileId).ToList() 
                : (p.MediaFileId.HasValue ? new List<Guid> { p.MediaFileId.Value } : new List<Guid>()),
            IsBoosted = p.IsBoosted,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt,
            LikeCount = p.PostLikes?.Count ?? 0,
            CommentCount = p.PostComments?.Count ?? 0,
            IsLikedByCurrentUser = currentUserId.HasValue && p.PostLikes != null && p.PostLikes.Any(l => l.UserId == currentUserId.Value)
        };
    }
}
