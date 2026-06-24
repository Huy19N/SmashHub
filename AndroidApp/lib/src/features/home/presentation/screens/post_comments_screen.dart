import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/widgets/app_card.dart';
import '../../../../shared/network/api_client.dart';
import '../../../../shared/network/api_config.dart';
import '../../data/models/home_models.dart';

class PostCommentsScreen extends StatefulWidget {
  final CommunityPost post;

  const PostCommentsScreen({
    super.key,
    required this.post,
  });

  @override
  State<PostCommentsScreen> createState() => _PostCommentsScreenState();
}

class _PostCommentsScreenState extends State<PostCommentsScreen> {
  final ApiClient _apiClient = ApiClient();
  final TextEditingController _commentController = TextEditingController();

  List<dynamic> _comments = [];
  bool _isLoading = true;
  String? _errorMessage;
  bool _isLiked = false;
  int _likeCount = 0;

  @override
  void initState() {
    super.initState();
    _isLiked = widget.post.isLiked;
    _likeCount = widget.post.likeCount;
    _fetchComments();
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _fetchComments() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final res = await _apiClient.get('/api/social/posts/${widget.post.id}/comments');
      if (mounted) {
        if (res.data['success'] == true) {
          setState(() {
            _comments = res.data['data']['items'] as List<dynamic>? ?? [];
            _isLoading = false;
          });
        } else {
          setState(() {
            _errorMessage = res.data['message'] ?? 'Lỗi tải danh sách bình luận.';
            _isLoading = false;
          });
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Lỗi kết nối máy chủ.';
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _toggleLike() async {
    final originalState = _isLiked;
    final originalCount = _likeCount;

    setState(() {
      _isLiked = !_isLiked;
      _likeCount = _isLiked ? _likeCount + 1 : _likeCount - 1;
    });

    try {
      if (originalState) {
        // Unlike post
        await _apiClient.delete('/api/social/posts/${widget.post.id}/like');
      } else {
        // Like post
        await _apiClient.post('/api/social/posts/${widget.post.id}/like');
      }
    } catch (_) {
      // Revert if API call fails
      if (mounted) {
        setState(() {
          _isLiked = originalState;
          _likeCount = originalCount;
        });
      }
    }
  }

  Future<void> _submitComment() async {
    final text = _commentController.text.trim();
    if (text.isEmpty) return;

    _commentController.clear();
    FocusScope.of(context).unfocus();

    setState(() {
      _isLoading = true;
    });

    try {
      final res = await _apiClient.post(
        '/api/social/posts/${widget.post.id}/comments',
        data: {'content': text},
      );
      if (mounted) {
        if (res.data['success'] == true) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Bình luận thành công!'),
              backgroundColor: AppTheme.primaryColor,
            ),
          );
          _fetchComments();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(res.data['message'] ?? 'Gửi bình luận thất bại.'),
              backgroundColor: Colors.red,
            ),
          );
          setState(() {
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Lỗi kết nối khi gửi bình luận.'), backgroundColor: Colors.red),
        );
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  String _formatDateTime(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final dt = DateTime.parse(dateStr).toLocal();
      return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')} - ${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
    } catch (_) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return PopScope(
      canPop: true,
      onPopInvokedWithResult: (didPop, result) {
        // Return updated like status and count to the calling screen
        if (didPop) {
          // Note: Flutter PopScope callbacks don't return values directly, but we can do it via custom pop
        }
      },
      child: Scaffold(
        backgroundColor: isDark ? AppTheme.darkBackgroundColor : AppTheme.lightBackgroundColor,
        appBar: AppBar(
          title: const Text(
            'BÀI VIẾT & BÌNH LUẬN',
            style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 0.5),
          ),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded),
            onPressed: () {
              Navigator.pop(context, {
                'isLiked': _isLiked,
                'likeCount': _likeCount,
                'commentCount': _comments.length,
              });
            },
          ),
        ),
        body: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Post card
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: AppCard(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(20),
                                  child: CachedNetworkImage(
                                    imageUrl: widget.post.userAvatarUrl,
                                    width: 40,
                                    height: 40,
                                    fit: BoxFit.cover,
                                    errorWidget: (context, url, error) => Container(
                                      width: 40,
                                      height: 40,
                                      color: Colors.grey[800],
                                      child: const Icon(Icons.person_rounded, color: Colors.grey),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        widget.post.userName,
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        widget.post.timeAgo,
                                        style: const TextStyle(color: Colors.grey, fontSize: 11),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 14),
                            Text(widget.post.content, style: const TextStyle(fontSize: 14, height: 1.4)),
                            if (widget.post.featuredImageUrl != null) ...[
                              const SizedBox(height: 14),
                              ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: CachedNetworkImage(
                                  imageUrl: widget.post.featuredImageUrl!,
                                  height: 180,
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                ),
                              ),
                            ],
                            const SizedBox(height: 16),
                            const Divider(height: 1),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                InkWell(
                                  onTap: _toggleLike,
                                  borderRadius: BorderRadius.circular(12),
                                  child: Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                    child: Row(
                                      children: [
                                        Icon(
                                          _isLiked ? Icons.favorite : Icons.favorite_border_rounded,
                                          color: _isLiked ? Colors.redAccent : Colors.grey,
                                          size: 20,
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          '$_likeCount thích',
                                          style: const TextStyle(color: Colors.grey, fontSize: 13),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Row(
                                  children: [
                                    const Icon(Icons.chat_bubble_outline_rounded, color: Colors.grey, size: 20),
                                    const SizedBox(width: 6),
                                    Text(
                                      '${_comments.length} bình luận',
                                      style: const TextStyle(color: Colors.grey, fontSize: 13),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Text(
                        'BÌNH LUẬN',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.grey, letterSpacing: 0.5),
                      ),
                    ),
                    const Divider(height: 1),

                    // Comments list
                    _isLoading && _comments.isEmpty
                        ? const Center(
                            child: Padding(
                              padding: EdgeInsets.all(24.0),
                              child: CircularProgressIndicator(),
                            ),
                          )
                        : _comments.isEmpty
                            ? const Center(
                                child: Padding(
                                  padding: EdgeInsets.all(32.0),
                                  child: Text(
                                    'Chưa có bình luận nào. Hãy bắt đầu cuộc trò chuyện!',
                                    style: TextStyle(color: Colors.grey, fontSize: 13),
                                  ),
                                ),
                              )
                            : ListView.separated(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                itemCount: _comments.length,
                                separatorBuilder: (_, __) => const Divider(height: 1, indent: 64),
                                itemBuilder: (context, index) {
                                  final comment = _comments[index];
                                  final authorName = comment['userName'] as String? ?? 'Thành viên';
                                  final content = comment['content'] as String? ?? '';
                                  final avatarFileId = comment['userAvatarId'] as String?;
                                  final dateStr = _formatDateTime(comment['createdAt'] as String?);

                                  return Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                    child: Row(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        ClipRRect(
                                          borderRadius: BorderRadius.circular(16),
                                          child: avatarFileId != null && avatarFileId.isNotEmpty
                                              ? CachedNetworkImage(
                                                  imageUrl: ApiConfig.getFileUrl(avatarFileId),
                                                  width: 32,
                                                  height: 32,
                                                  fit: BoxFit.cover,
                                                  errorWidget: (context, url, error) => Container(
                                                    width: 32,
                                                    height: 32,
                                                    color: Colors.grey[800],
                                                    child: const Icon(Icons.person_rounded, size: 16, color: Colors.grey),
                                                  ),
                                                )
                                              : Container(
                                                  width: 32,
                                                  height: 32,
                                                  color: AppTheme.primaryColor.withOpacity(0.2),
                                                  alignment: Alignment.center,
                                                  child: Text(
                                                    authorName.isNotEmpty ? authorName[0].toUpperCase() : 'U',
                                                    style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                                                  ),
                                                ),
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Row(
                                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                children: [
                                                  Text(
                                                    authorName,
                                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                                  ),
                                                  Text(
                                                    dateStr,
                                                    style: const TextStyle(fontSize: 10, color: Colors.grey),
                                                  ),
                                                ],
                                              ),
                                              const SizedBox(height: 4),
                                              Text(content, style: const TextStyle(fontSize: 13, height: 1.3)),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              ),
                  ],
                ),
              ),
            ),
            const Divider(height: 1),

            // Write comment bar
            Container(
              padding: EdgeInsets.only(
                left: 16,
                right: 8,
                top: 8,
                bottom: 8 + MediaQuery.of(context).viewInsets.bottom,
              ),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkSurfaceColor : Colors.white,
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey[100],
                        borderRadius: BorderRadius.circular(24),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: TextField(
                        controller: _commentController,
                        style: const TextStyle(fontSize: 14),
                        decoration: const InputDecoration(
                          hintText: 'Viết bình luận...',
                          hintStyle: TextStyle(color: Colors.grey, fontSize: 13),
                          border: InputBorder.none,
                          enabledBorder: InputBorder.none,
                          focusedBorder: InputBorder.none,
                          filled: false,
                          contentPadding: EdgeInsets.symmetric(vertical: 10),
                        ),
                        maxLines: null,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: const Icon(Icons.send_rounded, color: AppTheme.primaryColor),
                    onPressed: _submitComment,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
