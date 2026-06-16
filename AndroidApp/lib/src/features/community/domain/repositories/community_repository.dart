import '../../../../shared/network/api_response.dart';
import '../../data/models/community_models.dart';

/// Hợp đồng thiết kế (Repository Interface) quản lý các tác vụ liên quan đến Câu lạc bộ / Đội thể thao.
abstract class CommunityRepository {
  /// Tạo Câu lạc bộ (Team) mới.
  Future<ApiResponse<TeamDetailResponse>> createTeam(CreateTeamRequest request);

  /// Tra cứu danh sách các Câu lạc bộ với từ khóa tìm kiếm (phân trang).
  Future<ApiResponse<PagedResult<TeamResponse>>> getTeams({
    String? search,
    required int pageNumber,
    required int pageSize,
  });

  /// Xem chi tiết thông tin và danh sách thành viên Câu lạc bộ.
  Future<ApiResponse<TeamDetailResponse>> getTeamDetail(String teamId);

  /// Cập nhật thông tin Câu lạc bộ (chỉ Leader).
  Future<ApiResponse<TeamDetailResponse>> updateTeam(
    String teamId,
    UpdateTeamRequest request,
  );

  /// Giải tán Câu lạc bộ (chỉ Leader).
  Future<ApiResponse<void>> deleteTeam(String teamId);
}
