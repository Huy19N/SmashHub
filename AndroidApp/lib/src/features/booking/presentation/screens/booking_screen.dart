import 'package:flutter/material.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/network/api_client.dart';
import '../../data/data_sources/booking_remote_data_source.dart';
import '../../data/repositories/booking_repository_impl.dart';
import '../controllers/booking_controller.dart';
import '../../../../shared/widgets/app_card.dart';

class BookingScreen extends StatefulWidget {
  const BookingScreen({super.key});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  late final BookingController _controller;

  @override
  void initState() {
    super.initState();
    final apiClient = ApiClient();
    final dataSource = BookingRemoteDataSource(apiClient);
    final repository = BookingRepositoryImpl(dataSource);
    _controller = BookingController(bookingRepository: repository);

    _controller.addListener(_onControllerUpdate);
    _controller.fetchMyBookings();
  }

  void _onControllerUpdate() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _controller.removeListener(_onControllerUpdate);
    _controller.dispose();
    super.dispose();
  }

  String _formatDateTime(DateTime date) {
    return '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')} - ${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'ĐẶT SÂN CỦA TÔI',
          style: TextStyle(fontWeight: FontWeight.w900),
        ),
      ),
      body: _controller.isLoading
          ? const Center(child: CircularProgressIndicator())
          : _controller.errorMessage != null
              ? Center(child: Text(_controller.errorMessage!))
              : _controller.myBookings.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.calendar_today_rounded,
                            size: 80,
                            color: AppTheme.primaryColor.withValues(alpha: 0.5),
                          ),
                          const SizedBox(height: 20),
                          const Text(
                            'Chưa có lịch đặt sân',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            'Bạn chưa có lịch đặt sân nào. Hãy tạo lịch đặt sân ngay!',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: isDark ? Colors.grey[400] : Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _controller.myBookings.length,
                      itemBuilder: (context, index) {
                        final booking = _controller.myBookings[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: AppCard(
                            padding: const EdgeInsets.all(16),
                            backgroundColor: isDark ? null : Colors.white,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        booking.facilityName ?? 'Sân không tên',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: booking.statusName == 'Completed'
                                            ? Colors.green.withValues(alpha: 0.2)
                                            : AppTheme.primaryColor.withValues(alpha: 0.2),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        booking.statusName ?? 'Chờ xác nhận',
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: booking.statusName == 'Completed'
                                              ? Colors.green
                                              : AppTheme.primaryColor,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  booking.courtName ?? 'Chưa rõ',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: isDark ? Colors.white70 : Colors.black87,
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    const Icon(Icons.access_time_rounded, size: 16, color: Colors.grey),
                                    const SizedBox(width: 8),
                                    Text(
                                      '${_formatDateTime(booking.startTime)} đến ${_formatDateTime(booking.endTime)}',
                                      style: const TextStyle(fontSize: 13, color: Colors.grey),
                                    ),
                                  ],
                                ),
                                if (booking.totalCost != null) ...[
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      const Icon(Icons.payments_outlined, size: 16, color: Colors.grey),
                                      const SizedBox(width: 8),
                                      Text(
                                        '${booking.totalCost!.toStringAsFixed(0)} VND',
                                        style: const TextStyle(fontSize: 13, color: Colors.grey),
                                      ),
                                    ],
                                  ),
                                ]
                              ],
                            ),
                          ),
                        );
                      },
                    ),
    );
  }
}
