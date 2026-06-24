import 'package:flutter/material.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/network/api_client.dart';
import '../../data/data_sources/booking_remote_data_source.dart';
import '../../data/repositories/booking_repository_impl.dart';
import '../../domain/repositories/booking_repository.dart';
import '../../data/models/booking_models.dart';
import 'checkout_screen.dart';

class SlotSelectionScreen extends StatefulWidget {
  final int courtId;
  final String courtName;
  final int facilityId;
  final String facilityName;

  const SlotSelectionScreen({
    super.key,
    required this.courtId,
    required this.courtName,
    required this.facilityId,
    required this.facilityName,
  });

  @override
  State<SlotSelectionScreen> createState() => _SlotSelectionScreenState();
}

class _SlotSelectionScreenState extends State<SlotSelectionScreen> {
  late final BookingRepository _repository;
  DateTime _selectedDate = DateTime.now();
  
  List<TimeSlotStatus> _timeSlots = [];
  final List<TimeSlotStatus> _selectedSlots = [];
  
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    final apiClient = ApiClient();
    final dataSource = BookingRemoteDataSource(apiClient);
    _repository = BookingRepositoryImpl(dataSource);
    _loadAvailabilities();
  }

  Future<void> _loadAvailabilities() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _selectedSlots.clear();
    });

    try {
      final response = await _repository.getCourtAvailabilities(widget.facilityId, _selectedDate);
      if (response.success && response.data != null) {
        // Tìm thông tin sân hiện tại
        final courtAvailability = response.data!.firstWhere(
          (c) => c.courtId == widget.courtId,
          orElse: () => CourtAvailabilityResponse(
            courtId: widget.courtId,
            courtName: widget.courtName,
            sportName: '',
            isActive: false,
            timeSlots: [],
          ),
        );
        setState(() {
          _timeSlots = courtAvailability.timeSlots;
        });
      } else {
        setState(() {
          _errorMessage = response.message;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Lỗi kết nối khi tải danh sách giờ trống';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  bool _areSlotsContiguous(List<TimeSlotStatus> selected) {
    if (selected.length <= 1) return true;
    final sorted = List<TimeSlotStatus>.from(selected)
      ..sort((a, b) => a.startTime.compareTo(b.startTime));
    for (int i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].endTime != sorted[i + 1].startTime) {
        return false;
      }
    }
    return true;
  }

  void _onSlotTapped(TimeSlotStatus slot) {
    if (slot.status != 'Available') return;

    setState(() {
      if (_selectedSlots.contains(slot)) {
        _selectedSlots.remove(slot);
      } else {
        // Tạo thử danh sách tạm để kiểm tra tính liên tục
        final temp = List<TimeSlotStatus>.from(_selectedSlots)..add(slot);
        if (_areSlotsContiguous(temp)) {
          _selectedSlots.add(slot);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Vui lòng chọn các khung giờ liền kề nhau!'),
              backgroundColor: Colors.orange,
            ),
          );
        }
      }
    });
  }

  double get _totalCost {
    return _selectedSlots.fold(0.0, (sum, slot) => sum + slot.cost);
  }

  String _formatWeekday(DateTime date) {
    final weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    return weekdays[date.weekday - 1];
  }

  DateTime _parseTime(DateTime date, String timeStr) {
    final parts = timeStr.split(':');
    final hour = int.parse(parts[0]);
    final minute = int.parse(parts[1]);
    return DateTime(date.year, date.month, date.day, hour, minute);
  }

  Future<void> _handleConfirmBooking() async {
    if (_selectedSlots.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn ít nhất một khung giờ!')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Sắp xếp các slot đã chọn theo giờ bắt đầu
      final sorted = List<TimeSlotStatus>.from(_selectedSlots)
        ..sort((a, b) => a.startTime.compareTo(b.startTime));
      
      final startDateTime = _parseTime(_selectedDate, sorted.first.startTime);
      final endDateTime = _parseTime(_selectedDate, sorted.last.endTime);

      final request = CreateBookingRequest(
        courtId: widget.courtId,
        startTime: startDateTime,
        endTime: endDateTime,
      );

      final response = await _repository.createBooking(request);

      if (response.success && response.data != null) {
        final booking = response.data!;
        
        if (mounted) {
          if (booking.paymentUrl != null && booking.paymentUrl!.isNotEmpty) {
            // Chuyển hướng sang WebView Thanh toán
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(
                builder: (_) => CheckoutScreen(
                  paymentUrl: booking.paymentUrl!,
                  bookingId: booking.bookingId,
                ),
              ),
            );
          } else {
            // Thành công mà không cần link thanh toán (Ví dụ: sân miễn phí hoặc đã được kích hoạt)
            showDialog(
              context: context,
              barrierDismissible: false,
              builder: (context) => AlertDialog(
                title: const Text('Đặt sân thành công!'),
                content: const Text('Lịch đặt sân của bạn đã được xác nhận.'),
                actions: [
                  TextButton(
                    onPressed: () {
                      Navigator.of(context).pop(); // Đóng dialog
                      Navigator.of(context).pop(); // Về trang trước
                    },
                    child: const Text('Đồng ý'),
                  )
                ],
              ),
            );
          }
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.message),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Lỗi kết nối máy chủ khi đặt sân'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.courtName,
              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
            ),
            Text(
              widget.facilityName,
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Horizontal Date Picker (7 days)
          Container(
            height: 80,
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: 7,
              itemBuilder: (context, index) {
                final date = DateTime.now().add(Duration(days: index));
                final isSelected = date.day == _selectedDate.day &&
                    date.month == _selectedDate.month &&
                    date.year == _selectedDate.year;

                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: InkWell(
                    onTap: () {
                      setState(() {
                        _selectedDate = date;
                      });
                      _loadAvailabilities();
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      width: 56,
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppTheme.primaryColor
                            : isDark
                                ? AppTheme.darkSurfaceColor
                                : Colors.grey[200],
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? AppTheme.primaryColor : Colors.transparent,
                        ),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            _formatWeekday(date),
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: isSelected
                                  ? Colors.black
                                  : isDark
                                      ? Colors.white70
                                      : Colors.black87,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            date.day.toString(),
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: isSelected ? Colors.black : null,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const Divider(),

          // Grid of time slots
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
                    ),
                  )
                : _errorMessage != null
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              _errorMessage!,
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: _loadAvailabilities,
                              child: const Text('Thử lại'),
                            ),
                          ],
                        ),
                      )
                    : _timeSlots.isEmpty
                        ? const Center(
                            child: Text(
                              'Không có khung giờ nào hoạt động hôm nay.',
                              style: TextStyle(color: Colors.grey),
                            ),
                          )
                        : GridView.builder(
                            padding: const EdgeInsets.all(16),
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 3,
                              crossAxisSpacing: 12,
                              mainAxisSpacing: 12,
                              childAspectRatio: 1.8,
                            ),
                            itemCount: _timeSlots.length,
                            itemBuilder: (context, index) {
                              final slot = _timeSlots[index];
                              final isBooked = slot.status == 'Booked';
                              final isMaintenance = slot.status == 'Maintenance';
                              final isSelected = _selectedSlots.contains(slot);

                              Color bgColor;
                              Color textColor;
                              Border? border;

                              if (isBooked) {
                                bgColor = isDark ? Colors.red.withValues(alpha: 0.1) : Colors.red.withValues(alpha: 0.05);
                                textColor = Colors.red[400]!;
                                border = Border.all(color: Colors.red.withValues(alpha: 0.2));
                              } else if (isMaintenance) {
                                bgColor = isDark ? Colors.grey[850]! : Colors.grey[300]!;
                                textColor = Colors.grey[500]!;
                                border = Border.all(color: Colors.grey.withValues(alpha: 0.2));
                              } else if (isSelected) {
                                bgColor = AppTheme.primaryColor;
                                textColor = Colors.black;
                                border = Border.all(color: Colors.white);
                              } else {
                                bgColor = isDark ? AppTheme.darkSurfaceColor : Colors.white;
                                textColor = isDark ? Colors.white : Colors.black87;
                                border = Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.5));
                              }

                              return InkWell(
                                onTap: (isBooked || isMaintenance)
                                    ? null
                                    : () => _onSlotTapped(slot),
                                borderRadius: BorderRadius.circular(10),
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: bgColor,
                                    borderRadius: BorderRadius.circular(10),
                                    border: border,
                                  ),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text(
                                        '${slot.startTime} - ${slot.endTime}',
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: textColor,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        isBooked
                                            ? 'Đã đặt'
                                            : isMaintenance
                                                ? 'Bảo trì'
                                                : '${(slot.cost / 1000).toStringAsFixed(0)}K',
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                          color: textColor.withValues(alpha: 0.8),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
          ),

          // Total Price & Confirm Action Panel
          if (_selectedSlots.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkSurfaceColor : Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 10,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: SafeArea(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Đã chọn ${_selectedSlots.length} slot',
                          style: const TextStyle(color: Colors.grey, fontSize: 13),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${_totalCost.toStringAsFixed(0)} VND',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                      ],
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: _isLoading ? null : _handleConfirmBooking,
                      child: _isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.black),
                              ),
                            )
                          : const Text(
                              'ĐẶT SÂN NGAY',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                            ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
