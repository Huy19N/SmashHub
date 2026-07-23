import 'package:dio/dio.dart';
import '../../../../shared/network/api_client.dart';
import '../../../../shared/network/api_response.dart';
import '../models/community_models.dart';

/// Nguồn dữ liệu từ xa (Remote Data Source) cho tính năng Cộng đồng / Câu lạc bộ (Community/Team).
class CommunityRemoteDataSource {
  final ApiClient _apiClient;

  CommunityRemoteDataSource(this._apiClient);

  /// Tạo Câu lạc bộ mới (người tạo tự động làm Leader).
  Future<ApiResponse<TeamDetailResponse>> createTeam(CreateTeamRequest request) async {
    try {
      final response = await _apiClient.post(
        '/api/teams',
        data: request.toJson(),
      );
      return ApiResponse<TeamDetailResponse>.fromJson(
        response.data,
        (json) => TeamDetailResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi tạo câu lạc bộ');
    }
  }

  /// Tìm kiếm và lấy danh sách Câu lạc bộ (phân trang).
  Future<ApiResponse<PagedResult<TeamResponse>>> getTeams({
    String? search,
    required int pageNumber,
    required int pageSize,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'PageNumber': pageNumber,
        'PageSize': pageSize,
      };
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }

      final response = await _apiClient.get(
        '/api/teams',
        queryParameters: queryParams,
      );
      return ApiResponse<PagedResult<TeamResponse>>.fromJson(
        response.data,
        (json) => PagedResult<TeamResponse>.fromJson(
          json as Map<String, dynamic>,
          (item) => TeamResponse.fromJson(item as Map<String, dynamic>),
        ),
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi tải danh sách câu lạc bộ');
    }
  }

  /// Lấy thông tin chi tiết một Câu lạc bộ (bao gồm danh sách thành viên).
  Future<ApiResponse<TeamDetailResponse>> getTeamDetail(String teamId) async {
    try {
      final response = await _apiClient.get('/api/teams/$teamId');
      return ApiResponse<TeamDetailResponse>.fromJson(
        response.data,
        (json) => TeamDetailResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi tải chi tiết câu lạc bộ');
    }
  }

  /// Cập nhật thông tin Câu lạc bộ (chỉ Leader).
  Future<ApiResponse<TeamDetailResponse>> updateTeam(
    String teamId,
    UpdateTeamRequest request,
  ) async {
    try {
      final response = await _apiClient.put(
        '/api/teams/$teamId',
        data: request.toJson(),
      );
      return ApiResponse<TeamDetailResponse>.fromJson(
        response.data,
        (json) => TeamDetailResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi cập nhật thông tin câu lạc bộ');
    }
  }

  /// Giải tán Câu lạc bộ (chỉ Leader).
  Future<ApiResponse<void>> deleteTeam(String teamId) async {
    try {
      final response = await _apiClient.delete('/api/teams/$teamId');
      return ApiResponse.fromJson(response.data, (_) {});
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi giải tán câu lạc bộ');
    }
  }

  /// Lấy danh sách tin nhắn của câu lạc bộ.
  Future<ApiResponse<PagedResult<TeamMessageResponse>>> getTeamMessages(
    String teamId, {
    String? search,
    required int pageNumber,
    required int pageSize,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'PageNumber': pageNumber,
        'PageSize': pageSize,
      };
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }

      final response = await _apiClient.get(
        '/api/teams/$teamId/messages',
        queryParameters: queryParams,
      );
      return ApiResponse<PagedResult<TeamMessageResponse>>.fromJson(
        response.data,
        (json) => PagedResult<TeamMessageResponse>.fromJson(
          json as Map<String, dynamic>,
          (item) => TeamMessageResponse.fromJson(item as Map<String, dynamic>),
        ),
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi tải danh sách tin nhắn');
    }
  }

  /// Gửi tin nhắn mới vào câu lạc bộ.
  Future<ApiResponse<TeamMessageResponse>> sendMessage(
    String teamId,
    SendMessageRequest request,
  ) async {
    try {
      final response = await _apiClient.post(
        '/api/teams/$teamId/messages',
        data: request.toJson(),
      );
      return ApiResponse<TeamMessageResponse>.fromJson(
        response.data,
        (json) => TeamMessageResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi gửi tin nhắn');
    }
  }

  /// Xóa tin nhắn (soft delete).
  Future<ApiResponse<void>> deleteMessage(String teamId, String messageId) async {
    try {
      final response = await _apiClient.delete('/api/teams/$teamId/messages/$messageId');
      return ApiResponse.fromJson(response.data, (_) {});
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi xóa tin nhắn');
    }
  }

  /// Xoá thành viên khỏi câu lạc bộ.
  Future<ApiResponse<void>> removeTeamMember(String teamId, String userId) async {
    try {
      final response = await _apiClient.delete('/api/teams/$teamId/members/$userId');
      return ApiResponse.fromJson(response.data, (_) {});
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi xoá thành viên khỏi câu lạc bộ');
    }
  }

  /// Tạo link/mã mời tham gia nhóm.
  Future<ApiResponse<Map<String, dynamic>>> createInvite(String teamId, {int expiryHours = 24}) async {
    try {
      final response = await _apiClient.post(
        '/api/teams/$teamId/invites',
        data: {
          'maxUses': 0, // 0 = unlimited
          'expiryHours': expiryHours,
        },
      );
      return ApiResponse.fromJson(
        response.data,
        (json) => json as Map<String, dynamic>,
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi tạo link mời');
    }
  }

  /// Tham gia câu lạc bộ bằng mã mời.
  Future<ApiResponse<void>> joinTeam(String inviteToken) async {
    try {
      final response = await _apiClient.post('/api/invites/$inviteToken/accept');
      return ApiResponse.fromJson(response.data, (_) {});
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Mã mời không hợp lệ hoặc đã hết hạn');
    }
  }
}
