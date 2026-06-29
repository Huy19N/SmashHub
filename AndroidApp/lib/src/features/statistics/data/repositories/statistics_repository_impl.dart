import '../../../../shared/network/api_response.dart';
import '../data_sources/statistics_remote_data_source.dart';
import '../models/statistics_model.dart';

class StatisticsRepositoryImpl {
  final StatisticsRemoteDataSource _remoteDataSource;

  StatisticsRepositoryImpl(this._remoteDataSource);

  Future<ApiResponse<UserStatisticsResponse>> getMyStatistics() async {
    return await _remoteDataSource.getMyStatistics();
  }
}
