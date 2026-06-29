import 'package:dio/dio.dart';
import '../../../../shared/network/api_client.dart';
import '../../../../shared/network/api_response.dart';
import '../models/post_model.dart';

class SocialRemoteDataSource {
  final ApiClient _apiClient;

  SocialRemoteDataSource(this._apiClient);

  Future<ApiResponse<List<PostModel>>> getPosts({int page = 1, int limit = 20}) async {
    try {
      final response = await _apiClient.get(
        '/api/social/posts',
        queryParameters: {
          'page': page,
          'limit': limit,
        },
      );

      if (response.statusCode == 200 && response.data != null) {
        final responseData = response.data['data'];
        if (responseData != null && responseData['items'] != null) {
          final items = responseData['items'] as List;
          final List<PostModel> posts = items
              .map((json) => PostModel.fromJson(json as Map<String, dynamic>))
              .toList();

          return ApiResponse<List<PostModel>>(
            success: true,
            message: 'Lấy bài viết thành công',
            data: posts,
          );
        }
      }

      return ApiResponse<List<PostModel>>.error('Lỗi định dạng dữ liệu');
    } on DioException catch (e) {
      return ApiResponse<List<PostModel>>.error(
        e.message ?? 'Lỗi tải danh sách bài viết từ máy chủ',
      );
    } catch (e) {
      return ApiResponse<List<PostModel>>.error('Đã xảy ra lỗi không xác định');
    }
  }

  Future<ApiResponse<PostModel>> createPost(String content, {String? mediaFileId}) async {
    try {
      final response = await _apiClient.post(
        '/api/social/posts',
        data: {
          'content': content,
          'mediaFileId': mediaFileId,
        },
      );
      if (response.statusCode == 200 && response.data != null) {
        return ApiResponse<PostModel>(
          success: true,
          message: 'Đăng bài thành công',
          data: PostModel.fromJson(response.data['data']),
        );
      }
      return ApiResponse<PostModel>.error('Lỗi khi đăng bài');
    } on DioException catch (e) {
      return ApiResponse<PostModel>.error(e.message ?? 'Lỗi kết nối máy chủ');
    } catch (e) {
      return ApiResponse<PostModel>.error('Đã xảy ra lỗi không xác định');
    }
  }

  Future<ApiResponse<void>> likePost(String postId) async {
    try {
      final response = await _apiClient.post('/api/social/posts/$postId/like');
      return ApiResponse<void>(success: response.statusCode == 200, message: '');
    } catch (e) {
      return ApiResponse<void>.error('Lỗi');
    }
  }

  Future<ApiResponse<void>> unlikePost(String postId) async {
    try {
      final response = await _apiClient.delete('/api/social/posts/$postId/like');
      return ApiResponse<void>(success: response.statusCode == 200, message: '');
    } catch (e) {
      return ApiResponse<void>.error('Lỗi');
    }
  }
}
