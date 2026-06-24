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

  /// Lấy thông tin cá nhân của một người dùng bất kỳ qua userId
  Future<ApiResponse<UserProfileResponse>> getUserProfile(String userId) async {
    try {
      final response = await _apiClient.get('/api/users/$userId');
      return ApiResponse<UserProfileResponse>.fromJson(
        response.data,
        (json) => UserProfileResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi lấy thông tin người dùng');
    }
  }

  /// Cập nhật thông tin cá nhân
  Future<ApiResponse<UserProfileResponse>> updateMyProfile(
    UpdateProfileRequest request,
  ) async {
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
  Future<ApiResponse<List<UserSportProfileResponse>>>
  getMySportProfiles() async {
    try {
      final response = await _apiClient.get('/api/users/me/sport-profiles');
      return ApiResponse<List<UserSportProfileResponse>>.fromJson(
        response.data,
        (json) {
          final list = json as List<dynamic>? ?? [];
          return list
              .map(
                (item) => UserSportProfileResponse.fromJson(
                  item as Map<String, dynamic>,
                ),
              )
              .toList();
        },
      );
    } on DioException catch (e) {
      return ApiResponse.error(
        e.message ?? 'Lỗi tải danh sách trình độ thể thao',
      );
    }
  }

  /// Khai báo thêm môn thể thao
  Future<ApiResponse<UserSportProfileResponse>> createSportProfile(
    CreateSportProfileRequest request,
  ) async {
    try {
      final response = await _apiClient.post(
        '/api/users/me/sport-profiles',
        data: request.toJson(),
      );
      return ApiResponse<UserSportProfileResponse>.fromJson(
        response.data,
        (json) =>
            UserSportProfileResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi khai báo trình độ thể thao');
    }
  }

  /// Cập nhật trình độ thể thao (rank)
  Future<ApiResponse<UserSportProfileResponse>> updateSportProfile(
    int sportId,
    UpdateSportProfileRequest request,
  ) async {
    try {
      final response = await _apiClient.put(
        '/api/users/me/sport-profiles/$sportId',
        data: request.toJson(),
      );
      return ApiResponse<UserSportProfileResponse>.fromJson(
        response.data,
        (json) =>
            UserSportProfileResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi cập nhật trình độ thể thao');
    }
  }

  /// Xóa khai báo môn thể thao
  Future<ApiResponse<void>> deleteSportProfile(int sportId) async {
    try {
      final response = await _apiClient.delete(
        '/api/users/me/sport-profiles/$sportId',
      );
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
        options: Options(headers: {'Content-Type': 'multipart/form-data'}),
      );

      return ApiResponse<String>.fromJson(response.data, (json) {
        final map = json as Map<String, dynamic>;
        return map['avatarFileId'] as String? ?? '';
      });
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi tải lên ảnh đại diện');
    } catch (e) {
      return ApiResponse.error('Lỗi: $e');
    }
  }

  /// Gửi lại email xác thực kích hoạt tài khoản
  /// API: POST /api/email/sendconfirmationemail
  /// Body: JSON string (ví dụ: "test@gmail.com")
  Future<ApiResponse<void>> sendConfirmationEmail(String email) async {
    try {
      print('[DEBUG] sendConfirmationEmail -> email: $email');
      final response = await _apiClient.post(
        '/api/email/sendconfirmationemail',
        data: '"$email"',
      );
      print('[DEBUG] sendConfirmationEmail -> response: ${response.data}');
      return ApiResponse.fromJson(response.data, (_) {});
    } on DioException catch (e) {
      print('[DEBUG] sendConfirmationEmail -> DioException: ${e.message}');
      print('[DEBUG] sendConfirmationEmail -> Response data: ${e.response?.data}');
      return ApiResponse.error(e.message ?? 'Lỗi gửi yêu cầu xác thực');
    }
  }

  /// Xác thực mã OTP để kích hoạt tài khoản
  /// API: POST /api/email/verifycode
  /// Body: {"email": "...", "code": "..."}
  Future<ApiResponse<bool>> verifyCode(EmailConfirmationRequest request) async {
    try {
      print('[DEBUG] verifyCode -> email: ${request.email}, code: ${request.code}');
      final response = await _apiClient.post(
        '/api/email/verifycode',
        data: request.toJson(),
      );
      print('[DEBUG] verifyCode -> response: ${response.data}');
      
      // Parse kết quả từ server
      final responseData = response.data;
      if (responseData is Map<String, dynamic>) {
        final success = responseData['success'] as bool? ?? false;
        final message = responseData['message'] as String? ?? '';
        return ApiResponse<bool>(success: success, message: message, data: success);
      }
      
      // Nếu server trả về giá trị không phải Map, coi như thành công nếu HTTP 200
      return ApiResponse<bool>(success: true, message: 'Xác thực thành công', data: true);
    } on DioException catch (e) {
      print('[DEBUG] verifyCode -> DioException: ${e.message}');
      print('[DEBUG] verifyCode -> Response data: ${e.response?.data}');
      return ApiResponse.error(e.message ?? 'Mã xác thực không hợp lệ');
    }
  }
}
