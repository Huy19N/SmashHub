import '../../domain/repositories/home_repository.dart';
import '../../data/models/home_models.dart';
import '../../../../shared/network/api_response.dart';

/// Bộ điều khiển cho tính năng Trang chủ (Home Controller) ở lớp Presentation.
/// Đảm nhận nhiệm vụ gọi tầng nghiệp vụ để lấy dữ liệu Banners và Bản tin.
class HomeController {
  final HomeRepository homeRepository;

  HomeController({required this.homeRepository});

  /// Lấy danh sách banner khuyến mãi sân đấu
  Future<ApiResponse<List<HomeBanner>>> getBanners() async {
    try {
      return await homeRepository.getBanners();
    } catch (e) {
      return ApiResponse.error(e.toString());
    }
  }

  /// Lấy danh sách tin tức cộng đồng / ghép cặp
  Future<ApiResponse<List<CommunityPost>>> getCommunityFeed() async {
    try {
      return await homeRepository.getCommunityFeed();
    } catch (e) {
      return ApiResponse.error(e.toString());
    }
  }
}
