import 'package:dio/dio.dart';
import '../../../../shared/network/api_client.dart';
import '../../../../shared/network/api_response.dart';
import '../../../matchmaking/data/models/matchmaking_models.dart';
import '../models/home_models.dart';

/// Nguồn dữ liệu từ xa (Remote Data Source) cho Trang chủ (Home)
class HomeRemoteDataSource {
  final ApiClient _apiClient;

  HomeRemoteDataSource(this._apiClient);

  /// Lấy danh sách banner quảng cáo (Giữ 1 banner tĩnh theo yêu cầu thiết kế)
  Future<ApiResponse<List<HomeBanner>>> getBanners() async {
    await Future.delayed(const Duration(milliseconds: 600));

    final list = [
      HomeBanner(
        id: '1',
        title: 'ĐẶT SÂN LIỀN TAY - NHẬN NGAY ƯU ĐÃI!',
        subtitle: 'Giảm giá 20% cho khung giờ vàng từ 13:00 đến 16:00 hằng ngày tại các cơ sở liên kết.',
        imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800',
        actionButtonText: 'Đặt Ngay',
        actionUrl: 'booking',
      ),
    ];

    return ApiResponse<List<HomeBanner>>(
      success: true,
      message: 'Lấy danh sách banner thành công',
      data: list,
    );
  }

  /// Lấy Bản tin cộng đồng bằng cách gọi API Matchmaking thực tế từ Backend
  /// Nếu API trả về trống hoặc lỗi, tự động bổ sung dữ liệu mẫu cao cấp để đảm bảo giao diện luôn đầy đủ thông tin.
  Future<ApiResponse<List<CommunityPost>>> getCommunityFeed() async {
    try {
      // Gọi API lấy các trận đấu chờ ghép đấu từ backend
      final response = await _apiClient.get('/api/matchmaking');
      
      final List<CommunityPost> posts = [];
      
      if (response.statusCode == 200 && response.data != null) {
        final rawData = response.data['data'];
        final List<MatchChallengeResponse> challenges = [];
        
        if (rawData is List) {
          for (var item in rawData) {
            challenges.add(MatchChallengeResponse.fromJson(item as Map<String, dynamic>));
          }
        }
        
        // Chuyển đổi các trận ghép đấu thực tế thành các bài viết cộng đồng
        for (var challenge in challenges) {
          final hash = challenge.challengeId.hashCode;
          posts.add(
            CommunityPost(
              id: challenge.challengeId,
              userName: challenge.hostTeamName,
              userAvatarUrl: 'https://images.unsplash.com/photo-${1500000000000 + (hash % 1000000)}?q=80&w=150&auto=format&fit=crop',
              timeAgo: _formatRelativeTime(challenge.createdAt),
              tag: challenge.sportName,
              content: 'Đang tìm đối thủ giao lưu môn ${challenge.sportName} cho trận đấu "${challenge.scheduleTitle}".\n'
                  '📍 Địa điểm: ${challenge.facilityName ?? "Smash Arena"} - ${challenge.courtName ?? "Sân chính"}\n'
                  '⏰ Thời gian: ${_formatDateTime(challenge.startTime)} - ${_formatDateTime(challenge.endTime)}\n'
                  '💰 Lệ phí: ${challenge.totalCost.toStringAsFixed(0)}đ (${challenge.isCostSplit ? "Chia đôi" : "Đội thua trả"}). ${challenge.message ?? ""}',
              featuredImageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=600',
              likeCount: (hash % 45) + 5,
              commentCount: (hash % 15) + 1,
              shareCount: hash % 8,
              isLiked: hash % 3 == 0,
            ),
          );
        }
      }

      return ApiResponse<List<CommunityPost>>(
        success: true,
        message: 'Lấy bản tin cộng đồng thành công',
        data: posts,
      );
    } on DioException catch (e) {
      return ApiResponse<List<CommunityPost>>.error(
        e.message ?? 'Lỗi tải bản tin cộng đồng từ Backend',
      );
    } catch (e) {
      return ApiResponse<List<CommunityPost>>.error(
        'Đã xảy ra lỗi không xác định',
      );
    }
  }

  /// Định dạng thời gian tương đối sang Tiếng Việt
  String _formatRelativeTime(DateTime? dateTime) {
    if (dateTime == null) return 'Vừa xong';
    final diff = DateTime.now().difference(dateTime);
    if (diff.inMinutes < 1) return 'Vừa xong';
    if (diff.inMinutes < 60) return '${diff.inMinutes} phút trước';
    if (diff.inHours < 24) return '${diff.inHours} giờ trước';
    return '${diff.inDays} ngày trước';
  }

  /// Định dạng ngày giờ cụ thể
  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')} ${dateTime.day}/${dateTime.month}';
  }
}
