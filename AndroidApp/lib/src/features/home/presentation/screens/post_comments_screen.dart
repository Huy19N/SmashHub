import 'package:flutter/material.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/widgets/app_media_image.dart';
import '../../../../shared/network/api_client.dart';
import '../../../social/data/models/post_model.dart';

class PostCommentsScreen extends StatefulWidget {
  final PostModel post;

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
  final FocusNode _commentFocusNode = FocusNode();

  List<dynamic> _comments = [];
  bool _isLoading = true;
  String? _errorMessage;
  bool _isLiked = false;
  int _likeCount = 0;

  @override
  void initState() {
    super.initState();
    _isLiked = widget.post.isLikedByCurrentUser;
    _likeCount = widget.post.likeCount;
    _fetchComments();
  }

  @override
  void dispose() {
    _commentController.dispose();
    _commentFocusNode.dispose();
    super.dispose();
  }

  Future<void> _fetchComments() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final res = await _apiClient.get('/api/social/posts/${widget.post.postId}/comments');
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
        await _apiClient.delete('/api/social/posts/${widget.post.postId}/like');
      } else {
        await _apiClient.post('/api/social/posts/${widget.post.postId}/like');
      }
    } catch (_) {
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
        '/api/social/posts/${widget.post.postId}/comments',
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

  String _formatTimeAgo(DateTime? date) {
    if (date == null) return 'Vừa xong';
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 1) return 'Vừa xong';
    if (diff.inMinutes < 60) return '${diff.inMinutes} phút trước';
    if (diff.inHours < 24) return '${diff.inHours} giờ trước';
    if (diff.inDays < 30) return '${diff.inDays} ngày trước';
    return '${diff.inDays ~/ 30} tháng trước';
  }

  void _handleMenuAction(String action) {
    if (action == 'block') {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đã chặn người dùng này')));
    } else if (action == 'report') {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đã báo cáo bài viết')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final post = widget.post;
    
    // Determine the images to display
    final List<String> images = post.mediaFileIds.isNotEmpty 
        ? post.mediaFileIds 
        : (post.mediaFileId != null && post.mediaFileId!.isNotEmpty ? [post.mediaFileId!] : []);

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBackgroundColor : AppTheme.lightBackgroundColor,
      appBar: AppBar(
        title: Text(
          'Bài viết của ${post.authorName}',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
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
                  // Header
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(24),
                          child: post.authorAvatarId != null && post.authorAvatarId!.isNotEmpty
                              ? AppMediaImage(
                                  fileId: post.authorAvatarId!,
                                  width: 44,
                                  height: 44,
                                  fit: BoxFit.cover,
                                )
                              : Container(
                                  width: 44,
                                  height: 44,
                                  color: AppTheme.primaryColor.withValues(alpha: 0.2),
                                  alignment: Alignment.center,
                                  child: Text(
                                    post.authorName.isNotEmpty ? post.authorName[0] : 'U',
                                    style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, fontSize: 18),
                                  ),
                                ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                post.authorName,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                _formatTimeAgo(post.createdAt),
                                style: TextStyle(color: Colors.grey[500], fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                        PopupMenuButton<String>(
                          icon: const Icon(Icons.more_horiz),
                          onSelected: _handleMenuAction,
                          itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
                            const PopupMenuItem<String>(
                              value: 'block',
                              child: Text('Chặn người đăng'),
                            ),
                            const PopupMenuItem<String>(
                              value: 'report',
                              child: Text('Báo cáo bài đăng'),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Content
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    child: Text(post.content, style: const TextStyle(fontSize: 15, height: 1.4)),
                  ),
                  
                  const SizedBox(height: 8),

                  // Images
                  if (images.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    ...images.map((imageId) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: AppMediaImage(
                          fileId: imageId,
                          width: double.infinity,
                          fit: BoxFit.contain,
                        ),
                      );
                    }),
                    const SizedBox(height: 8),
                  ],

                  // Stats (Likes, Comments counts)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.thumb_up_alt_rounded, color: AppTheme.primaryColor, size: 16),
                            const SizedBox(width: 6),
                            Text('$_likeCount', style: const TextStyle(color: Colors.grey, fontSize: 13)),
                          ],
                        ),
                        Text('${_comments.length} bình luận', style: const TextStyle(color: Colors.grey, fontSize: 13)),
                      ],
                    ),
                  ),
                  const Divider(height: 1),

                  // Action Buttons
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _buildActionButton(
                          icon: _isLiked ? Icons.thumb_up_rounded : Icons.thumb_up_outlined,
                          label: 'Thích',
                          color: _isLiked ? AppTheme.primaryColor : Colors.grey,
                          onTap: _toggleLike,
                        ),
                        _buildActionButton(
                          icon: Icons.chat_bubble_outline_rounded,
                          label: 'Bình luận',
                          color: Colors.grey,
                          onTap: () {
                            _commentFocusNode.requestFocus();
                          },
                        ),
                        _buildActionButton(
                          icon: Icons.share_rounded,
                          label: 'Chia sẻ',
                          color: Colors.grey,
                          onTap: () {},
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 1, thickness: 4),

                  // Comments section
                  _isLoading && _comments.isEmpty
                      ? const Padding(
                          padding: EdgeInsets.all(24.0),
                          child: Center(child: CircularProgressIndicator()),
                        )
                      : _comments.isEmpty
                          ? const Padding(
                              padding: EdgeInsets.all(32.0),
                              child: Center(
                                child: Text(
                                  'Chưa có bình luận nào. Hãy là người đầu tiên!',
                                  style: TextStyle(color: Colors.grey, fontSize: 13),
                                ),
                              ),
                            )
                          : ListView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: _comments.length,
                              itemBuilder: (context, index) {
                                final comment = _comments[index];
                                final authorName = comment['userName'] as String? ?? 'Thành viên';
                                final content = comment['content'] as String? ?? '';
                                final avatarFileId = comment['userAvatarId'] as String?;
                                final dateStr = _formatTimeAgo(comment['createdAt'] != null ? DateTime.tryParse(comment['createdAt']) : null);

                                return Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      ClipRRect(
                                        borderRadius: BorderRadius.circular(16),
                                        child: avatarFileId != null && avatarFileId.isNotEmpty
                                            ? AppMediaImage(
                                                fileId: avatarFileId,
                                                width: 36,
                                                height: 36,
                                                fit: BoxFit.cover,
                                              )
                                            : Container(
                                                width: 36,
                                                height: 36,
                                                color: AppTheme.primaryColor.withValues(alpha: 0.2),
                                                alignment: Alignment.center,
                                                child: Text(
                                                  authorName.isNotEmpty ? authorName[0].toUpperCase() : 'U',
                                                  style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                                                ),
                                              ),
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                              decoration: BoxDecoration(
                                                color: isDark ? Colors.grey[800] : Colors.grey[200],
                                                borderRadius: BorderRadius.circular(16),
                                              ),
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    authorName,
                                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                                  ),
                                                  const SizedBox(height: 2),
                                                  Text(content, style: const TextStyle(fontSize: 14)),
                                                ],
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Padding(
                                              padding: const EdgeInsets.only(left: 8),
                                              child: Text(
                                                dateStr,
                                                style: const TextStyle(fontSize: 11, color: Colors.grey),
                                              ),
                                            ),
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
              bottom: 8 + MediaQuery.of(context).padding.bottom,
            ),
            decoration: BoxDecoration(
              color: isDark ? AppTheme.darkSurfaceColor : Colors.white,
            ),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white.withValues(alpha: 0.05) : Colors.grey[200],
                      borderRadius: BorderRadius.circular(24),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: TextField(
                      controller: _commentController,
                      focusNode: _commentFocusNode,
                      style: const TextStyle(fontSize: 14),
                      decoration: const InputDecoration(
                        hintText: 'Viết bình luận công khai...',
                        hintStyle: TextStyle(color: Colors.grey, fontSize: 14),
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
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: color,
                fontSize: 13,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
