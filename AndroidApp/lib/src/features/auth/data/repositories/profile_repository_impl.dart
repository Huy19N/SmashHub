import '../../../../shared/network/api_response.dart';
import '../../data/data_sources/profile_remote_data_source.dart';
import '../../data/models/auth_models.dart';
import '../../domain/repositories/profile_repository.dart';

class ProfileRepositoryImpl implements ProfileRepository {
  final ProfileRemoteDataSource _remoteDataSource;

  ProfileRepositoryImpl(this._remoteDataSource);

  @override
  Future<ApiResponse<UserProfileResponse>> getMyProfile() {
    return _remoteDataSource.getMyProfile();
  }

  @override
  Future<ApiResponse<UserProfileResponse>> updateMyProfile(UpdateProfileRequest request) {
    return _remoteDataSource.updateMyProfile(request);
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
  Future<ApiResponse<UserSportProfileResponse>> updateSportProfile(int sportId, UpdateSportProfileRequest request) {
    return _remoteDataSource.updateSportProfile(sportId, request);
  }

  @override
  Future<ApiResponse<void>> deleteSportProfile(int sportId) {
    return _remoteDataSource.deleteSportProfile(sportId);
  }
}
