import 'package:flutter/foundation.dart';
import '../../domain/repositories/booking_repository.dart';
import '../../data/models/booking_models.dart';

class BookingController extends ChangeNotifier {
  final BookingRepository _bookingRepository;

  BookingController({required BookingRepository bookingRepository}) : _bookingRepository = bookingRepository;

  bool _isLoading = false;
  String? _errorMessage;
  List<BookingResponse> _myBookings = [];

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<BookingResponse> get myBookings => _myBookings;

  Future<void> fetchMyBookings() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _bookingRepository.getMyBookings(pageNumber: 1, pageSize: 50);
      if (response.success && response.data != null) {
        _myBookings = response.data!.items;
      } else {
        _errorMessage = response.message;
      }
    } catch (e) {
      _errorMessage = 'Lỗi kết nối tải dữ liệu đặt sân';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
