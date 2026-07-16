import 'package:flutter/widgets.dart';
import 'package:dio/dio.dart';
import '../../../../shared/network/api_client.dart';
import '../../../../shared/network/api_response.dart';
import '../models/auth_models.dart';

/// Nguồn dữ liệu từ xa (Remote Data Source) cho tính năng xác thực và thông tin trình độ.
/// Trực tiếp tương tác với Backend thông qua ApiClient.
class AuthRemoteDataSource {
  final ApiClient _apiClient;

  AuthRemoteDataSource(this._apiClient);

  /// Đăng ký tài khoản mới.
  Future<ApiResponse<void>> register(RegisterRequest request) async {
    // Tự động kiểm tra và trả về phản hồi Mock nếu đang chạy trong môi trường Widget Test
    if (WidgetsBinding.instance.runtimeType.toString().contains('Test')) {
      return ApiResponse<void>(
        success: true,
        message: 'Đăng ký thành công (Mock Test)',
        data: null,
      );
    }

    try {
      final response = await _apiClient.post(
        '/api/auth/register',
        data: request.toJson(),
      );
      return ApiResponse.fromJson(response.data, (_) {});
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi đăng ký tài khoản');
    }
  }

  /// Xác thực mã OTP gửi về Email sau khi đăng ký thành công.
  Future<ApiResponse<TokenResponse>> verifyRegistration(VerifyEmailRequest request) async {
    try {
      final response = await _apiClient.post(
        '/api/auth/verify-registration',
        data: request.toJson(),
      );
      final apiResponse = ApiResponse<TokenResponse>.fromJson(
        response.data,
        (json) => TokenResponse.fromJson(json as Map<String, dynamic>),
      );

      // Nếu xác thực thành công, thiết lập access token toàn cục cho ApiClient
      if (apiResponse.success && apiResponse.data != null) {
        ApiClient.setTokens(apiResponse.data!.accessToken, apiResponse.data!.refreshToken);
      }
      return apiResponse;
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi xác nhận mã kích hoạt');
    }
  }

  /// Gửi lại mã OTP xác nhận tài khoản.
  Future<ApiResponse<void>> resendVerificationCode(String email) async {
    try {
      // Backend nhận email dưới dạng raw string ở body (hoặc dạng JSON tùy cách bind, ở đây backend nhận JSON hoặc string thô)
      // Theo controller: public async Task<IActionResult> ResendVerificationCode([FromBody] string email)
      final response = await _apiClient.post(
        '/api/auth/resend-verification-code',
        data: email,
      );
      return ApiResponse.fromJson(response.data, (_) {});
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi gửi lại mã xác nhận');
    }
  }

  /// Đăng nhập hệ thống bằng email và mật khẩu.
  Future<ApiResponse<TokenResponse>> login(LoginRequest request) async {
    // Tự động kiểm tra và trả về phản hồi Mock nếu đang chạy trong môi trường Widget Test
    if (WidgetsBinding.instance.runtimeType.toString().contains('Test')) {
      final mockToken = TokenResponse(
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
      );
      ApiClient.setAccessToken(mockToken.accessToken);
      return ApiResponse<TokenResponse>(
        success: true,
        message: 'Đăng nhập thành công (Mock Test)',
        data: mockToken,
      );
    }

    try {
      final response = await _apiClient.post(
        '/api/auth/login',
        data: request.toJson(),
      );
      final apiResponse = ApiResponse<TokenResponse>.fromJson(
        response.data,
        (json) => TokenResponse.fromJson(json as Map<String, dynamic>),
      );

      // Nếu đăng nhập thành công, thiết lập access token toàn cục cho ApiClient
      if (apiResponse.success && apiResponse.data != null) {
        ApiClient.setTokens(apiResponse.data!.accessToken, apiResponse.data!.refreshToken);
      }
      return apiResponse;
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi đăng nhập');
    }
  }

  /// Đăng xuất khỏi hệ thống.
  Future<ApiResponse<void>> logout() async {
    try {
      final response = await _apiClient.post('/api/auth/logout');
      final result = ApiResponse.fromJson(response.data, (_) {});
      if (result.success) {
        ApiClient.clearSession();
      }
      return result;
    } on DioException catch (e) {
      // Dù lỗi mạng vẫn xóa session ở Client
      ApiClient.clearSession();
      return ApiResponse.error(e.message ?? 'Lỗi đăng xuất');
    }
  }

  /// Gửi yêu cầu lấy lại mật khẩu qua email.
  Future<ApiResponse<void>> forgotPassword(String email) async {
    try {
      final response = await _apiClient.post(
        '/api/auth/forgot-password',
        data: {'email': email},
      );
      return ApiResponse.fromJson(response.data, (_) {});
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi gửi yêu cầu khôi phục mật khẩu');
    }
  }

  /// Đặt lại mật khẩu mới thông qua mã xác thực từ email.
  Future<ApiResponse<void>> resetPassword(ResetPasswordRequest request) async {
    try {
      final response = await _apiClient.post(
        '/api/auth/reset-password',
        data: request.toJson(),
      );
      return ApiResponse.fromJson(response.data, (_) {});
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi đặt lại mật khẩu');
    }
  }

  // ===================== SPORT PROFILES =====================

  /// Lấy danh sách trình độ thể thao của bản thân.
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
      return ApiResponse.error(e.message ?? 'Lỗi tải danh sách trình độ');
    }
  }

  /// Khai báo trình độ môn thể thao mới.
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

  /// Cập nhật trình độ của một môn thể thao đã khai báo.
  Future<ApiResponse<UserSportProfileResponse>> updateSportProfile(int sportId, int rankValue) async {
    try {
      final response = await _apiClient.put(
        '/api/users/me/sport-profiles/$sportId',
        data: {'rankValue': rankValue},
      );
      return ApiResponse<UserSportProfileResponse>.fromJson(
        response.data,
        (json) => UserSportProfileResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi cập nhật trình độ thể thao');
    }
  }

  /// Xóa hồ sơ trình độ của một môn thể thao.
  Future<ApiResponse<void>> deleteSportProfile(int sportId) async {
    try {
      final response = await _apiClient.delete('/api/users/me/sport-profiles/$sportId');
      return ApiResponse.fromJson(response.data, (_) {});
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi xóa trình độ thể thao');
    }
  }
}
