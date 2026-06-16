import '../../../../shared/network/api_response.dart';
import '../../domain/repositories/community_repository.dart';
import '../data_sources/community_remote_data_source.dart';
import '../models/community_models.dart';

/// Triển khai thực tế của CommunityRepository.
class CommunityRepositoryImpl implements CommunityRepository {
  final CommunityRemoteDataSource _remoteDataSource;

  CommunityRepositoryImpl(this._remoteDataSource);

  @override
  Future<ApiResponse<TeamDetailResponse>> createTeam(CreateTeamRequest request) {
    return _remoteDataSource.createTeam(request);
  }

  @override
  Future<ApiResponse<PagedResult<TeamResponse>>> getTeams({
    String? search,
    required int pageNumber,
    required int pageSize,
  }) {
    return _remoteDataSource.getTeams(
      search: search,
      pageNumber: pageNumber,
      pageSize: pageSize,
    );
  }

  @override
  Future<ApiResponse<TeamDetailResponse>> getTeamDetail(String teamId) {
    return _remoteDataSource.getTeamDetail(teamId);
  }

  @override
  Future<ApiResponse<TeamDetailResponse>> updateTeam(
    String teamId,
    UpdateTeamRequest request,
  ) {
    return _remoteDataSource.updateTeam(teamId, request);
  }

  @override
  Future<ApiResponse<void>> deleteTeam(String teamId) {
    return _remoteDataSource.deleteTeam(teamId);
  }
}
