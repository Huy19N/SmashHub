import '../../../../shared/network/api_response.dart';
import '../../data/models/matchmaking_models.dart';

/// Hợp đồng thiết kế (Repository Interface) quản lý tính năng Tìm đối thủ / Ghép đấu giao lưu.
abstract class MatchmakingRepository {
  /// Tạo tin ghép đấu mới.
  Future<ApiResponse<MatchChallengeResponse>> createChallenge(CreateMatchChallengeRequest request);

  /// Lấy danh sách các tin ghép đấu đang tìm đối thủ ở cơ sở.
  Future<ApiResponse<List<MatchChallengeResponse>>> getActiveChallenges({
    int? sportId,
    String? city,
    String? district,
  });

  /// Xem các địa điểm có kèo đấu hoạt động trên bản đồ.
  Future<ApiResponse<List<MatchChallengeMapResponse>>> getChallengesForMap();

  /// Gửi lời thách đấu / đăng ký tham gia giao lưu.
  Future<ApiResponse<MatchAcceptanceResponse>> joinChallenge(
    String challengeId,
    JoinMatchRequest request,
  );

  /// Lấy danh sách đối thủ đăng ký ghép cặp (chủ sân xem).
  Future<ApiResponse<List<MatchAcceptanceResponse>>> getAcceptances(String challengeId);

  /// Đồng ý hoặc Từ chối lời giao lưu thách đấu từ đội khách.
  Future<ApiResponse<void>> respondToAcceptance(String acceptanceId, bool accept);

  /// Lấy danh sách các tin ghép đấu của một đội cụ thể.
  Future<ApiResponse<List<MatchChallengeResponse>>> getTeamChallenges(String teamId);
}
