using Entites.DTOs.Common;
using Entites.DTOs.Social;
using Entites.Mongo;
using Repositories;
using Repositories.Mongo;
using Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Driver;
using Microsoft.EntityFrameworkCore;

namespace Services.Implementations;

public class SocialService : ISocialService
{
    private readonly IPostRepository _postRepository;
    private readonly IPostCommentRepository _postCommentRepository;
    private readonly IPostLikeRepository _postLikeRepository;
    private readonly IPostReportRepository _postReportRepository;
    private readonly UnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;

    public SocialService(
        IPostRepository postRepository, 
        IPostCommentRepository postCommentRepository, 
        IPostLikeRepository postLikeRepository, 
        IPostReportRepository postReportRepository, 
        UnitOfWork unitOfWork, 
        INotificationService notificationService)
    {
        _postRepository = postRepository;
        _postCommentRepository = postCommentRepository;
        _postLikeRepository = postLikeRepository;
        _postReportRepository = postReportRepository;
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
    }

    public async Task<PagedResult<PostDto>> GetFeedAsync(Guid userId, PaginationParams pagination)
    {
        var filter = Builders<Post>.Filter.And(
            Builders<Post>.Filter.Eq(p => p.IsDeleted, false),
            Builders<Post>.Filter.Eq(p => p.Status, 2)
        );

        var blockedIds = await _unitOfWork.Context.UserBlocks
            .Where(b => b.BlockerId == userId || b.BlockedId == userId)
            .Select(b => b.BlockerId == userId ? b.BlockedId : b.BlockerId)
            .ToListAsync();

        var blockedIdsStrings = blockedIds.Select(id => id.ToString()).ToList();
        if (blockedIdsStrings.Any())
        {
            filter = Builders<Post>.Filter.And(filter, Builders<Post>.Filter.Nin(p => p.UserId, blockedIdsStrings));
        }

        var allPosts = await _postRepository.FindAsync(filter);
        var paged = allPosts.OrderByDescending(p => p.CreatedAt)
                            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                            .Take(pagination.PageSize)
                            .ToList();

        var dtos = new List<PostDto>();
        foreach (var p in paged) dtos.Add(await MapToDto(p, userId));

        return new PagedResult<PostDto>
        {
            Items = dtos,
            TotalCount = allPosts.Count,
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }

    public async Task<PostDto> GetPostDetailAsync(Guid postId, Guid? currentUserId = null)
    {
        var post = await _postRepository.GetByIdAsync(postId.ToString());
        if (post == null || post.IsDeleted) throw new KeyNotFoundException("Bài viết không tồn tại.");
        return await MapToDto(post, currentUserId);
    }

    public async Task<PostDto> CreatePostAsync(Guid userId, CreatePostRequest request)
    {
        var post = new Post
        {
            Id = Guid.NewGuid().ToString(),
            UserId = userId.ToString(),
            Content = request.Content,
            PostType = request.PostType,
            TeamId = request.TeamId,
            FacilityId = request.FacilityId,
            CreatedAt = DateTime.Now,
            Status = 1, // 1: Pending, 2: Approved, 3: Rejected
            IsDeleted = false,
            MediaFileIds = request.MediaFileIds ?? new List<Guid>()
        };

        await _postRepository.CreateAsync(post);
        return await MapToDto(post, userId);
    }

    public async Task LikePostAsync(Guid userId, Guid postId)
    {
        var post = await _postRepository.GetByIdAsync(postId.ToString());
        if (post == null || post.IsDeleted) throw new KeyNotFoundException("Bài viết không tồn tại.");

        var filter = Builders<PostLike>.Filter.And(
            Builders<PostLike>.Filter.Eq(l => l.PostId, postId.ToString()),
            Builders<PostLike>.Filter.Eq(l => l.UserId, userId.ToString())
        );
        var existing = await _postLikeRepository.FindAsync(filter);
        
        if (!existing.Any())
        {
            await _postLikeRepository.CreateAsync(new PostLike 
            { 
                Id = Guid.NewGuid().ToString(),
                PostId = postId.ToString(), 
                UserId = userId.ToString(), 
                CreatedAt = DateTime.Now 
            });
            post.LikeCount++;
            await _postRepository.UpdateAsync(post.Id, post);

            if (!string.IsNullOrEmpty(post.UserId) && post.UserId != userId.ToString() && Guid.TryParse(post.UserId, out var postOwnerId))
            {
                await _notificationService.CreateNotificationAsync(
                    postOwnerId,
                    "Lượt thích mới",
                    "Ai đó đã thích bài viết của bạn.",
                    "PostLike",
                    postId
                );
            }
        }
    }

    public async Task UnlikePostAsync(Guid userId, Guid postId)
    {
        var filter = Builders<PostLike>.Filter.And(
            Builders<PostLike>.Filter.Eq(l => l.PostId, postId.ToString()),
            Builders<PostLike>.Filter.Eq(l => l.UserId, userId.ToString())
        );
        var existing = await _postLikeRepository.FindAsync(filter);
        if (existing.Any())
        {
            await _postLikeRepository.DeleteManyAsync(filter);
            var post = await _postRepository.GetByIdAsync(postId.ToString());
            if (post != null) {
                post.LikeCount = Math.Max(0, post.LikeCount - 1);
                await _postRepository.UpdateAsync(post.Id, post);
            }
        }
    }

    public async Task<CommentDto> AddCommentAsync(Guid userId, Guid postId, string content)
    {
        var post = await _postRepository.GetByIdAsync(postId.ToString());
        if (post == null || post.IsDeleted) throw new KeyNotFoundException("Bài viết không tồn tại.");

        var comment = new PostComment
        {
            Id = Guid.NewGuid().ToString(),
            PostId = postId.ToString(),
            UserId = userId.ToString(),
            Content = content,
            CreatedAt = DateTime.Now,
            IsDeleted = false
        };

        await _postCommentRepository.CreateAsync(comment);
        post.CommentCount++;
        await _postRepository.UpdateAsync(post.Id, post);

        if (post.UserId != userId.ToString())
        {
            await _notificationService.CreateNotificationAsync(
                Guid.Parse(post.UserId),
                "Bình luận mới",
                "Ai đó đã bình luận bài viết của bạn.",
                "PostComment",
                postId
            );
        }

        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        return new CommentDto
        {
            CommentId = Guid.Parse(comment.Id),
            PostId = Guid.Parse(comment.PostId),
            UserId = Guid.Parse(comment.UserId),
            UserName = user?.FullName ?? "Unknown",
            UserAvatarId = user?.AvatarFileId,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt
        };
    }

    public async Task<PagedResult<CommentDto>> GetCommentsAsync(Guid postId, PaginationParams pagination)
    {
        var filter = Builders<PostComment>.Filter.And(
            Builders<PostComment>.Filter.Eq(c => c.PostId, postId.ToString()),
            Builders<PostComment>.Filter.Eq(c => c.IsDeleted, false)
        );
        var allComments = await _postCommentRepository.FindAsync(filter);
        var paged = allComments.OrderByDescending(c => c.CreatedAt)
                               .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                               .Take(pagination.PageSize)
                               .ToList();

        var dtos = new List<CommentDto>();
        foreach(var c in paged) {
            var user = await _unitOfWork.Users.GetByIdAsync(Guid.Parse(c.UserId));
            dtos.Add(new CommentDto {
                CommentId = Guid.Parse(c.Id),
                PostId = Guid.Parse(c.PostId),
                UserId = Guid.Parse(c.UserId),
                UserName = user?.FullName ?? "Unknown",
                UserAvatarId = user?.AvatarFileId,
                Content = c.Content,
                CreatedAt = c.CreatedAt
            });
        }

        return new PagedResult<CommentDto>
        {
            Items = dtos,
            TotalCount = allComments.Count,
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }

    public async Task SoftDeletePostAsync(Guid userId, Guid postId, bool isAdmin)
    {
        var post = await _postRepository.GetByIdAsync(postId.ToString());
        if (post == null) throw new KeyNotFoundException("Bài viết không tồn tại.");
        if (!isAdmin && post.UserId != userId.ToString()) throw new UnauthorizedAccessException();
        
        post.IsDeleted = true;
        await _postRepository.UpdateAsync(post.Id, post);
    }

    public async Task SoftDeleteCommentAsync(Guid userId, Guid commentId, bool isAdmin)
    {
        var comment = await _postCommentRepository.GetByIdAsync(commentId.ToString());
        if (comment == null) throw new KeyNotFoundException("Bình luận không tồn tại.");
        if (!isAdmin && comment.UserId != userId.ToString()) throw new UnauthorizedAccessException();

        comment.IsDeleted = true;
        await _postCommentRepository.UpdateAsync(comment.Id, comment);
        
        var post = await _postRepository.GetByIdAsync(comment.PostId);
        if (post != null) {
            post.CommentCount = Math.Max(0, post.CommentCount - 1);
            await _postRepository.UpdateAsync(post.Id, post);
        }
    }

    public async Task ReportPostAsync(Guid userId, Guid postId, string reason)
    {
        var post = await _postRepository.GetByIdAsync(postId.ToString());
        if (post == null || post.IsDeleted) throw new KeyNotFoundException("Bài viết không tồn tại.");

        var report = new PostReport
        {
            Id = Guid.NewGuid().ToString(),
            PostId = postId.ToString(),
            TargetId = postId.ToString(),
            TargetType = 1, // 1: Post
            ReporterId = userId.ToString(),
            Reason = reason,
            Status = 1,
            CreatedAt = DateTime.Now
        };
        await _postReportRepository.CreateAsync(report);
    }

    public async Task ReportCommentAsync(Guid userId, Guid commentId, string reason)
    {
        var comment = await _postCommentRepository.GetByIdAsync(commentId.ToString());
        if (comment == null || comment.IsDeleted) throw new KeyNotFoundException("Bình luận không tồn tại.");

        var report = new PostReport
        {
            Id = Guid.NewGuid().ToString(),
            PostId = comment.PostId,
            TargetId = commentId.ToString(),
            TargetType = 2, // 2: Comment
            ReporterId = userId.ToString(),
            Reason = reason,
            Status = 1,
            CreatedAt = DateTime.Now
        };
        await _postReportRepository.CreateAsync(report);
    }

    public async Task<PagedResult<PostDto>> GetPendingPostsAsync(PaginationParams pagination)
    {
        var filter = Builders<Post>.Filter.Eq(p => p.Status, 1);
        var items = await _postRepository.FindAsync(filter);
        var paged = items.OrderByDescending(p => p.CreatedAt)
                         .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                         .Take(pagination.PageSize)
                         .ToList();

        var dtos = new List<PostDto>();
        foreach (var p in paged) dtos.Add(await MapToDto(p, null));

        return new PagedResult<PostDto>
        {
            Items = dtos,
            TotalCount = items.Count,
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }

    public async Task ApprovePostAsync(Guid postId)
    {
        var post = await _postRepository.GetByIdAsync(postId.ToString());
        if (post == null) throw new KeyNotFoundException("Bài viết không tồn tại.");
        post.Status = 2;
        await _postRepository.UpdateAsync(post.Id, post);
    }

    public async Task RejectPostAsync(Guid postId)
    {
        var post = await _postRepository.GetByIdAsync(postId.ToString());
        if (post == null) throw new KeyNotFoundException("Bài viết không tồn tại.");
        post.Status = 3;
        await _postRepository.UpdateAsync(post.Id, post);
    }

    public async Task<object> GetPendingReportsAsync(PaginationParams pagination)
    {
        var filter = Builders<PostReport>.Filter.Eq(r => r.Status, 1); // Pending
        var reports = await _postReportRepository.FindAsync(filter);
        var paged = reports.OrderByDescending(r => r.CreatedAt)
                           .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                           .Take(pagination.PageSize)
                           .ToList();

        return new
        {
            Items = paged,
            TotalCount = reports.Count(),
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }

    public async Task ResolveReportAsync(string reportId, Guid adminId, string action)
    {
        var report = await _postReportRepository.GetByIdAsync(reportId);
        if (report == null) throw new KeyNotFoundException("Báo cáo không tồn tại.");

        report.Status = 2; // Resolved
        await _postReportRepository.UpdateAsync(reportId, report);

        if (action == "delete_post" || action == "delete_comment")
        {
            if (report.TargetType == 1) 
            {
                var post = await _postRepository.GetByIdAsync(report.TargetId);
                if (post != null) {
                    post.IsDeleted = true;
                    await _postRepository.UpdateAsync(post.Id, post);
                }
            } 
            else if (report.TargetType == 2)
            {
                var comment = await _postCommentRepository.GetByIdAsync(report.TargetId);
                if (comment != null) {
                    comment.IsDeleted = true;
                    await _postCommentRepository.UpdateAsync(comment.Id, comment);
                }
            }
        }
    }

    public async Task DismissReportAsync(string reportId, Guid adminId)
    {
        var report = await _postReportRepository.GetByIdAsync(reportId);
        if (report == null) throw new KeyNotFoundException("Báo cáo không tồn tại.");

        report.Status = 3; // Dismissed
        await _postReportRepository.UpdateAsync(reportId, report);
    }
    
    public async Task<PagedResult<PostDto>> GetPostsAsync(PaginationParams pagination, Guid? currentUserId = null)
    {
        var filter = Builders<Post>.Filter.And(
            Builders<Post>.Filter.Eq(p => p.IsDeleted, false),
            Builders<Post>.Filter.Eq(p => p.Status, 2)
        );

        if (currentUserId.HasValue)
        {
            var blockedIds = await _unitOfWork.Context.UserBlocks
                .Where(b => b.BlockerId == currentUserId.Value || b.BlockedId == currentUserId.Value)
                .Select(b => b.BlockerId == currentUserId.Value ? b.BlockedId : b.BlockerId)
                .ToListAsync();

            var blockedIdsStrings = blockedIds.Select(id => id.ToString()).ToList();
            if (blockedIdsStrings.Any())
            {
                filter = Builders<Post>.Filter.And(filter, Builders<Post>.Filter.Nin(p => p.UserId, blockedIdsStrings));
            }
        }

        var allPosts = await _postRepository.FindAsync(filter);
        var paged = allPosts.OrderByDescending(p => p.CreatedAt)
                            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                            .Take(pagination.PageSize)
                            .ToList();

        var dtos = new List<PostDto>();
        foreach (var p in paged) dtos.Add(await MapToDto(p, currentUserId));

        return new PagedResult<PostDto>
        {
            Items = dtos,
            TotalCount = allPosts.Count,
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }

    public async Task<PagedResult<PostDto>> GetPostsByFacilityAsync(int facilityId, PaginationParams pagination, Guid? currentUserId = null)
    {
        var filter = Builders<Post>.Filter.And(
            Builders<Post>.Filter.Eq(p => p.FacilityId, facilityId),
            Builders<Post>.Filter.Eq(p => p.IsDeleted, false),
            Builders<Post>.Filter.Eq(p => p.Status, 2)
        );

        if (currentUserId.HasValue)
        {
            var blockedIds = await _unitOfWork.Context.UserBlocks
                .Where(b => b.BlockerId == currentUserId.Value || b.BlockedId == currentUserId.Value)
                .Select(b => b.BlockerId == currentUserId.Value ? b.BlockedId : b.BlockerId)
                .ToListAsync();

            var blockedIdsStrings = blockedIds.Select(id => id.ToString()).ToList();
            if (blockedIdsStrings.Any())
            {
                filter = Builders<Post>.Filter.And(filter, Builders<Post>.Filter.Nin(p => p.UserId, blockedIdsStrings));
            }
        }

        var allPosts = await _postRepository.FindAsync(filter);
        var paged = allPosts.OrderByDescending(p => p.CreatedAt)
                            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                            .Take(pagination.PageSize)
                            .ToList();

        var dtos = new List<PostDto>();
        foreach (var p in paged) dtos.Add(await MapToDto(p, currentUserId));

        return new PagedResult<PostDto>
        {
            Items = dtos,
            TotalCount = allPosts.Count,
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }

    public async Task<PagedResult<PostDto>> GetPostsByTeamAsync(Guid teamId, PaginationParams pagination, Guid? currentUserId = null)
    {
        var filter = Builders<Post>.Filter.And(
            Builders<Post>.Filter.Eq(p => p.TeamId, teamId),
            Builders<Post>.Filter.Eq(p => p.IsDeleted, false),
            Builders<Post>.Filter.Eq(p => p.Status, 2)
        );

        if (currentUserId.HasValue)
        {
            var blockedIds = await _unitOfWork.Context.UserBlocks
                .Where(b => b.BlockerId == currentUserId.Value || b.BlockedId == currentUserId.Value)
                .Select(b => b.BlockerId == currentUserId.Value ? b.BlockedId : b.BlockerId)
                .ToListAsync();

            var blockedIdsStrings = blockedIds.Select(id => id.ToString()).ToList();
            if (blockedIdsStrings.Any())
            {
                filter = Builders<Post>.Filter.And(filter, Builders<Post>.Filter.Nin(p => p.UserId, blockedIdsStrings));
            }
        }

        var allPosts = await _postRepository.FindAsync(filter);
        var paged = allPosts.OrderByDescending(p => p.CreatedAt)
                            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                            .Take(pagination.PageSize)
                            .ToList();

        var dtos = new List<PostDto>();
        foreach (var p in paged) dtos.Add(await MapToDto(p, currentUserId));

        return new PagedResult<PostDto>
        {
            Items = dtos,
            TotalCount = allPosts.Count,
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }

    private async Task<PostDto> MapToDto(Post p, Guid? currentUserId = null)
    {
        var author = await _unitOfWork.Users.GetByIdAsync(Guid.Parse(p.UserId));
        
        bool isLiked = false;
        if (currentUserId.HasValue) {
            var likeFilter = Builders<PostLike>.Filter.And(
                Builders<PostLike>.Filter.Eq(l => l.PostId, p.Id),
                Builders<PostLike>.Filter.Eq(l => l.UserId, currentUserId.Value.ToString())
            );
            var existingLike = await _postLikeRepository.FindAsync(likeFilter);
            isLiked = existingLike.Any();
        }

        return new PostDto
        {
            PostId = Guid.TryParse(p.Id, out var parsedId) ? parsedId : Guid.Empty,
            AuthorUserId = Guid.Parse(p.UserId),
            AuthorName = author?.FullName ?? "Unknown",
            AuthorAvatarId = author?.AvatarFileId,
            PostType = p.PostType,
            TeamId = p.TeamId,
            FacilityId = p.FacilityId,
            Content = p.Content,
            MediaFileIds = p.MediaFileIds,
            CreatedAt = p.CreatedAt,
            LikeCount = p.LikeCount,
            CommentCount = p.CommentCount,
            IsLikedByCurrentUser = isLiked
        };
    }
}
