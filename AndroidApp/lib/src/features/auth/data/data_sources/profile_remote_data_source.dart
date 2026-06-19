import 'package:dio/dio.dart';
import '../../../../shared/network/api_client.dart';
import '../../../../shared/network/api_response.dart';
import '../models/auth_models.dart';

/// Nguồn dữ liệu từ xa (Remote Data Source) cho tính năng Hồ sơ cá nhân (Profile).
class ProfileRemoteDataSource {
  final ApiClient _apiClient;

  ProfileRemoteDataSource(this._apiClient);

  /// Lấy thông tin cá nhân của người dùng hiện tại
  Future<ApiResponse<UserProfileResponse>> getMyProfile() async {
    try {
      final response = await _apiClient.get('/api/users/me');
      return ApiResponse<UserProfileResponse>.fromJson(
        response.data,
        (json) => UserProfileResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi lấy thông tin cá nhân');
    }
  }

  /// Cập nhật thông tin cá nhân
  Future<ApiResponse<UserProfileResponse>> updateMyProfile(UpdateProfileRequest request) async {
    try {
      final response = await _apiClient.put(
        '/api/users/me',
        data: request.toJson(),
      );
      return ApiResponse<UserProfileResponse>.fromJson(
        response.data,
        (json) => UserProfileResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi cập nhật thông tin cá nhân');
    }
  }

  /// Lấy danh sách trình độ thể thao của người dùng
  Future<ApiResponse<List<UserSportProfileResponse>>> getMySportProfiles() async {
    try {
      final response = await _apiClient.get('/api/users/me/sport-profiles');
      return ApiResponse<List<UserSportProfileResponse>>.fromJson(
        response.data,
        (json) {
          final list = json as List<dynamic>? ?? [];
          return list.map((item) => UserSportProfileResponse.fromJson(item as Map<String, dynamic>)).toList();
        },
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi tải danh sách trình độ thể thao');
    }
  }

  /// Khai báo thêm môn thể thao
  Future<ApiResponse<UserSportProfileResponse>> createSportProfile(CreateSportProfileRequest request) async {
    try {
      final response = await _apiClient.post(
        '/api/users/me/sport-profiles',
        data: request.toJson(),
      );
      return ApiResponse<UserSportProfileResponse>.fromJson(
        response.data,
        (json) => UserSportProfileResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi khai báo trình độ thể thao');
    }
  }

  /// Cập nhật trình độ thể thao (rank)
  Future<ApiResponse<UserSportProfileResponse>> updateSportProfile(int sportId, UpdateSportProfileRequest request) async {
    try {
      final response = await _apiClient.put(
        '/api/users/me/sport-profiles/$sportId',
        data: request.toJson(),
      );
      return ApiResponse<UserSportProfileResponse>.fromJson(
        response.data,
        (json) => UserSportProfileResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi cập nhật trình độ thể thao');
    }
  }

  /// Xóa khai báo môn thể thao
  Future<ApiResponse<void>> deleteSportProfile(int sportId) async {
    try {
      final response = await _apiClient.delete('/api/users/me/sport-profiles/$sportId');
      return ApiResponse.fromJson(response.data, (_) {});
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi xóa môn thể thao');
    }
  }

  /// Tải lên ảnh đại diện mới
  Future<ApiResponse<String>> uploadAvatar(String filePath) async {
    try {
      final fileName = filePath.split('/').last;
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath, filename: fileName),
      });

      final response = await _apiClient.post(
        '/api/users/me/avatar',
        data: formData,
        options: Options(
          headers: {'Content-Type': 'multipart/form-data'},
        ),
      );

      return ApiResponse<String>.fromJson(
        response.data,
        (json) {
          final map = json as Map<String, dynamic>;
          return map['avatarFileId'] as String? ?? '';
        },
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi tải lên ảnh đại diện');
    } catch (e) {
      return ApiResponse.error('Lỗi: $e');
    }
  }
}
