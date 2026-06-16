import '../../../../shared/network/api_response.dart';
import '../../data/models/auth_models.dart';

/// Giao diện thiết kế (Abstract Contract) quản lý các tác vụ Authentication và Sport Profiles.
/// Định nghĩa các hàm nghiệp vụ độc lập với cách thức triển khai cụ thể (như mạng hay local).
abstract class AuthRepository {
  /// Đăng ký tài khoản người dùng mới.
  Future<ApiResponse<void>> register(RegisterRequest request);

  /// Kích hoạt tài khoản bằng mã OTP qua email.
  Future<ApiResponse<TokenResponse>> verifyRegistration(VerifyEmailRequest request);

  /// Gửi lại mã OTP kích hoạt tài khoản.
  Future<ApiResponse<void>> resendVerificationCode(String email);

  /// Đăng nhập bằng Email và Password.
  Future<ApiResponse<TokenResponse>> login(LoginRequest request);

  /// Đăng xuất tài khoản người dùng hiện tại.
  Future<ApiResponse<void>> logout();

  /// Gửi yêu cầu xin đặt lại mật khẩu.
  Future<ApiResponse<void>> forgotPassword(String email);

  /// Khôi phục mật khẩu mới bằng mã xác minh.
  Future<ApiResponse<void>> resetPassword(ResetPasswordRequest request);

  /// Lấy danh sách trình độ thể thao của tôi.
  Future<ApiResponse<List<UserSportProfileResponse>>> getMySportProfiles();

  /// Thêm mới trình độ cho môn thể thao.
  Future<ApiResponse<UserSportProfileResponse>> createSportProfile(CreateSportProfileRequest request);

  /// Cập nhật trình độ cho môn thể thao đã khai báo.
  Future<ApiResponse<UserSportProfileResponse>> updateSportProfile(int sportId, int rankValue);

  /// Xóa khai báo trình độ của một môn thể thao.
  Future<ApiResponse<void>> deleteSportProfile(int sportId);
}
