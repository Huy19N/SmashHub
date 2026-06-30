import '../../../../shared/network/api_response.dart';
import '../data_sources/social_remote_data_source.dart';
import '../models/post_model.dart';

class SocialRepositoryImpl {
  final SocialRemoteDataSource _remoteDataSource;

  SocialRepositoryImpl(this._remoteDataSource);

  Future<ApiResponse<List<PostModel>>> getPosts({int page = 1, int limit = 20}) async {
    return await _remoteDataSource.getPosts(page: page, limit: limit);
  }

  Future<ApiResponse<PostModel>> createPost({
    required String content,
    required int postType,
    List<String> mediaFileIds = const [],
  }) async {
    return await _remoteDataSource.createPost(
      content: content,
      postType: postType,
      mediaFileIds: mediaFileIds,
    );
  }

  Future<ApiResponse<void>> likePost(String postId) async {
    return await _remoteDataSource.likePost(postId);
  }

  Future<ApiResponse<void>> unlikePost(String postId) async {
    return await _remoteDataSource.unlikePost(postId);
  }
}
