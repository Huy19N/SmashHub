import 'package:dio/dio.dart';
import '../../../../shared/network/api_client.dart';
import '../../../../shared/network/api_response.dart';
import '../models/booking_models.dart';

/// Nguồn dữ liệu từ xa (Remote Data Source) cho tính năng đặt sân (Booking).
/// Kết nối trực tiếp đến các endpoint của Backend thông qua ApiClient.
class BookingRemoteDataSource {
  final ApiClient _apiClient;

  BookingRemoteDataSource(this._apiClient);

  /// Tạo đặt sân (Booking) mới.
  Future<ApiResponse<BookingResponse>> createBooking(CreateBookingRequest request) async {
    try {
      final response = await _apiClient.post(
        '/api/bookings',
        data: request.toJson(),
      );
      return ApiResponse<BookingResponse>.fromJson(
        response.data,
        (json) => BookingResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi đặt sân');
    }
  }

  /// Lấy danh sách lịch sử đặt sân của tôi (có phân trang).
  Future<ApiResponse<PagedResult<BookingResponse>>> getMyBookings({
    required int pageNumber,
    required int pageSize,
  }) async {
    try {
      final response = await _apiClient.get(
        '/api/bookings/my',
        queryParameters: {
          'PageNumber': pageNumber,
          'PageSize': pageSize,
        },
      );
      return ApiResponse<PagedResult<BookingResponse>>.fromJson(
        response.data,
        (json) => PagedResult<BookingResponse>.fromJson(
          json as Map<String, dynamic>,
          (item) => BookingResponse.fromJson(item as Map<String, dynamic>),
        ),
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi tải danh sách đặt sân');
    }
  }

  /// Lấy chi tiết lịch sử đặt sân theo Id.
  Future<ApiResponse<BookingResponse>> getBookingDetail(String bookingId) async {
    try {
      final response = await _apiClient.get('/api/bookings/$bookingId');
      return ApiResponse<BookingResponse>.fromJson(
        response.data,
        (json) => BookingResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi tải thông tin chi tiết đặt sân');
    }
  }

  /// Cập nhật thông tin đặt sân (chỉ cho phép khi trạng thái đặt sân là Pending).
  Future<ApiResponse<BookingResponse>> updateBooking(
    String bookingId,
    UpdateBookingRequest request,
  ) async {
    try {
      final response = await _apiClient.put(
        '/api/bookings/$bookingId',
        data: request.toJson(),
      );
      return ApiResponse<BookingResponse>.fromJson(
        response.data,
        (json) => BookingResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi cập nhật thông tin đặt sân');
    }
  }

  /// Hủy đặt sân.
  Future<ApiResponse<void>> cancelBooking(String bookingId) async {
    try {
      final response = await _apiClient.delete('/api/bookings/$bookingId');
      return ApiResponse.fromJson(response.data, (_) {});
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi hủy lịch đặt sân');
    }
  }

  /// Lấy danh sách sân theo cơ sở (Facility) - Public Endpoint.
  Future<ApiResponse<List<CourtResponse>>> getCourtsByFacility(int facilityId) async {
    try {
      final response = await _apiClient.get('/api/facilities/$facilityId/courts');
      return ApiResponse<List<CourtResponse>>.fromJson(
        response.data,
        (json) {
          final list = json as List<dynamic>? ?? [];
          return list.map((item) => CourtResponse.fromJson(item as Map<String, dynamic>)).toList();
        },
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi tải danh sách sân của cơ sở');
    }
  }

  /// Lấy thông tin chi tiết một sân.
  Future<ApiResponse<CourtResponse>> getCourtDetail(int courtId) async {
    try {
      final response = await _apiClient.get('/api/courts/$courtId');
      return ApiResponse<CourtResponse>.fromJson(
        response.data,
        (json) => CourtResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi tải thông tin chi tiết sân');
    }
  }

  /// Lấy tất cả cơ sở (Facilities).
  Future<ApiResponse<List<FacilityResponse>>> getAllFacilities() async {
    try {
      final response = await _apiClient.get('/api/facilities');
      return ApiResponse<List<FacilityResponse>>.fromJson(
        response.data,
        (json) {
          final list = json as List<dynamic>? ?? [];
          return list.map((item) => FacilityResponse.fromJson(item as Map<String, dynamic>)).toList();
        },
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi tải danh sách cơ sở sân chơi');
    }
  }

  /// Lấy chi tiết cơ sở (Facility).
  Future<ApiResponse<FacilityResponse>> getFacilityDetail(int facilityId) async {
    try {
      final response = await _apiClient.get('/api/facilities/$facilityId');
      return ApiResponse<FacilityResponse>.fromJson(
        response.data,
        (json) => FacilityResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi tải chi tiết cơ sở sân chơi');
    }
  }

  /// Lấy trạng thái hoạt động/đặt của các sân theo cơ sở và ngày.
  Future<ApiResponse<List<CourtAvailabilityResponse>>> getCourtAvailabilities(
    int facilityId,
    DateTime date,
  ) async {
    try {
      final dateString = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
      final response = await _apiClient.get(
        '/api/facilities/$facilityId/courts/status',
        queryParameters: {'date': dateString},
      );
      return ApiResponse<List<CourtAvailabilityResponse>>.fromJson(
        response.data,
        (json) {
          final list = json as List<dynamic>? ?? [];
          return list.map((item) => CourtAvailabilityResponse.fromJson(item as Map<String, dynamic>)).toList();
        },
      );
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Lỗi tải lịch hoạt động sân con');
    }
  }
}
