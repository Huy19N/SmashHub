import 'package:flutter/material.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/network/api_client.dart';
import '../../../../shared/widgets/app_card.dart';
import '../../data/data_sources/social_remote_data_source.dart';
import '../../data/repositories/social_repository_impl.dart';
import '../../data/models/post_model.dart';
import 'create_post_screen.dart';

class CommunityFeedScreen extends StatefulWidget {
  const CommunityFeedScreen({super.key});

  @override
  State<CommunityFeedScreen> createState() => _CommunityFeedScreenState();
}

class _CommunityFeedScreenState extends State<CommunityFeedScreen> {
  late final SocialRepositoryImpl _repository;
  List<PostModel> _posts = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _repository = SocialRepositoryImpl(SocialRemoteDataSource(ApiClient()));
    _loadPosts();
  }

  Future<void> _loadPosts() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final response = await _repository.getPosts(limit: 50);

    if (mounted) {
      setState(() {
        _isLoading = false;
        if (response.success && response.data != null) {
          _posts = response.data!;
        } else {
          _errorMessage = response.message;
        }
      });
    }
  }

  Future<void> _toggleLike(int index) async {
    final post = _posts[index];
    final isLiked = post.isLikedByCurrentUser;

    // Optimistic update
    setState(() {
      _posts[index] = post.copyWith(
        isLikedByCurrentUser: !isLiked,
        likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1,
      );
    });

    final response = isLiked ? await _repository.unlikePost(post.postId) : await _repository.likePost(post.postId);

    if (!response.success && mounted) {
      // Revert if failed
      setState(() {
        _posts[index] = post;
      });
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Lỗi kết nối')));
    }
  }

  String _formatTimeAgo(DateTime? date) {
    if (date == null) return 'Vừa xong';
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 1) return 'Vừa xong';
    if (diff.inMinutes < 60) return '${diff.inMinutes} phút trước';
    if (diff.inHours < 24) return '${diff.inHours} giờ trước';
    return '${diff.inDays} ngày trước';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBackgroundColor : AppTheme.lightBackgroundColor,
      appBar: AppBar(
        title: const Text('Cộng đồng'),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const CreatePostScreen()),
          );
          if (result == true) {
            _loadPosts();
          }
        },
        backgroundColor: AppTheme.primaryColor,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(child: Text(_errorMessage!, style: const TextStyle(color: Colors.red)))
              : RefreshIndicator(
                  onRefresh: _loadPosts,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _posts.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 16),
                    itemBuilder: (context, index) {
                      final post = _posts[index];
                      return AppCard(
                        padding: const EdgeInsets.all(16),
                        borderRadius: 16,
                        backgroundColor: isDark ? AppTheme.darkSurfaceColor : Colors.white,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                CircleAvatar(
                                  radius: 20,
                                  backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.2),
                                  child: Text(
                                    post.authorName.isNotEmpty ? post.authorName[0] : 'U',
                                    style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold),
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
                                      Text(
                                        _formatTimeAgo(post.createdAt),
                                        style: TextStyle(color: Colors.grey[500], fontSize: 12),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              post.content,
                              style: TextStyle(fontSize: 14, height: 1.4, color: isDark ? Colors.grey[300] : Colors.black87),
                            ),
                            const SizedBox(height: 16),
                            const Divider(height: 1),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Expanded(
                                  child: InkWell(
                                    onTap: () => _toggleLike(index),
                                    child: Padding(
                                      padding: const EdgeInsets.symmetric(vertical: 8),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Icon(
                                            post.isLikedByCurrentUser ? Icons.thumb_up : Icons.thumb_up_outlined,
                                            size: 20,
                                            color: post.isLikedByCurrentUser ? AppTheme.primaryColor : Colors.grey,
                                          ),
                                          const SizedBox(width: 6),
                                          Text('${post.likeCount} Thích'),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                                Expanded(
                                  child: InkWell(
                                    onTap: () {
                                      // TODO: Go to comment screen
                                    },
                                    child: Padding(
                                      padding: const EdgeInsets.symmetric(vertical: 8),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          const Icon(Icons.comment_outlined, size: 20, color: Colors.grey),
                                          const SizedBox(width: 6),
                                          Text('${post.commentCount} Bình luận'),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
