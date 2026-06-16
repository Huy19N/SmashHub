import 'package:dio/dio.dart';
import '../../../../shared/network/api_client.dart';
import '../../../../shared/network/api_response.dart';
import '../models/matchmaking_models.dart';

/// Nguồn dữ liệu từ xa (Remote Data Source) cho tính năng Ghép đấu (Matchmaking).
class MatchmakingRemoteDataSource {
  final ApiClient _apiClient;

  MatchmakingRemoteDataSource(this._apiClient);

  /// Tạo yêu cầu ghép đấu mới (chỉ dành cho Leader đội chủ nhà).
  Future<ApiResponse<MatchChallengeResponse>> createChallenge(CreateMatchChallengeRequest request) async {
    try {
      final response = await _apiClient.post(
        '/api/matchmaking',
        data: request.toJson(),
      );
      return ApiResponse<MatchChallengeResponse>.fromJson(
        response.data,
        (json) => MatchChallengeResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi tạo tin ghép đấu');
    }
  }

  /// Lấy danh sách các tin ghép đấu đang tìm đối thủ (đọc công khai).
  Future<ApiResponse<List<MatchChallengeResponse>>> getActiveChallenges({
    int? sportId,
    String? city,
    String? district,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (sportId != null) queryParams['sportId'] = sportId;
      if (city != null && city.isNotEmpty) queryParams['city'] = city;
      if (district != null && district.isNotEmpty) queryParams['district'] = district;

      final response = await _apiClient.get(
        '/api/matchmaking',
        queryParameters: queryParams,
      );
      return ApiResponse<List<MatchChallengeResponse>>.fromJson(
        response.data,
        (json) {
          final list = json as List<dynamic>? ?? [];
          return list.map((item) => MatchChallengeResponse.fromJson(item as Map<String, dynamic>)).toList();
        },
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi tải danh sách ghép đấu');
    }
  }

  /// Lấy danh sách sân có trận đấu chờ ghép đấu để hiển thị trên bản đồ.
  Future<ApiResponse<List<MatchChallengeMapResponse>>> getChallengesForMap() async {
    try {
      final response = await _apiClient.get('/api/matchmaking/map');
      return ApiResponse<List<MatchChallengeMapResponse>>.fromJson(
        response.data,
        (json) {
          final list = json as List<dynamic>? ?? [];
          return list.map((item) => MatchChallengeMapResponse.fromJson(item as Map<String, dynamic>)).toList();
        },
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi tải dữ liệu bản đồ ghép đấu');
    }
  }

  /// Đăng ký tham gia ghép đấu với tư cách đối thủ (chỉ Leader đội khách).
  Future<ApiResponse<MatchAcceptanceResponse>> joinChallenge(
    String challengeId,
    JoinMatchRequest request,
  ) async {
    try {
      final response = await _apiClient.post(
        '/api/matchmaking/$challengeId/join',
        data: request.toJson(),
      );
      return ApiResponse<MatchAcceptanceResponse>.fromJson(
        response.data,
        (json) => MatchAcceptanceResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi đăng ký tham gia ghép đấu');
    }
  }

  /// Xem danh sách các đội đăng ký tham gia giao lưu (chỉ Leader đội chủ nhà).
  Future<ApiResponse<List<MatchAcceptanceResponse>>> getAcceptances(String challengeId) async {
    try {
      final response = await _apiClient.get('/api/matchmaking/$challengeId/acceptances');
      return ApiResponse<List<MatchAcceptanceResponse>>.fromJson(
        response.data,
        (json) {
          final list = json as List<dynamic>? ?? [];
          return list.map((item) => MatchAcceptanceResponse.fromJson(item as Map<String, dynamic>)).toList();
        },
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi tải danh sách yêu cầu ghép đấu');
    }
  }

  /// Phản hồi yêu cầu tham gia (Chấp nhận hoặc Từ chối - chỉ Leader đội chủ nhà).
  Future<ApiResponse<void>> respondToAcceptance(String acceptanceId, bool accept) async {
    try {
      final response = await _apiClient.post(
        '/api/matchmaking/acceptances/$acceptanceId/respond',
        queryParameters: {'accept': accept},
      );
      return ApiResponse.fromJson(response.data, (_) {});
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi phản hồi yêu cầu ghép đấu');
    }
  }
}
