import '../../../../shared/network/api_response.dart';
import '../../domain/repositories/home_repository.dart';
import '../data_sources/home_remote_data_source.dart';
import '../models/home_models.dart';

/// Triển khai thực tế của HomeRepository kết nối với Remote Data Source.
class HomeRepositoryImpl implements HomeRepository {
  final HomeRemoteDataSource _remoteDataSource;

  HomeRepositoryImpl(this._remoteDataSource);

  @override
  Future<ApiResponse<List<HomeBanner>>> getBanners() {
    return _remoteDataSource.getBanners();
  }

  @override
  Future<ApiResponse<List<CommunityPost>>> getCommunityFeed() {
    return _remoteDataSource.getCommunityFeed();
  }
}
