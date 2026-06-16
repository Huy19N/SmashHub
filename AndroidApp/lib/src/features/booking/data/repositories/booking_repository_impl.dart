import '../../../../shared/network/api_response.dart';
import '../../domain/repositories/booking_repository.dart';
import '../data_sources/booking_remote_data_source.dart';
import '../models/booking_models.dart';

/// Triển khai thực tế của BookingRepository.
/// Làm cầu nối giữa remote data source và các model tầng Data.
class BookingRepositoryImpl implements BookingRepository {
  final BookingRemoteDataSource _remoteDataSource;

  BookingRepositoryImpl(this._remoteDataSource);

  @override
  Future<ApiResponse<BookingResponse>> createBooking(CreateBookingRequest request) {
    return _remoteDataSource.createBooking(request);
  }

  @override
  Future<ApiResponse<PagedResult<BookingResponse>>> getMyBookings({
    required int pageNumber,
    required int pageSize,
  }) {
    return _remoteDataSource.getMyBookings(
      pageNumber: pageNumber,
      pageSize: pageSize,
    );
  }

  @override
  Future<ApiResponse<BookingResponse>> getBookingDetail(String bookingId) {
    return _remoteDataSource.getBookingDetail(bookingId);
  }

  @override
  Future<ApiResponse<BookingResponse>> updateBooking(
    String bookingId,
    UpdateBookingRequest request,
  ) {
    return _remoteDataSource.updateBooking(bookingId, request);
  }

  @override
  Future<ApiResponse<void>> cancelBooking(String bookingId) {
    return _remoteDataSource.cancelBooking(bookingId);
  }

  @override
  Future<ApiResponse<List<CourtResponse>>> getCourtsByFacility(int facilityId) {
    return _remoteDataSource.getCourtsByFacility(facilityId);
  }

  @override
  Future<ApiResponse<CourtResponse>> getCourtDetail(int courtId) {
    return _remoteDataSource.getCourtDetail(courtId);
  }
}
