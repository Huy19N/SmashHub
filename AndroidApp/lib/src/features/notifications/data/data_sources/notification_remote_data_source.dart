import 'package:dio/dio.dart';
import '../../../../shared/network/api_client.dart';
import '../../../../shared/network/api_response.dart';
import '../models/notification_model.dart';

class NotificationRemoteDataSource {
  final ApiClient _apiClient;

  NotificationRemoteDataSource(this._apiClient);

  Future<ApiResponse<List<NotificationModel>>> getNotifications({int page = 1, int limit = 20}) async {
    try {
      final response = await _apiClient.get(
        '/api/notifications',
        queryParameters: {
          'page': page,
          'limit': limit,
        },
      );

      if (response.statusCode == 200 && response.data != null) {
        // The API returns ApiResponse<PagedResult<NotificationDto>>
        // which has data { items: [...], totalItems: ..., ... }
        final responseData = response.data['data'];
        if (responseData != null && responseData['items'] != null) {
          final items = responseData['items'] as List;
          final List<NotificationModel> notifications = items
              .map((json) => NotificationModel.fromJson(json as Map<String, dynamic>))
              .toList();

          return ApiResponse<List<NotificationModel>>(
            success: true,
            message: 'Lấy thông báo thành công',
            data: notifications,
          );
        }
      }

      return ApiResponse<List<NotificationModel>>.error('Lỗi định dạng dữ liệu');
    } on DioException catch (e) {
      return ApiResponse<List<NotificationModel>>.error(
        e.message ?? 'Lỗi tải danh sách thông báo từ máy chủ',
      );
    } catch (e) {
      return ApiResponse<List<NotificationModel>>.error('Đã xảy ra lỗi không xác định');
    }
  }

  Future<ApiResponse<void>> markAsRead(String notificationId) async {
    try {
      final response = await _apiClient.patch('/api/notifications/$notificationId/read');
      if (response.statusCode == 200) {
        return ApiResponse<void>(success: true, message: 'Đã đánh dấu đọc');
      }
      return ApiResponse<void>.error('Lỗi khi đánh dấu đọc');
    } on DioException catch (e) {
      return ApiResponse<void>.error(e.message ?? 'Lỗi kết nối máy chủ');
    } catch (e) {
      return ApiResponse<void>.error('Đã xảy ra lỗi không xác định');
    }
  }

  Future<ApiResponse<void>> markAllAsRead() async {
    try {
      final response = await _apiClient.patch('/api/notifications/read-all');
      if (response.statusCode == 200) {
        return ApiResponse<void>(success: true, message: 'Đã đánh dấu đọc tất cả');
      }
      return ApiResponse<void>.error('Lỗi khi đánh dấu đọc tất cả');
    } on DioException catch (e) {
      return ApiResponse<void>.error(e.message ?? 'Lỗi kết nối máy chủ');
    } catch (e) {
      return ApiResponse<void>.error('Đã xảy ra lỗi không xác định');
    }
  }
}
