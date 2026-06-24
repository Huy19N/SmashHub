import 'package:flutter/material.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/network/api_client.dart';

class CreateScheduleScreen extends StatefulWidget {
  final String teamId;
  const CreateScheduleScreen({super.key, required this.teamId});

  @override
  State<CreateScheduleScreen> createState() => _CreateScheduleScreenState();
}

class _CreateScheduleScreenState extends State<CreateScheduleScreen> {
  final ApiClient _apiClient = ApiClient();
  final _formKey = GlobalKey<FormState>();

  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _maxParticipantsController = TextEditingController(text: '12');
  final TextEditingController _costPerPersonController = TextEditingController();
  final TextEditingController _costNoteController = TextEditingController();

  List<dynamic> _myBookings = [];
  dynamic _selectedBooking;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadMyBookings();
  }

  Future<void> _loadMyBookings() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await _apiClient.get(
        '/api/bookings/my',
        queryParameters: {'PageNumber': 1, 'PageSize': 50},
      );
      final data = response.data;
      if (data['success'] == true && data['data'] != null) {
        final list = data['data']['items'] as List<dynamic>? ?? [];
        // Lọc các booking ở trạng thái Confirmed (StatusId = 2) hoặc Completed
        setState(() {
          _myBookings = list.where((b) => b['statusId'] == 2).toList();
          if (_myBookings.isNotEmpty) {
            _selectedBooking = _myBookings.first;
          }
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Lỗi kết nối khi tải danh sách lịch đặt sân của bạn';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  String _formatDateTime(String isoStr) {
    final date = DateTime.parse(isoStr);
    return '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')} - ${date.day}/${date.month}/${date.year}';
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedBooking == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng đặt sân trước và chọn lịch đặt sân để liên kết!'), backgroundColor: Colors.orange),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final requestBody = {
        'bookingId': _selectedBooking['bookingId'],
        'title': _titleController.text.trim(),
        'maxParticipants': int.tryParse(_maxParticipantsController.text) ?? 10,
        'costPerPerson': double.tryParse(_costPerPersonController.text),
        'costNote': _costNoteController.text.trim(),
      };

      final response = await _apiClient.post(
        '/api/teams/${widget.teamId}/schedules',
        data: requestBody,
      );

      if (response.data['success'] == true) {
        if (mounted) {
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (context) => AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: const Row(
                children: [
                  Icon(Icons.check_circle_rounded, color: Colors.green, size: 28),
                  SizedBox(width: 8),
                  Text('Tạo lịch chơi thành công!'),
                ],
              ),
              content: const Text('Buổi giao lưu nhóm mới đã được tạo và thông báo đến các thành viên.'),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(context); // Đóng dialog
                    Navigator.pop(context, true); // Trở về và reload
                  },
                  child: const Text('Đồng ý', style: TextStyle(color: AppTheme.primaryColor)),
                )
              ],
            ),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(response.data['message'] ?? 'Tạo lịch chơi thất bại'), backgroundColor: Colors.red),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Lỗi kết nối máy chủ'), backgroundColor: Colors.red),
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

    if (_errorMessage != null) {
      return Scaffold(
        appBar: AppBar(title: const Text('TẠO BUỔI GIAO LƯU')),
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
                  onPressed: _loadMyBookings,
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
          'TẠO BUỔI GIAO LƯU',
          style: TextStyle(fontWeight: FontWeight.w900),
        ),
      ),
      body: _isLoading && _myBookings.isEmpty
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildTextField(
                      controller: _titleController,
                      label: 'Tiêu Đề Buổi Giao Lưu *',
                      icon: Icons.title_rounded,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) return 'Vui lòng nhập tiêu đề';
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Dropdown booking link
                    if (_myBookings.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.orange.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.orange),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.warning_amber_rounded, color: Colors.orange),
                            SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                'Bạn chưa có lịch đặt sân nào đã xác nhận/thanh toán. Vui lòng đặt sân trước khi tạo buổi giao lưu nhóm.',
                                style: TextStyle(color: Colors.orange, fontSize: 13, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                      )
                    else
                      DropdownButtonFormField<dynamic>(
                        value: _selectedBooking,
                        decoration: InputDecoration(
                          labelText: 'Chọn lịch đặt sân để liên kết *',
                          filled: true,
                          fillColor: isDark ? AppTheme.darkSurfaceColor : Colors.grey[100],
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        items: _myBookings.map((booking) {
                          final label =
                              '${booking['facilityName']} - ${booking['courtName']} (${_formatDateTime(booking['startTime'])})';
                          return DropdownMenuItem<dynamic>(
                            value: booking,
                            child: Text(
                              label,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                              overflow: TextOverflow.ellipsis,
                            ),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setState(() {
                            _selectedBooking = value;
                          });
                        },
                      ),
                    const SizedBox(height: 16),

                    _buildTextField(
                      controller: _maxParticipantsController,
                      label: 'Số Lượng Thành Viên Tối Đa *',
                      icon: Icons.people_outline_rounded,
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value == null || int.tryParse(value) == null || int.parse(value) <= 0) {
                          return 'Vui lòng nhập số lượng hợp lệ';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    _buildTextField(
                      controller: _costPerPersonController,
                      label: 'Chi Phí Ước Tính/Người (VND)',
                      icon: Icons.payments_outlined,
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 16),

                    _buildTextField(
                      controller: _costNoteController,
                      label: 'Ghi Chú Chi Phí (Ví dụ: Đã bao gồm nước, cầu...)',
                      icon: Icons.note_rounded,
                    ),
                    const SizedBox(height: 32),

                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryColor,
                          foregroundColor: Colors.black,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: _isLoading ? null : _handleSubmit,
                        child: const Text(
                          'TẠO LỊCH GIAO LƯU',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      validator: validator,
      style: const TextStyle(fontWeight: FontWeight.bold),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[750]),
        prefixIcon: Icon(icon, color: AppTheme.primaryColor),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppTheme.primaryColor, width: 2),
        ),
        filled: true,
        fillColor: isDark ? AppTheme.darkSurfaceColor : Colors.grey[100],
      ),
    );
  }
}
