import '../../../../shared/network/api_response.dart';
import '../../domain/repositories/auth_repository.dart';
import '../data_sources/auth_remote_data_source.dart';
import '../models/auth_models.dart';

/// Triển khai thực tế của AuthRepository.
/// Làm nhiệm vụ trung gian kết nối tầng Domain (Repository) và tầng Data (Remote Data Source).
class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remoteDataSource;

  AuthRepositoryImpl(this._remoteDataSource);

  @override
  Future<ApiResponse<void>> register(RegisterRequest request) {
    return _remoteDataSource.register(request);
  }

  @override
  Future<ApiResponse<TokenResponse>> verifyRegistration(VerifyEmailRequest request) {
    return _remoteDataSource.verifyRegistration(request);
  }

  @override
  Future<ApiResponse<void>> resendVerificationCode(String email) {
    return _remoteDataSource.resendVerificationCode(email);
  }

  @override
  Future<ApiResponse<TokenResponse>> login(LoginRequest request) {
    return _remoteDataSource.login(request);
  }

  @override
  Future<ApiResponse<void>> logout() {
    return _remoteDataSource.logout();
  }

  @override
  Future<ApiResponse<void>> forgotPassword(String email) {
    return _remoteDataSource.forgotPassword(email);
  }

  @override
  Future<ApiResponse<void>> resetPassword(ResetPasswordRequest request) {
    return _remoteDataSource.resetPassword(request);
  }

  @override
  Future<ApiResponse<List<UserSportProfileResponse>>> getMySportProfiles() {
    return _remoteDataSource.getMySportProfiles();
  }

  @override
  Future<ApiResponse<UserSportProfileResponse>> createSportProfile(CreateSportProfileRequest request) {
    return _remoteDataSource.createSportProfile(request);
  }

  @override
  Future<ApiResponse<UserSportProfileResponse>> updateSportProfile(int sportId, int rankValue) {
    return _remoteDataSource.updateSportProfile(sportId, rankValue);
  }

  @override
  Future<ApiResponse<void>> deleteSportProfile(int sportId) {
    return _remoteDataSource.deleteSportProfile(sportId);
  }
}
