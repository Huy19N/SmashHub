import '../../../../shared/network/api_response.dart';
import '../data_sources/notification_remote_data_source.dart';
import '../models/notification_model.dart';

class NotificationRepositoryImpl {
  final NotificationRemoteDataSource _remoteDataSource;

  NotificationRepositoryImpl(this._remoteDataSource);

  Future<ApiResponse<List<NotificationModel>>> getNotifications({int page = 1, int limit = 20}) async {
    return await _remoteDataSource.getNotifications(page: page, limit: limit);
  }

  Future<ApiResponse<void>> markAsRead(String notificationId) async {
    return await _remoteDataSource.markAsRead(notificationId);
  }

  Future<ApiResponse<void>> markAllAsRead() async {
    return await _remoteDataSource.markAllAsRead();
  }
}
