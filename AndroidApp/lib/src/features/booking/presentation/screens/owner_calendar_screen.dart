// ignore_for_file: use_build_context_synchronously
import 'package:flutter/material.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/network/api_client.dart';

class OwnerCalendarScreen extends StatefulWidget {
  const OwnerCalendarScreen({super.key});

  @override
  State<OwnerCalendarScreen> createState() => _OwnerCalendarScreenState();
}

class _OwnerCalendarScreenState extends State<OwnerCalendarScreen> {
  final ApiClient _apiClient = ApiClient();
  bool _isLoading = true;
  String? _errorMessage;

  List<dynamic> _facilities = [];
  dynamic _selectedFacility;
  DateTime _selectedDate = DateTime.now();
  List<dynamic> _courtAvailabilities = [];

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await _apiClient.get('/api/facilities/my');
      if (response.data['success'] == true) {
        _facilities = response.data['data'] as List<dynamic>? ?? [];
        if (_facilities.isNotEmpty) {
          _selectedFacility = _facilities.first;
        }
      }

      if (_selectedFacility != null) {
        await _loadSchedule();
      } else {
        setState(() {
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Lỗi kết nối khi tải danh sách cơ sở';
        _isLoading = false;
      });
    }
  }

  Future<void> _loadSchedule() async {
    if (_selectedFacility == null) return;
    setState(() {
      _isLoading = true;
    });

    try {
      final dateStr =
          '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}';
      final response = await _apiClient.get(
        '/api/facilities/${_selectedFacility['facilityId']}/courts/status',
        queryParameters: {'date': dateStr},
      );

      if (response.data['success'] == true) {
        setState(() {
          _courtAvailabilities = response.data['data'] as List<dynamic>? ?? [];
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lỗi tải lịch đặt sân của cơ sở')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _handleBookOfflineSlot(int courtId, String courtName, dynamic slot) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Đặt giữ sân thủ công?', style: TextStyle(fontWeight: FontWeight.bold)),
        content: Text(
          'Bạn muốn đặt giữ sân "$courtName" cho khung giờ ${slot['startTime']} - ${slot['endTime']} không?\n(Dành cho khách gọi điện/khách vãng lai)',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Hủy')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryColor),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Xác nhận đặt', style: TextStyle(color: Colors.black)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      setState(() {
        _isLoading = true;
      });

      try {
        DateTime parseTime(String timeStr) {
          final parts = timeStr.split(':');
          final hour = int.parse(parts[0]);
          final minute = int.parse(parts[1]);
          return DateTime(_selectedDate.year, _selectedDate.month, _selectedDate.day, hour, minute);
        }

        final startDateTime = parseTime(slot['startTime']);
        final endDateTime = parseTime(slot['endTime']);

        final requestBody = {
          'courtId': courtId,
          'startTime': startDateTime.toIso8601String(),
          'endTime': endDateTime.toIso8601String(),
        };

        final response = await _apiClient.post(
          '/api/bookings',
          data: requestBody,
        );

        if (response.data['success'] == true) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Đã đặt giữ sân thành công!')),
          );
          _loadSchedule();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(response.data['message'] ?? 'Đặt sân thất bại')),
          );
          setState(() {
            _isLoading = false;
          });
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Lỗi kết nối khi đặt giữ sân')),
        );
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _handleCancelBooking(String bookingId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xác nhận hủy đặt sân?', style: TextStyle(fontWeight: FontWeight.bold)),
        content: const Text('Bạn có chắc chắn muốn hủy lịch đặt sân này không?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Không')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Có, Hủy', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      setState(() {
        _isLoading = true;
      });

      try {
        final response = await _apiClient.delete('/api/bookings/$bookingId');
        if (response.data['success'] == true) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Đã hủy lịch đặt sân thành công.')),
          );
          _loadSchedule();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(response.data['message'] ?? 'Hủy lịch đặt sân thất bại')),
          );
          setState(() {
            _isLoading = false;
          });
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Lỗi kết nối máy chủ')),
        );
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_errorMessage != null) {
      return Scaffold(
        appBar: AppBar(title: const Text('LỊCH ĐẶT SÂN TỔNG HỢP')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 64, color: Colors.red),
                const SizedBox(height: 16),
                Text(_errorMessage!, style: const TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _loadInitialData,
                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryColor),
                  child: const Text('Thử lại', style: TextStyle(color: Colors.black)),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'LỊCH ĐẶT TỔNG HỢP',
          style: TextStyle(fontWeight: FontWeight.w900),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _loadSchedule,
          ),
        ],
      ),
      body: _isLoading && _facilities.isEmpty
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
              ),
            )
          : _facilities.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.business_rounded, size: 80, color: AppTheme.primaryColor.withValues(alpha: 0.4)),
                      const SizedBox(height: 16),
                      const Text(
                        'Chưa có cơ sở nào được đăng ký',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                    ],
                  ),
                )
              : Column(
                  children: [
                    // Facility Selector & Date Picker Row
                    Container(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          DropdownButtonFormField<dynamic>(
                            initialValue: _selectedFacility,
                            decoration: InputDecoration(
                              labelText: 'Cơ sở kinh doanh',
                              filled: true,
                              fillColor: isDark ? AppTheme.darkSurfaceColor : Colors.grey[100],
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            items: _facilities.map((fac) {
                              return DropdownMenuItem<dynamic>(
                                value: fac,
                                child: Text(fac['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
                              );
                            }).toList(),
                            onChanged: (value) {
                              setState(() {
                                _selectedFacility = value;
                              });
                              _loadSchedule();
                            },
                          ),
                          const SizedBox(height: 12),
                          // Date Picker button
                          InkWell(
                            onTap: () async {
                              final picked = await showDatePicker(
                                context: context,
                                initialDate: _selectedDate,
                                firstDate: DateTime.now().subtract(const Duration(days: 30)),
                                lastDate: DateTime.now().add(const Duration(days: 90)),
                              );
                              if (picked != null) {
                                setState(() {
                                  _selectedDate = picked;
                                });
                                _loadSchedule();
                              }
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                              decoration: BoxDecoration(
                                color: isDark ? AppTheme.darkSurfaceColor : Colors.grey[100],
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.grey),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.calendar_month_rounded, color: AppTheme.primaryColor),
                                      const SizedBox(width: 12),
                                      Text(
                                        'Ngày xem: ${_formatDate(_selectedDate)}',
                                        style: const TextStyle(fontWeight: FontWeight.bold),
                                      ),
                                    ],
                                  ),
                                  const Icon(Icons.arrow_drop_down),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Divider(),

                    // Courts scheduler grid
                    Expanded(
                      child: _isLoading
                          ? const Center(
                              child: CircularProgressIndicator(
                                valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
                              ),
                            )
                          : _courtAvailabilities.isEmpty
                              ? const Center(
                                  child: Text('Chưa có lịch đặt sân hoặc không có sân hoạt động.', style: TextStyle(color: Colors.grey)),
                                )
                              : ListView.builder(
                                  padding: const EdgeInsets.all(16),
                                  itemCount: _courtAvailabilities.length,
                                  itemBuilder: (context, index) {
                                    final court = _courtAvailabilities[index];
                                    final List<dynamic> slots = court['timeSlots'] as List<dynamic>? ?? [];

                                    return Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Padding(
                                          padding: const EdgeInsets.symmetric(vertical: 8),
                                          child: Text(
                                            (court['courtName'] as String).toUpperCase(),
                                            style: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.1),
                                          ),
                                        ),
                                        SingleChildScrollView(
                                          scrollDirection: Axis.horizontal,
                                          child: Row(
                                            children: slots.map((slot) {
                                              final isBooked = slot['status'] == 'Booked';
                                              final isMaintenance = slot['status'] == 'Maintenance';
                                              
                                              Color cardColor;
                                              if (isBooked) {
                                                cardColor = Colors.red.withValues(alpha: 0.15);
                                              } else if (isMaintenance) {
                                                cardColor = Colors.grey;
                                              } else {
                                                cardColor = AppTheme.primaryColor.withValues(alpha: 0.15);
                                              }

                                              return InkWell(
                                                onTap: () {
                                                  if (isBooked && slot['bookingId'] != null) {
                                                    // Hủy booking
                                                    _handleCancelBooking(slot['bookingId']);
                                                  } else if (!isBooked && !isMaintenance) {
                                                    // Đặt offline
                                                    _handleBookOfflineSlot(
                                                      court['courtId'],
                                                      court['courtName'],
                                                      slot,
                                                    );
                                                  }
                                                },
                                                child: Container(
                                                  margin: const EdgeInsets.only(right: 10, bottom: 8),
                                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                                  decoration: BoxDecoration(
                                                    color: cardColor,
                                                    borderRadius: BorderRadius.circular(10),
                                                    border: Border.all(
                                                      color: isBooked ? Colors.red : AppTheme.primaryColor,
                                                    ),
                                                  ),
                                                  child: Column(
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    children: [
                                                      Text(
                                                        '${slot['startTime']} - ${slot['endTime']}',
                                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                                      ),
                                                      const SizedBox(height: 4),
                                                      Text(
                                                        isBooked
                                                            ? (slot['bookedByUserName'] ?? 'Đã đặt')
                                                            : isMaintenance
                                                                ? 'Bảo trì'
                                                                : 'Còn trống',
                                                        style: TextStyle(
                                                          fontSize: 11,
                                                          color: isBooked ? Colors.red[300] : Colors.grey,
                                                          fontWeight: FontWeight.bold,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              );
                                            }).toList(),
                                          ),
                                        ),
                                        const SizedBox(height: 16),
                                      ],
                                    );
                                  },
                                ),
                    ),
                  ],
                ),
    );
  }
}
