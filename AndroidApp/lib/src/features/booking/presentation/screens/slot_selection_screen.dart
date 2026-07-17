import 'package:flutter/material.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/network/api_client.dart';
import '../../data/data_sources/booking_remote_data_source.dart';
import '../../data/repositories/booking_repository_impl.dart';
import '../../domain/repositories/booking_repository.dart';
import '../../data/models/booking_models.dart';
import 'checkout_screen.dart';

class TimeInterval implements Comparable<TimeInterval> {
  final String startTime;
  final String endTime;

  TimeInterval({required this.startTime, required this.endTime});

  @override
  int compareTo(TimeInterval other) {
    return startTime.compareTo(other.startTime);
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is TimeInterval &&
          runtimeType == other.runtimeType &&
          startTime == other.startTime &&
          endTime == other.endTime;

  @override
  int get hashCode => startTime.hashCode ^ endTime.hashCode;
}

class SelectedSlot {
  final int courtId;
  final String courtName;
  final TimeSlotStatus slot;

  SelectedSlot({
    required this.courtId,
    required this.courtName,
    required this.slot,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SelectedSlot &&
          runtimeType == other.runtimeType &&
          courtId == other.courtId &&
          slot.startTime == other.slot.startTime &&
          slot.endTime == other.slot.endTime;

  @override
  int get hashCode => courtId.hashCode ^ slot.startTime.hashCode ^ slot.endTime.hashCode;
}

class SlotSelectionScreen extends StatefulWidget {
  final int facilityId;
  final String facilityName;

  const SlotSelectionScreen({
    super.key,
    required this.facilityId,
    required this.facilityName,
  });

  @override
  State<SlotSelectionScreen> createState() => _SlotSelectionScreenState();
}

class _SlotSelectionScreenState extends State<SlotSelectionScreen> {
  late final BookingRepository _repository;
  DateTime _selectedDate = DateTime.now();

  List<CourtAvailabilityResponse> _courtAvailabilities = [];
  final List<SelectedSlot> _selectedSlots = [];

  bool _isLoading = false;
  String? _errorMessage;

  static const double _courtColumnWidth = 100.0;
  static const double _timeColumnWidth = 120.0;
  static const double _cellHeight = 60.0;

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
        setState(() {
          _courtAvailabilities = response.data!;
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

  void _onSlotTapped(int courtId, String courtName, TimeSlotStatus slot) {
    if (slot.status != 'Available') return;

    final existingIndex = _selectedSlots.indexWhere((s) =>
        s.courtId == courtId &&
        s.slot.startTime == slot.startTime &&
        s.slot.endTime == slot.endTime);

    setState(() {
      if (existingIndex != -1) {
        // Bỏ chọn
        final courtSelections = _selectedSlots.where((s) => s.courtId == courtId).toList();
        final courtSlotsRemaining = courtSelections
            .where((s) => !(s.slot.startTime == slot.startTime && s.slot.endTime == slot.endTime))
            .map((s) => s.slot)
            .toList();

        if (_areSlotsContiguous(courtSlotsRemaining)) {
          _selectedSlots.removeAt(existingIndex);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Vui lòng bỏ chọn từ hai đầu danh sách giờ!'),
              backgroundColor: Colors.orange,
            ),
          );
        }
      } else {
        // Chọn mới
        final courtSelections = _selectedSlots.where((s) => s.courtId == courtId).toList();
        final courtSlotsTemp = courtSelections.map((s) => s.slot).toList()..add(slot);

        if (_areSlotsContiguous(courtSlotsTemp)) {
          _selectedSlots.add(SelectedSlot(
            courtId: courtId,
            courtName: courtName,
            slot: slot,
          ));
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

  bool _isPastSlot(DateTime selectedDate, String slotStartTime) {
    final now = DateTime.now();
    final selectedDateOnly = DateTime(selectedDate.year, selectedDate.month, selectedDate.day);
    final today = DateTime(now.year, now.month, now.day);
    
    if (selectedDateOnly.isBefore(today)) {
      return true;
    } else if (selectedDateOnly.isAtSameMomentAs(today)) {
      final parts = slotStartTime.split(':');
      if (parts.length >= 2) {
        final slotHour = int.tryParse(parts[0]) ?? 0;
        final slotMinute = int.tryParse(parts[1]) ?? 0;
        final slotTime = DateTime(now.year, now.month, now.day, slotHour, slotMinute);
        return slotTime.isBefore(now);
      }
    }
    return false;
  }

  double get _totalCost {
    return _selectedSlots.fold(0.0, (sum, item) => sum + item.slot.cost);
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

  List<TimeInterval> get _sortedIntervals {
    final Set<TimeInterval> intervalSet = {};
    for (var court in _courtAvailabilities) {
      for (var slot in court.timeSlots) {
        intervalSet.add(TimeInterval(startTime: slot.startTime, endTime: slot.endTime));
      }
    }
    return intervalSet.toList()..sort();
  }

  Future<void> _handleConfirmBooking() async {
    if (_selectedSlots.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn ít nhất một khung giờ!')),
      );
      return;
    }

    final Map<int, List<SelectedSlot>> grouped = {};
    for (var s in _selectedSlots) {
      grouped.putIfAbsent(s.courtId, () => []).add(s);
    }

    setState(() {
      _isLoading = true;
    });

    final List<CreateBookingRequest> requests = [];
    for (var entry in grouped.entries) {
      final courtId = entry.key;
      final slots = entry.value;
      slots.sort((a, b) => a.slot.startTime.compareTo(b.slot.startTime));

      final startDateTime = _parseTime(_selectedDate, slots.first.slot.startTime);
      final endDateTime = _parseTime(_selectedDate, slots.last.slot.endTime);

      requests.add(CreateBookingRequest(
        courtId: courtId,
        startTime: startDateTime,
        endTime: endDateTime,
      ));
    }

    try {
      final response = await _repository.createBatchBooking(requests);

      setState(() {
        _isLoading = false;
      });

      if (response.success && response.data != null) {
        final batch = response.data!;
        if (mounted) {
          if (batch.paymentUrl != null && batch.paymentUrl!.isNotEmpty) {
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(
                builder: (_) => CheckoutScreen(
                  paymentUrl: batch.paymentUrl!,
                  bookingId: batch.bookings.first.bookingId,
                  isMultipleBookings: false,
                ),
              ),
            );
          } else {
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
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('Đặt sân thất bại'),
              content: Text(response.message),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Đồng ý'),
                ),
              ],
            ),
          );
        }
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Lỗi kết nối khi đặt sân gộp'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Widget _buildLegend() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildLegendItem(
            'Trống',
            isDark ? AppTheme.darkSurfaceColor : Colors.white,
            isDark ? Colors.white70 : Colors.black87,
            border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.5)),
          ),
          _buildLegendItem('Đang chọn', AppTheme.primaryColor, Colors.black),
          _buildLegendItem(
            'Đã đặt',
            isDark ? Colors.red.withValues(alpha: 0.15) : Colors.red.withValues(alpha: 0.08),
            Colors.red[400]!,
          ),
          _buildLegendItem(
            'Bảo trì',
            isDark ? Colors.grey[850]! : Colors.grey[200]!,
            Colors.grey[500]!,
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(String label, Color bgColor, Color textColor, {BoxBorder? border}) {
    return Row(
      children: [
        Container(
          width: 14,
          height: 14,
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(4),
            border: border,
          ),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
        ),
      ],
    );
  }

  Widget _buildTimelineGrid(List<TimeInterval> intervals) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      scrollDirection: Axis.vertical,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row
            Row(
              children: [
                Container(
                  width: _courtColumnWidth,
                  height: 45,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: isDark ? AppTheme.darkSurfaceColor : Colors.grey[100],
                    border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
                  ),
                  child: const Text(
                    'Sân',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ),
                ...intervals.map((interval) => Container(
                      width: _timeColumnWidth,
                      height: 45,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: isDark ? AppTheme.darkSurfaceColor : Colors.grey[100],
                        border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
                      ),
                      child: Text(
                        '${interval.startTime} - ${interval.endTime}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    )),
              ],
            ),

            // Court Rows
            ..._courtAvailabilities.map((court) {
              return Row(
                children: [
                  Container(
                    width: _courtColumnWidth,
                    height: _cellHeight,
                    alignment: Alignment.centerLeft,
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    decoration: BoxDecoration(
                      color: isDark ? Colors.grey[900] : Colors.white,
                      border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
                    ),
                    child: Text(
                      court.courtName,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                  ...intervals.map((interval) {
                    final slot = court.timeSlots.firstWhere(
                      (s) => s.startTime == interval.startTime && s.endTime == interval.endTime,
                      orElse: () => TimeSlotStatus(
                        startTime: interval.startTime,
                        endTime: interval.endTime,
                        cost: 0,
                        status: 'Maintenance',
                      ),
                    );

                    final isBooked = slot.status == 'Booked';
                    final isPast = _isPastSlot(_selectedDate, slot.startTime);
                    final isMaintenance = slot.status == 'Maintenance' || !court.isActive;
                    final isSelected = _selectedSlots.any((s) =>
                        s.courtId == court.courtId &&
                        s.slot.startTime == slot.startTime &&
                        s.slot.endTime == slot.endTime);

                    Color bgColor;
                    Color textColor;
                    String statusText;

                    if (isBooked) {
                      bgColor = isDark ? Colors.red.withValues(alpha: 0.15) : Colors.red.withValues(alpha: 0.08);
                      textColor = Colors.red[400]!;
                      statusText = 'Đã đặt';
                    } else if (isPast) {
                      bgColor = isDark ? Colors.grey[850]! : Colors.grey[200]!;
                      textColor = Colors.grey[500]!;
                      statusText = 'Đã qua';
                    } else if (isMaintenance) {
                      bgColor = isDark ? Colors.grey[850]! : Colors.grey[200]!;
                      textColor = Colors.grey[500]!;
                      statusText = 'Bảo trì';
                    } else if (isSelected) {
                      bgColor = AppTheme.primaryColor;
                      textColor = Colors.black;
                      statusText = '${(slot.cost / 1000).toStringAsFixed(0)}K';
                    } else {
                      bgColor = isDark ? AppTheme.darkSurfaceColor : Colors.white;
                      textColor = isDark ? Colors.white : Colors.black87;
                      statusText = '${(slot.cost / 1000).toStringAsFixed(0)}K';
                    }

                    return InkWell(
                      onTap: (isBooked || isMaintenance || isPast)
                          ? null
                          : () => _onSlotTapped(court.courtId, court.courtName, slot),
                      child: Container(
                        width: _timeColumnWidth,
                        height: _cellHeight,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: bgColor,
                          border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              statusText,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                color: textColor,
                              ),
                            ),
                            if (!isBooked && !isMaintenance && !isSelected) const SizedBox(height: 2),
                            if (!isBooked && !isMaintenance && !isSelected)
                              Text(
                                'Chọn',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: textColor.withValues(alpha: 0.5),
                                ),
                              ),
                            if (isSelected)
                              const Icon(
                                Icons.check_circle_rounded,
                                size: 14,
                                color: Colors.black,
                              ),
                          ],
                        ),
                      ),
                    );
                  }),
                ],
              );
            }),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'ĐẶT GIỜ CHƠI',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
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

          // Grid of time slots / Timeline
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
                    : _courtAvailabilities.isEmpty
                        ? const Center(
                            child: Text(
                              'Không tìm thấy sân nào hoạt động hôm nay.',
                              style: TextStyle(color: Colors.grey),
                            ),
                          )
                        : Column(
                            children: [
                              _buildLegend(),
                              const Divider(height: 1),
                              Expanded(
                                child: _buildTimelineGrid(_sortedIntervals),
                              ),
                            ],
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
