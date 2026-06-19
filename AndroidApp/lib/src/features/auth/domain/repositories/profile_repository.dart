import '../../../../shared/network/api_response.dart';
import '../../data/models/auth_models.dart';

/// Repository giao tiếp với ProfileRemoteDataSource.
abstract class ProfileRepository {
  Future<ApiResponse<UserProfileResponse>> getMyProfile();
  Future<ApiResponse<UserProfileResponse>> updateMyProfile(UpdateProfileRequest request);
  Future<ApiResponse<List<UserSportProfileResponse>>> getMySportProfiles();
  Future<ApiResponse<UserSportProfileResponse>> createSportProfile(CreateSportProfileRequest request);
  Future<ApiResponse<UserSportProfileResponse>> updateSportProfile(int sportId, UpdateSportProfileRequest request);
  Future<ApiResponse<void>> deleteSportProfile(int sportId);
  Future<ApiResponse<String>> uploadAvatar(String filePath);
}
