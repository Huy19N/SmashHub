import '../../../../shared/network/api_response.dart';
import '../../domain/repositories/matchmaking_repository.dart';
import '../data_sources/matchmaking_remote_data_source.dart';
import '../models/matchmaking_models.dart';

/// Triển khai thực tế của MatchmakingRepository.
class MatchmakingRepositoryImpl implements MatchmakingRepository {
  final MatchmakingRemoteDataSource _remoteDataSource;

  MatchmakingRepositoryImpl(this._remoteDataSource);

  @override
  Future<ApiResponse<MatchChallengeResponse>> createChallenge(CreateMatchChallengeRequest request) {
    return _remoteDataSource.createChallenge(request);
  }

  @override
  Future<ApiResponse<List<MatchChallengeResponse>>> getActiveChallenges({
    int? sportId,
    String? city,
    String? district,
  }) {
    return _remoteDataSource.getActiveChallenges(
      sportId: sportId,
      city: city,
      district: district,
    );
  }

  @override
  Future<ApiResponse<List<MatchChallengeMapResponse>>> getChallengesForMap() {
    return _remoteDataSource.getChallengesForMap();
  }

  @override
  Future<ApiResponse<MatchAcceptanceResponse>> joinChallenge(
    String challengeId,
    JoinMatchRequest request,
  ) {
    return _remoteDataSource.joinChallenge(challengeId, request);
  }

  @override
  Future<ApiResponse<List<MatchAcceptanceResponse>>> getAcceptances(String challengeId) {
    return _remoteDataSource.getAcceptances(challengeId);
  }

  @override
  Future<ApiResponse<void>> respondToAcceptance(String acceptanceId, bool accept) {
    return _remoteDataSource.respondToAcceptance(acceptanceId, accept);
  }

  @override
  Future<ApiResponse<List<MatchChallengeResponse>>> getTeamChallenges(String teamId) {
    return _remoteDataSource.getTeamChallenges(teamId);
  }
}
