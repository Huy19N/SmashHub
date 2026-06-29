import 'package:dio/dio.dart';
import '../../../../shared/network/api_client.dart';
import '../../../../shared/network/api_response.dart';
import '../models/statistics_model.dart';

class StatisticsRemoteDataSource {
  final ApiClient _apiClient;

  StatisticsRemoteDataSource(this._apiClient);

  Future<ApiResponse<UserStatisticsResponse>> getMyStatistics() async {
    try {
      final response = await _apiClient.get('/api/statistics/me');
      
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data['data'];
        if (data != null) {
          final stats = UserStatisticsResponse.fromJson(data);
          return ApiResponse<UserStatisticsResponse>(
            success: true,
            message: 'Lấy thống kê thành công',
            data: stats,
          );
        }
      }

      return ApiResponse<UserStatisticsResponse>.error('Lỗi định dạng dữ liệu');
    } on DioException catch (e) {
      return ApiResponse<UserStatisticsResponse>.error(
        e.message ?? 'Lỗi tải thống kê từ máy chủ',
      );
    } catch (e) {
      return ApiResponse<UserStatisticsResponse>.error('Đã xảy ra lỗi không xác định');
    }
  }
}
