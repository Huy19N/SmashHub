import '../../../../shared/network/api_response.dart';
import '../../data/models/home_models.dart';

/// Giao diện kho lưu trữ (Repository Interface) cho tính năng Trang chủ.
/// Định nghĩa các dịch vụ dữ liệu cần thiết cho tầng giao diện người dùng.
abstract class HomeRepository {
  /// Lấy danh sách Banner quảng cáo khuyến mãi.
  Future<ApiResponse<List<HomeBanner>>> getBanners();

  /// Lấy danh sách Bản tin cộng đồng / Trận đấu ghép cặp.
  Future<ApiResponse<List<CommunityPost>>> getCommunityFeed();
}
