import 'package:flutter/material.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/network/api_client.dart';
import '../../../../shared/widgets/app_card.dart';

class AttendanceScreen extends StatefulWidget {
  final String scheduleId;
  final String scheduleTitle;

  const AttendanceScreen({
    super.key,
    required this.scheduleId,
    required this.scheduleTitle,
  });

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  final ApiClient _apiClient = ApiClient();
  bool _isLoading = true;
  List<dynamic> _participants = [];

  @override
  void initState() {
    super.initState();
    _loadParticipants();
  }

  Future<void> _loadParticipants() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final response = await _apiClient.get('/api/schedules/${widget.scheduleId}/participants');
      if (response.data['success'] == true) {
        setState(() {
          _participants = response.data['data'] as List<dynamic>? ?? [];
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lỗi tải danh sách người tham gia')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _toggleAttendance(dynamic participant, bool isAttended) async {
    setState(() {
      _isLoading = true;
    });

    try {
      final response = await _apiClient.patch(
        '/api/schedules/${widget.scheduleId}/participants/${participant['userId']}/attendance',
        data: {'isAttended': isAttended},
      );

      if (response.data['success'] == true) {
        // Cập nhật local
        setState(() {
          participant['isAttended'] = isAttended;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Điểm danh ${participant['fullName']} thành công!'),
            duration: const Duration(seconds: 1),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(response.data['message'] ?? 'Điểm danh thất bại')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lỗi kết nối máy chủ')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'ĐIỂM DANH THÀNH VIÊN',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
            ),
            Text(
              widget.scheduleTitle,
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
      ),
      body: _isLoading && _participants.isEmpty
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
              ),
            )
          : _participants.isEmpty
              ? const Center(
                  child: Text(
                    'Không có ai đăng ký tham gia lịch chơi này.',
                    style: TextStyle(color: Colors.grey),
                  ),
                )
              : Column(
                  children: [
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _participants.length,
                        itemBuilder: (context, index) {
                          final p = _participants[index];
                          final isAttended = p['isAttended'] as bool? ?? false;

                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: AppCard(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.2),
                                    child: Text(
                                      p['fullName'] != null && (p['fullName'] as String).isNotEmpty
                                          ? (p['fullName'] as String)[0].toUpperCase()
                                          : 'U',
                                      style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Text(
                                      p['fullName'] ?? '',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                    ),
                                  ),
                                  Switch(
                                    activeColor: AppTheme.primaryColor,
                                    value: isAttended,
                                    onChanged: (val) => _toggleAttendance(p, val),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    SafeArea(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: SizedBox(
                          width: double.infinity,
                          height: 50,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.primaryColor,
                              foregroundColor: Colors.black,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            onPressed: () => Navigator.pop(context),
                            child: const Text('HOÀN TẤT', style: TextStyle(fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }
}
