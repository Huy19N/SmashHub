import 'package:flutter/material.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/network/api_client.dart';
import '../../../../shared/network/api_config.dart';
import '../../../../shared/widgets/app_card.dart';
import '../../../../shared/widgets/app_media_image.dart';
import '../../../auth/data/data_sources/profile_remote_data_source.dart';
import '../../../auth/data/repositories/profile_repository_impl.dart';
import '../../../auth/presentation/controllers/profile_controller.dart';
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
  late final ProfileController _profileController;

  List<PostModel> _posts = [];
  bool _isLoading = true;
  bool _isProfileLoading = true;
  String? _errorMessage;

  // Filtering state
  int? _selectedFilterType; // null = Tất cả, 3 = Thảo luận, 2 = Tìm đối thủ, 1 = Quảng cáo sân
  final Set<String> _expandedPostIds = {};

  @override
  void initState() {
    super.initState();
    final apiClient = ApiClient();
    _repository = SocialRepositoryImpl(SocialRemoteDataSource(apiClient));

    final profileRemoteDataSource = ProfileRemoteDataSource(apiClient);
    final profileRepository = ProfileRepositoryImpl(profileRemoteDataSource);
    _profileController = ProfileController(profileRepository: profileRepository);

    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _isProfileLoading = true;
      _errorMessage = null;
    });

    try {
      await Future.wait([
        _loadPosts(),
        _profileController.fetchProfileData(),
      ]);
    } catch (_) {
      // Handled in individual loading functions
    } finally {
      if (mounted) {
        setState(() {
          _isProfileLoading = false;
        });
      }
    }
  }

  Future<void> _loadPosts() async {
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

    setState(() {
      _posts[index] = post.copyWith(
        isLikedByCurrentUser: !isLiked,
        likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1,
      );
    });

    final response = isLiked ? await _repository.unlikePost(post.postId) : await _repository.likePost(post.postId);

    if (!response.success && mounted) {
      setState(() {
        _posts[index] = post;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lỗi kết nối máy chủ')),
      );
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

  List<PostModel> get _filteredPosts {
    if (_selectedFilterType == null) return _posts;
    return _posts.where((p) => p.postType == _selectedFilterType).toList();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBackgroundColor : AppTheme.lightBackgroundColor,
      appBar: AppBar(
        title: const Text('Cộng đồng', style: TextStyle(fontWeight: FontWeight.w900)),
        centerTitle: true,
        backgroundColor: isDark ? AppTheme.darkSurfaceColor : Colors.white,
        elevation: 0.5,
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
        child: const Icon(Icons.add, color: Colors.black),
      ),
      body: _isLoading || _isProfileLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadPosts,
              child: Column(
                children: [
                  // Topic filter bar
                  _buildFilterBar(isDark),
                  Expanded(
                    child: _errorMessage != null
                        ? _buildErrorWidget()
                        : _filteredPosts.isEmpty
                            ? _buildEmptyWidget()
                            : ListView.builder(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                itemCount: _filteredPosts.length + 1,
                                itemBuilder: (context, index) {
                                  if (index == 0) {
                                    return _buildWhatsOnYourMindWidget(isDark);
                                  }
                                  final post = _filteredPosts[index - 1];
                                  return _buildPostCard(post, isDark);
                                },
                              ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildFilterBar(bool isDark) {
    final filters = [
      {'label': 'Tất cả', 'value': null, 'icon': Icons.public_rounded},
      {'label': 'Thảo luận', 'value': 3, 'icon': Icons.forum_rounded},
      {'label': 'Tìm đối thủ', 'value': 2, 'icon': Icons.sports_tennis_rounded},
      {'label': 'Quảng cáo sân', 'value': 1, 'icon': Icons.campaign_rounded},
    ];

    return Container(
      height: 56,
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkSurfaceColor : Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: filters.length,
        itemBuilder: (context, index) {
          final filter = filters[index];
          final isSelected = _selectedFilterType == filter['value'];
          final color = _getTopicColor(filter['value'] as int? ?? 3);

          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              avatar: Icon(
                filter['icon'] as IconData,
                size: 16,
                color: isSelected ? Colors.black : (isDark ? Colors.white70 : Colors.black87),
              ),
              label: Text(
                filter['label'] as String,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                  color: isSelected ? Colors.black : (isDark ? Colors.white70 : Colors.black87),
                ),
              ),
              selected: isSelected,
              onSelected: (selected) {
                setState(() {
                  _selectedFilterType = filter['value'] as int?;
                });
              },
              selectedColor: isSelected ? color : Colors.transparent,
              backgroundColor: isDark ? Colors.grey[900] : Colors.grey[100],
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(
                  color: isSelected ? color : (isDark ? Colors.grey[800]! : Colors.grey[300]!),
                ),
              ),
              showCheckmark: false,
            ),
          );
        },
      ),
    );
  }

  Widget _buildWhatsOnYourMindWidget(bool isDark) {
    final user = _profileController.userProfile;
    return AppCard(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      borderRadius: 16,
      backgroundColor: isDark ? AppTheme.darkSurfaceColor : Colors.white,
      child: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.2),
            backgroundImage: user?.avatarFileId != null && user!.avatarFileId!.isNotEmpty
                ? NetworkImage(ApiClient().dio.options.baseUrl + ApiConfig.getFileUrl(user.avatarFileId!))
                : null,
            child: user?.avatarFileId == null || user!.avatarFileId!.isEmpty
                ? Text(
                    user?.fullName.isNotEmpty == true ? user!.fullName[0].toUpperCase() : 'U',
                    style: const TextStyle(
                      color: AppTheme.primaryColor,
                      fontWeight: FontWeight.bold,
                    ),
                  )
                : null,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: GestureDetector(
              onTap: () async {
                final result = await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const CreatePostScreen()),
                );
                if (result == true) {
                  _loadPosts();
                }
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: isDark ? Colors.grey[900] : Colors.grey[100],
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: isDark ? Colors.grey[800]! : Colors.grey[300]!),
                ),
                child: Text(
                  'Bạn đang nghĩ gì thế...',
                  style: TextStyle(
                    color: isDark ? Colors.grey[400] : Colors.grey[600],
                    fontSize: 14,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPostCard(PostModel post, bool isDark) {
    final isExpanded = _expandedPostIds.contains(post.postId);
    final hasImages = post.mediaFileIds.isNotEmpty;

    return AppCard(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      borderRadius: 16,
      backgroundColor: isDark ? AppTheme.darkSurfaceColor : Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: User details and Topic Badge
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.2),
                backgroundImage: post.authorAvatarId != null && post.authorAvatarId!.isNotEmpty
                    ? NetworkImage(ApiClient().dio.options.baseUrl + ApiConfig.getFileUrl(post.authorAvatarId!))
                    : null,
                child: post.authorAvatarId == null || post.authorAvatarId!.isEmpty
                    ? Text(
                        post.authorName.isNotEmpty ? post.authorName[0].toUpperCase() : 'U',
                        style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold),
                      )
                    : null,
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
                      style: TextStyle(color: Colors.grey[500], fontSize: 11),
                    ),
                  ],
                ),
              ),
              // Topic badge
              _buildTopicBadge(post.postType),
            ],
          ),
          const SizedBox(height: 14),

          // Content body
          LayoutBuilder(
            builder: (context, constraints) {
              final text = post.content;
              const maxLinesToShow = 4;
              final isTooLong = text.length > 150; // Simple threshold check

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    text,
                    maxLines: isExpanded ? null : maxLinesToShow,
                    overflow: isExpanded ? TextOverflow.visible : TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 14,
                      height: 1.4,
                      color: isDark ? Colors.grey[200] : Colors.black87,
                    ),
                  ),
                  if (isTooLong && !isExpanded)
                    GestureDetector(
                      onTap: () {
                        setState(() {
                          _expandedPostIds.add(post.postId);
                        });
                      },
                      child: Padding(
                        padding: const EdgeInsets.only(top: 6),
                        child: Text(
                          'Xem thêm',
                          style: TextStyle(
                            color: _getTopicColor(post.postType),
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
          const SizedBox(height: 14),

          // Images Section: PageView Carousel with dots for multiple images
          if (hasImages) _buildPostImages(post.mediaFileIds, isDark),

          const SizedBox(height: 12),
          const Divider(height: 1),
          const SizedBox(height: 8),

          // Footer interaction row
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () => _toggleLike(_posts.indexOf(post)),
                  borderRadius: BorderRadius.circular(8),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          post.isLikedByCurrentUser ? Icons.thumb_up_rounded : Icons.thumb_up_outlined,
                          size: 20,
                          color: post.isLikedByCurrentUser ? _getTopicColor(post.postType) : Colors.grey,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${post.likeCount} Thích',
                          style: TextStyle(
                            color: post.isLikedByCurrentUser ? _getTopicColor(post.postType) : Colors.grey,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              Expanded(
                child: InkWell(
                  onTap: () {
                    // TODO: Open Comments Page
                  },
                  borderRadius: BorderRadius.circular(8),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.chat_bubble_outline_rounded, size: 20, color: Colors.grey),
                        const SizedBox(width: 8),
                        Text(
                          '${post.commentCount} Bình luận',
                          style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.bold),
                        ),
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
  }

  Widget _buildPostImages(List<String> fileIds, bool isDark) {
    if (fileIds.length == 1) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: AppMediaImage(
          fileId: fileIds.first,
          width: double.infinity,
          height: 220,
          fit: BoxFit.cover,
        ),
      );
    }

    // Multiple images Carousel
    return Column(
      children: [
        SizedBox(
          height: 240,
          child: PageView.builder(
            itemCount: fileIds.length,
            controller: PageController(viewportFraction: 0.95),
            itemBuilder: (context, imgIndex) {
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: AppMediaImage(
                    fileId: fileIds[imgIndex],
                    width: double.infinity,
                    height: 240,
                    fit: BoxFit.cover,
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(fileIds.length, (dotIndex) {
            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 2.5),
              width: 6,
              height: 6,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isDark ? Colors.white30 : Colors.black26,
              ),
            );
          }),
        ),
      ],
    );
  }

  Widget _buildTopicBadge(int type) {
    final label = _getTopicLabel(type);
    final color = _getTopicColor(type);
    final icon = _getTopicIcon(type);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  IconData _getTopicIcon(int type) {
    switch (type) {
      case 1:
        return Icons.campaign_rounded;
      case 2:
        return Icons.sports_tennis_rounded;
      default:
        return Icons.forum_rounded;
    }
  }

  Color _getTopicColor(int type) {
    switch (type) {
      case 1:
        return Colors.blue;
      case 2:
        return Colors.amber;
      default:
        return Colors.green;
    }
  }

  String _getTopicLabel(int type) {
    switch (type) {
      case 1:
        return 'Quảng cáo';
      case 2:
        return 'Tìm kèo';
      default:
        return 'Thảo luận';
    }
  }

  Widget _buildErrorWidget() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline_rounded, color: Colors.red, size: 48),
            const SizedBox(height: 12),
            Text(
              _errorMessage ?? 'Lỗi kết nối máy chủ',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadPosts,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryColor,
                foregroundColor: Colors.black,
              ),
              child: const Text('Thử lại'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyWidget() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.forum_outlined, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            'Chưa có bài đăng nào',
            style: TextStyle(color: Colors.grey[600], fontSize: 16, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}
