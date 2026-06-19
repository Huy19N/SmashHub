import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/widgets/app_card.dart';
import '../../../../shared/network/api_client.dart';
import '../../../../shared/network/api_response.dart';
import '../../../../shared/network/api_config.dart';
import '../../data/data_sources/home_remote_data_source.dart';
import '../../data/repositories/home_repository_impl.dart';
import '../../data/models/home_models.dart';
import '../controllers/home_controller.dart';
import '../../../../features/auth/data/data_sources/profile_remote_data_source.dart';
import '../../../../features/auth/data/repositories/profile_repository_impl.dart';
import '../../../../features/auth/presentation/controllers/profile_controller.dart';

/// Màn hình Trang chủ chính (HomeScreen) với phong cách thiết kế thể thao hiện đại, cao cấp.
/// Tích hợp SliverAppBar, Banners quảng cáo, Lưới hành động nhanh và Bản tin cộng đồng.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late final HomeController _homeController;
  late final ProfileController _profileController;

  List<HomeBanner> _banners = [];
  List<CommunityPost> _posts = [];
  bool _isLoadingBanners = true;
  bool _isLoadingFeed = true;

  @override
  void initState() {
    super.initState();

    // Khởi tạo các tầng phụ thuộc (Dependency Injection nội bộ)
    final apiClient = ApiClient();
    final remoteDataSource = HomeRemoteDataSource(apiClient);
    final repository = HomeRepositoryImpl(remoteDataSource);
    _homeController = HomeController(homeRepository: repository);

    final profileRemoteDataSource = ProfileRemoteDataSource(apiClient);
    final profileRepository = ProfileRepositoryImpl(profileRemoteDataSource);
    _profileController = ProfileController(
      profileRepository: profileRepository,
    );
    _profileController.addListener(_onProfileControllerUpdate);

    _loadData();
  }

  void _onProfileControllerUpdate() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  void dispose() {
    _profileController.removeListener(_onProfileControllerUpdate);
    _profileController.dispose();
    super.dispose();
  }

  /// Tải dữ liệu song song từ API thông qua Controller
  Future<void> _loadData() async {
    setState(() {
      _isLoadingBanners = true;
      _isLoadingFeed = true;
    });

    // Gọi song song các API để tăng tốc độ tải trang
    final results = await Future.wait([
      _homeController.getBanners(),
      _homeController.getCommunityFeed(),
    ]);

    _profileController.fetchProfileData();

    final bannerResponse = results[0] as ApiResponse<List<HomeBanner>>;
    final feedResponse = results[1] as ApiResponse<List<CommunityPost>>;

    if (mounted) {
      setState(() {
        if (bannerResponse.success && bannerResponse.data != null) {
          _banners = bannerResponse.data as List<HomeBanner>;
        }
        if (feedResponse.success && feedResponse.data != null) {
          _posts = feedResponse.data as List<CommunityPost>;
        }
        _isLoadingBanners = false;
        _isLoadingFeed = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark
          ? AppTheme.darkBackgroundColor
          : AppTheme.lightBackgroundColor,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadData,
          color: AppTheme.primaryColor,
          backgroundColor: isDark
              ? AppTheme.darkBackgroundColor
              : AppTheme.lightBackgroundColor,
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              // 1. SliverAppBar cao cấp chứa thông tin cá nhân và hành động chính
              SliverAppBar(
                floating: true,
                snap: true,
                expandedHeight: 80.0,
                backgroundColor: isDark
                    ? AppTheme.darkBackgroundColor
                    : AppTheme.lightBackgroundColor,
                flexibleSpace: FlexibleSpaceBar(
                  background: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20.0,
                      vertical: 10.0,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Row(
                          children: [
                            // Avatar
                            Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: AppTheme.primaryColor,
                                  width: 2,
                                ),
                                color: AppTheme.primaryColor.withOpacity(0.2),
                                image:
                                    _profileController
                                                .userProfile
                                                ?.avatarFileId !=
                                            null &&
                                        _profileController
                                            .userProfile!
                                            .avatarFileId!
                                            .isNotEmpty
                                    ? DecorationImage(
                                        image: CachedNetworkImageProvider(
                                          ApiConfig.getFileUrl(_profileController.userProfile!.avatarFileId!),
                                        ),
                                        fit: BoxFit.cover,
                                      )
                                    : null,
                              ),
                              alignment: Alignment.center,
                              child:
                                  _profileController
                                              .userProfile
                                              ?.avatarFileId ==
                                          null ||
                                      _profileController
                                          .userProfile!
                                          .avatarFileId!
                                          .isEmpty
                                  ? Text(
                                      _profileController
                                                  .userProfile
                                                  ?.fullName
                                                  .isNotEmpty ==
                                              true
                                          ? _profileController
                                                .userProfile!
                                                .fullName
                                                .substring(0, 1)
                                                .toUpperCase()
                                          : 'U',
                                      style: const TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.w900,
                                        color: AppTheme.primaryColor,
                                      ),
                                    )
                                  : null,
                            ),
                            const SizedBox(width: 12),
                            // Lời chào và Subtitle
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  _profileController
                                              .userProfile
                                              ?.fullName
                                              .isNotEmpty ==
                                          true
                                      ? 'Hey, ${_profileController.userProfile!.fullName.split(' ').last} 👋'
                                      : 'Hey, Bạn 👋',
                                  style: theme.textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 18,
                                    color: isDark ? Colors.white : Colors.black,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'SmashHub',
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    color: isDark
                                        ? Colors.grey[400]
                                        : Colors.grey[600],
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            _buildCircleIconButton(
                              icon: Icons.search_rounded,
                              onPressed: () {},
                              isDark: isDark,
                            ),
                            const SizedBox(width: 12),
                            _buildCircleIconButton(
                              icon: Icons.notifications_none_rounded,
                              onPressed: () {},
                              isDark: isDark,
                              hasBadge: true,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // 2. Nội dung chính dạng danh sách cuộn
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Thanh Tìm Kiếm Bo Tròn Đẹp Mắt
                      const SizedBox(height: 10),
                      _buildSearchBar(isDark),
                      const SizedBox(height: 24),

                      // Banners Quảng Cáo Khuyến Mãi
                      _buildPromoBannersSection(isDark),
                      const SizedBox(height: 28),

                      // Lưới Hành Động Nhanh (Quick Actions) 2x3
                      Text(
                        'Hành động nhanh',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildQuickActionsGrid(context, isDark),
                      const SizedBox(height: 28),

                      // Bản tin cộng đồng (Community Feed)
                      Text(
                        'Bản tin cộng đồng',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
              ),

              // 3. SliverList dành cho Community Feed để cuộn mượt mà
              _isLoadingFeed
                  ? SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20.0),
                        child: _buildFeedShimmer(isDark),
                      ),
                    )
                  : SliverPadding(
                      padding: const EdgeInsets.symmetric(horizontal: 20.0),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate((context, index) {
                          final post = _posts[index];
                          return _buildCommunityPostItem(post, isDark);
                        }, childCount: _posts.length),
                      ),
                    ),

              // Thêm khoảng đệm ở cuối màn hình
              const SliverToBoxAdapter(child: SizedBox(height: 32)),
            ],
          ),
        ),
      ),
    );
  }

  /// Nút tròn cao cấp cho thanh tác vụ
  Widget _buildCircleIconButton({
    required IconData icon,
    required VoidCallback onPressed,
    required bool isDark,
    bool hasBadge = false,
  }) {
    return Stack(
      children: [
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: isDark ? AppTheme.darkSurfaceColor : Colors.grey[200],
            shape: BoxShape.circle,
            border: Border.all(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.08)
                  : Colors.black.withValues(alpha: 0.05),
              width: 1.0,
            ),
          ),
          child: IconButton(
            icon: Icon(icon, size: 22),
            onPressed: onPressed,
            constraints: const BoxConstraints(
              minWidth: 48,
              minHeight: 48,
            ), // Touch target
          ),
        ),
        if (hasBadge)
          Positioned(
            right: 2,
            top: 2,
            child: Container(
              width: 10,
              height: 10,
              decoration: const BoxDecoration(
                color: Colors.redAccent,
                shape: BoxShape.circle,
              ),
            ),
          ),
      ],
    );
  }

  /// Thanh Tìm Kiếm Bo Tròn Cao Cấp
  Widget _buildSearchBar(bool isDark) {
    return Container(
      height: 48,
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkSurfaceColor : Colors.grey[100],
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isDark
              ? Colors.white.withValues(alpha: 0.08)
              : Colors.black.withValues(alpha: 0.08),
          width: 1.0,
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Icon(
            Icons.search_rounded,
            color: isDark ? Colors.white54 : Colors.black45,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Tìm kiếm sân chơi, câu lạc bộ...',
                hintStyle: TextStyle(
                  color: isDark ? Colors.white30 : Colors.black38,
                  fontSize: 14,
                ),
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 11),
              ),
              style: const TextStyle(fontSize: 14),
            ),
          ),
          Icon(
            Icons.tune_rounded,
            color: isDark ? Colors.white54 : Colors.black45,
          ),
        ],
      ),
    );
  }

  /// Banner Khuyến Mãi (Horizontal Promo Banner Slider/Item)
  Widget _buildPromoBannersSection(bool isDark) {
    if (_isLoadingBanners) {
      return _buildBannerShimmer(isDark);
    }

    if (_banners.isEmpty) {
      return const SizedBox.shrink();
    }

    // Lấy Banner đầu tiên làm chính (có thể mở rộng thành PageView sau)
    final banner = _banners.first;

    return AppCard(
      padding: EdgeInsets.zero,
      borderRadius: 20.0,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20.0),
        child: Stack(
          children: [
            // Ảnh nền banner sử dụng CachedNetworkImage hiệu năng cao
            CachedNetworkImage(
              imageUrl: banner.imageUrl,
              height: 180,
              width: double.infinity,
              fit: BoxFit.cover,
              placeholder: (context, url) => _buildShimmerContainer(
                height: 180,
                width: double.infinity,
                isDark: isDark,
              ),
              errorWidget: (context, url, error) => Container(
                height: 180,
                color: Colors.grey[900],
                child: const Icon(
                  Icons.broken_image_rounded,
                  size: 50,
                  color: Colors.grey,
                ),
              ),
            ),
            // Lớp Gradient phủ tối để hiển thị text rõ nét
            Container(
              height: 180,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomRight,
                  end: Alignment.topLeft,
                  colors: [
                    Colors.black.withValues(alpha: 0.85),
                    Colors.black.withValues(alpha: 0.1),
                  ],
                ),
              ),
            ),
            // Nội dung chi tiết trên Banner
            Positioned(
              left: 20,
              right: 20,
              bottom: 20,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: AppTheme.primaryColor,
                        width: 1.0,
                      ),
                    ),
                    child: const Text(
                      'ƯU ĐÃI HOT',
                      style: TextStyle(
                        color: AppTheme.primaryColor,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    banner.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.2,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          banner.subtitle,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: Colors.grey[300],
                            fontSize: 12,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      ElevatedButton(
                        onPressed: () {},
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryColor,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 8,
                          ),
                          minimumSize: const Size(80, 32),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 0,
                        ),
                        child: Text(
                          banner.actionButtonText ?? 'Xem ngay',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Lưới Hành Động Nhanh (Quick Actions Grid 2x3)
  Widget _buildQuickActionsGrid(BuildContext context, bool isDark) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 14,
      crossAxisSpacing: 14,
      childAspectRatio: 1.5,
      children: [
        _buildActionCard(
          icon: Icons.dashboard_rounded,
          title: 'Bảng thống kê',
          subtitle: 'Thống kê hoạt động',
          color: Colors.blue,
          isDark: isDark,
          onTap: () {},
        ),
        _buildActionCard(
          icon: Icons.groups_rounded,
          title: 'Quản lý Nhóm',
          subtitle: 'Danh sách câu lạc bộ',
          color: Colors.teal,
          isDark: isDark,
          onTap: () {},
        ),
        _buildActionCard(
          icon: Icons.local_fire_department_rounded,
          title: 'Bắt kèo',
          subtitle: 'Tìm đối thủ giao lưu',
          color: Colors.orangeAccent,
          isDark: isDark,
          onTap: () {},
        ),
        _buildActionCard(
          icon: Icons.event_available_rounded,
          title: 'Đặt sân',
          subtitle: 'Đặt sân chơi trực tuyến',
          color: Colors.indigoAccent,
          isDark: isDark,
          onTap: () {},
        ),
        _buildActionCard(
          icon: Icons.schedule_rounded,
          title: 'Lịch chơi',
          subtitle: 'Kiểm tra lịch trình',
          color: Colors.pinkAccent,
          isDark: isDark,
          onTap: () {},
        ),
        _buildActionCard(
          icon: Icons.settings_rounded,
          title: 'Cài đặt',
          subtitle: 'Cấu hình ứng dụng',
          color: Colors.grey,
          isDark: isDark,
          onTap: () {},
        ),
      ],
    );
  }

  /// Thiết kế từng thẻ hành động nhanh
  Widget _buildActionCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: AppCard(
        padding: const EdgeInsets.all(16.0),
        borderRadius: 16.0,
        backgroundColor: isDark ? null : Colors.white,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: isDark ? Colors.grey[500] : Colors.grey[600],
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  /// Từng Item bài viết trong bản tin cộng đồng (Community Feed Item)
  Widget _buildCommunityPostItem(CommunityPost post, bool isDark) {
    return AppCard(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      borderRadius: 18.0,
      backgroundColor: isDark ? null : Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header bài viết: Thông tin người dùng
          Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: CachedNetworkImage(
                  imageUrl: post.userAvatarUrl,
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
                      post.userName,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      post.timeAgo,
                      style: TextStyle(
                        color: isDark ? Colors.grey[500] : Colors.grey[600],
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
              if (post.tag != null)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    post.tag!,
                    style: const TextStyle(
                      color: AppTheme.primaryColor,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 14),

          // Nội dung văn bản của bài viết
          Text(post.content, style: const TextStyle(fontSize: 14, height: 1.4)),
          const SizedBox(height: 14),

          // Ảnh đính kèm (Ví dụ ảnh sân đấu cầu lông / tennis)
          if (post.featuredImageUrl != null)
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: CachedNetworkImage(
                imageUrl: post.featuredImageUrl!,
                height: 180,
                width: double.infinity,
                fit: BoxFit.cover,
                placeholder: (context, url) => _buildShimmerContainer(
                  height: 180,
                  width: double.infinity,
                  isDark: isDark,
                ),
                errorWidget: (context, url, error) => const SizedBox.shrink(),
              ),
            ),
          const SizedBox(height: 16),

          // Footer bài viết: Các nút tương tác Like, Comment, Share
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildInteractionButton(
                icon: post.isLiked
                    ? Icons.favorite_rounded
                    : Icons.favorite_border_rounded,
                label: post.likeCount.toString(),
                color: post.isLiked ? Colors.redAccent : Colors.grey,
                onTap: () {},
              ),
              _buildInteractionButton(
                icon: Icons.chat_bubble_outline_rounded,
                label: post.commentCount.toString(),
                color: Colors.grey,
                onTap: () {},
              ),
              _buildInteractionButton(
                icon: Icons.share_outlined,
                label: 'Chia sẻ',
                color: Colors.grey,
                onTap: () {},
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Nút tương tác (Like, Comment, Share) bo tròn cao cấp
  Widget _buildInteractionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Row(
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: Colors.grey,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- HIỆU ỨNG TẢI TRANG SHIMMER (LOADING SHIMMER EFFECTS) ----------------

  /// Container giả lập cấu trúc shimmer chung
  Widget _buildShimmerContainer({
    required double height,
    required double width,
    required bool isDark,
    double borderRadius = 12.0,
  }) {
    return Shimmer.fromColors(
      baseColor: isDark ? Colors.grey[900]! : Colors.grey[300]!,
      highlightColor: isDark ? Colors.grey[800]! : Colors.grey[100]!,
      child: Container(
        height: height,
        width: width,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }

  /// Shimmer cho Banner quảng cáo
  Widget _buildBannerShimmer(bool isDark) {
    return _buildShimmerContainer(
      height: 180,
      width: double.infinity,
      isDark: isDark,
      borderRadius: 20.0,
    );
  }

  /// Shimmer cho Feed cộng đồng
  Widget _buildFeedShimmer(bool isDark) {
    return Column(
      children: List.generate(2, (index) {
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? AppTheme.darkSurfaceColor : Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.08)
                  : Colors.black.withValues(alpha: 0.05),
              width: 1.0,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  _buildShimmerContainer(
                    height: 40,
                    width: 40,
                    isDark: isDark,
                    borderRadius: 20,
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildShimmerContainer(
                        height: 12,
                        width: 100,
                        isDark: isDark,
                      ),
                      const SizedBox(height: 6),
                      _buildShimmerContainer(
                        height: 10,
                        width: 60,
                        isDark: isDark,
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _buildShimmerContainer(
                height: 12,
                width: double.infinity,
                isDark: isDark,
              ),
              const SizedBox(height: 6),
              _buildShimmerContainer(
                height: 12,
                width: double.infinity,
                isDark: isDark,
              ),
              const SizedBox(height: 6),
              _buildShimmerContainer(height: 12, width: 150, isDark: isDark),
              const SizedBox(height: 16),
              _buildShimmerContainer(
                height: 180,
                width: double.infinity,
                isDark: isDark,
              ),
            ],
          ),
        );
      }),
    );
  }
}
