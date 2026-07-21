import '../../../../shared/network/api_response.dart';
import '../../data/models/booking_models.dart';

/// Hợp đồng thiết kế (Repository Interface) quản lý tính năng Đặt sân và Tra cứu sân.
abstract class BookingRepository {
  /// Đặt sân mới.
  Future<ApiResponse<BookingResponse>> createBooking(CreateBookingRequest request);

  /// Đặt nhiều sân cùng lúc (đơn hàng gộp).
  Future<ApiResponse<BatchBookingResponse>> createBatchBooking(List<CreateBookingRequest> requests);

  /// Lấy danh sách lịch sử đặt sân của tôi có phân trang.
  Future<ApiResponse<PagedResult<BookingResponse>>> getMyBookings({
    required int pageNumber,
    required int pageSize,
  });

  /// Lấy chi tiết lịch sử đặt sân.
  Future<ApiResponse<BookingResponse>> getBookingDetail(String bookingId);

  /// Sửa đổi lịch đặt sân.
  Future<ApiResponse<BookingResponse>> updateBooking(
    String bookingId,
    UpdateBookingRequest request,
  );

  /// Hủy bỏ lịch đặt sân.
  Future<ApiResponse<void>> cancelBooking(String bookingId);

  /// Đồng bộ trạng thái thanh toán từ PayOS
  Future<bool> syncPaymentStatus(int orderCode);

  /// Lấy danh sách sân thuộc một cơ sở thể thao.
  Future<ApiResponse<List<CourtResponse>>> getCourtsByFacility(int facilityId);

  /// Xem chi tiết thông tin một sân cụ thể.
  Future<ApiResponse<CourtResponse>> getCourtDetail(int courtId);

  /// Lấy tất cả các cơ sở thể thao.
  Future<ApiResponse<List<FacilityResponse>>> getAllFacilities();

  /// Xem chi tiết thông tin một cơ sở thể thao cụ thể.
  Future<ApiResponse<FacilityResponse>> getFacilityDetail(int facilityId);

  /// Lấy trạng thái hoạt động/đặt sân con theo cơ sở và ngày cụ thể.
  Future<ApiResponse<List<CourtAvailabilityResponse>>> getCourtAvailabilities(
    int facilityId,
    DateTime date,
  );
}
