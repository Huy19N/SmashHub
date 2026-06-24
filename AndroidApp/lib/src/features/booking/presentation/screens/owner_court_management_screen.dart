import 'package:flutter/material.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/network/api_client.dart';
import '../../../../shared/widgets/app_card.dart';

class OwnerCourtManagementScreen extends StatefulWidget {
  const OwnerCourtManagementScreen({super.key});

  @override
  State<OwnerCourtManagementScreen> createState() => _OwnerCourtManagementScreenState();
}

class _OwnerCourtManagementScreenState extends State<OwnerCourtManagementScreen> {
  final ApiClient _apiClient = ApiClient();
  bool _isLoading = true;
  String? _errorMessage;

  List<dynamic> _facilities = [];
  dynamic _selectedFacility;
  List<dynamic> _courts = [];
  List<dynamic> _sports = [];

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
      // 1. Tải danh sách sân chơi của tôi (owner)
      final facRes = await _apiClient.get('/api/facilities/my');
      // 2. Tải danh sách môn thể thao để tạo sân mới
      final sportsRes = await _apiClient.get('/api/sports');

      if (facRes.data['success'] == true) {
        _facilities = facRes.data['data'] as List<dynamic>? ?? [];
        if (_facilities.isNotEmpty) {
          _selectedFacility = _facilities.first;
        }
      }

      if (sportsRes.data['success'] == true) {
        _sports = sportsRes.data['data'] as List<dynamic>? ?? [];
      }

      if (_selectedFacility != null) {
        await _loadCourts(_selectedFacility['facilityId']);
      } else {
        setState(() {
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Lỗi kết nối khi tải danh sách cơ sở sân chơi';
        _isLoading = false;
      });
    }
  }

  Future<void> _loadCourts(int facilityId) async {
    setState(() {
      _isLoading = true;
    });
    try {
      final response = await _apiClient.get('/api/facilities/$facilityId/courts');
      if (response.data['success'] == true) {
        setState(() {
          _courts = response.data['data'] as List<dynamic>? ?? [];
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lỗi tải danh sách sân con')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _handleCreateCourt() async {
    if (_selectedFacility == null) return;
    
    final nameController = TextEditingController();
    dynamic selectedSport = _sports.isNotEmpty ? _sports.first : null;

    final created = await showDialog<bool>(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: const Text('Thêm Sân Con Mới', style: TextStyle(fontWeight: FontWeight.bold)),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: nameController,
                    decoration: const InputDecoration(
                      labelText: 'Tên Sân (Ví dụ: Sân 1, Sân A...)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<dynamic>(
                    value: selectedSport,
                    decoration: const InputDecoration(
                      labelText: 'Bộ Môn Thể Thao',
                      border: OutlineInputBorder(),
                    ),
                    items: _sports.map((sport) {
                      return DropdownMenuItem<dynamic>(
                        value: sport,
                        child: Text(sport['sportName'] ?? ''),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setDialogState(() {
                        selectedSport = value;
                      });
                    },
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context, false),
                  child: const Text('Hủy'),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryColor),
                  onPressed: () async {
                    if (nameController.text.trim().isEmpty || selectedSport == null) return;
                    
                    try {
                      final facilityId = _selectedFacility['facilityId'];
                      final requestBody = {
                        'facilityId': facilityId,
                        'sportId': selectedSport['sportId'],
                        'courtName': nameController.text.trim(),
                      };

                      final response = await _apiClient.post(
                        '/api/facilities/$facilityId/courts',
                        data: requestBody,
                      );

                      if (response.data['success'] == true) {
                        Navigator.pop(context, true);
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(response.data['message'] ?? 'Thêm sân thất bại')),
                        );
                      }
                    } catch (e) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Lỗi kết nối máy chủ')),
                      );
                    }
                  },
                  child: const Text('Thêm', style: TextStyle(color: Colors.black)),
                ),
              ],
            );
          },
        );
      },
    );

    if (created == true) {
      _loadCourts(_selectedFacility['facilityId']);
    }
  }

  Future<void> _handleDeleteCourt(int courtId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xác nhận xóa?'),
        content: const Text('Bạn có chắc chắn muốn xóa sân con này khỏi hệ thống không?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Không')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Có, Xóa', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        final response = await _apiClient.delete('/api/courts/$courtId');
        if (response.data['success'] == true) {
          _loadCourts(_selectedFacility['facilityId']);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Đã xóa sân con thành công.')),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(response.data['message'] ?? 'Xóa sân con thất bại')),
          );
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Lỗi kết nối máy chủ')),
        );
      }
    }
  }

  void _showCourtPricing(dynamic court) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => CourtPricingManagementScreen(
          courtId: court['courtId'],
          courtName: court['courtName'],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_errorMessage != null) {
      return Scaffold(
        appBar: AppBar(title: const Text('QUẢN LÝ SÂN CHƠI')),
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
          'QUẢN LÝ SÂN CHƠI',
          style: TextStyle(fontWeight: FontWeight.w900),
        ),
        actions: [
          if (_selectedFacility != null)
            IconButton(
              tooltip: 'Thêm sân con',
              icon: const Icon(Icons.add_rounded, color: AppTheme.primaryColor),
              onPressed: _handleCreateCourt,
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
                      const SizedBox(height: 8),
                      const Text(
                        'Hãy nhấn nút tạo mới ở giữa thanh điều hướng để đăng ký cơ sở.',
                        style: TextStyle(color: Colors.grey, fontSize: 13),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                )
              : Column(
                  children: [
                    // Facility Selector Row
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: DropdownButtonFormField<dynamic>(
                        value: _selectedFacility,
                        decoration: InputDecoration(
                          labelText: 'Chọn cơ sở kinh doanh',
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
                          if (value != null) {
                            _loadCourts(value['facilityId']);
                          }
                        },
                      ),
                    ),
                    const Divider(),

                    // List of courts
                    Expanded(
                      child: _isLoading
                          ? const Center(
                              child: CircularProgressIndicator(
                                valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
                              ),
                            )
                          : _courts.isEmpty
                              ? const Center(
                                  child: Text('Cơ sở này chưa có sân con nào.', style: TextStyle(color: Colors.grey)),
                                )
                              : ListView.builder(
                                  padding: const EdgeInsets.all(16),
                                  itemCount: _courts.length,
                                  itemBuilder: (context, index) {
                                    final court = _courts[index];
                                    return Padding(
                                      padding: const EdgeInsets.only(bottom: 12),
                                      child: AppCard(
                                        padding: const EdgeInsets.all(16),
                                        child: Row(
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.all(12),
                                              decoration: BoxDecoration(
                                                color: AppTheme.primaryColor.withValues(alpha: 0.15),
                                                borderRadius: BorderRadius.circular(10),
                                              ),
                                              child: const Icon(Icons.sports_tennis_rounded, color: AppTheme.primaryColor),
                                            ),
                                            const SizedBox(width: 16),
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    court['courtName'] ?? '',
                                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                                  ),
                                                  const SizedBox(height: 4),
                                                  Text(
                                                    court['sportName'] ?? '',
                                                    style: const TextStyle(color: Colors.grey, fontSize: 13),
                                                  ),
                                                ],
                                              ),
                                            ),
                                            IconButton(
                                              tooltip: 'Cấu hình giá',
                                              icon: const Icon(Icons.payments_rounded, color: Colors.amber),
                                              onPressed: () => _showCourtPricing(court),
                                            ),
                                            IconButton(
                                              tooltip: 'Xóa sân',
                                              icon: const Icon(Icons.delete_outline_rounded, color: Colors.red),
                                              onPressed: () => _handleDeleteCourt(court['courtId']),
                                            ),
                                          ],
                                        ),
                                      ),
                                    );
                                  },
                                ),
                    ),
                  ],
                ),
    );
  }
}

// ─── Sub-page: CourtPricingManagementScreen ─────────────────────────
class CourtPricingManagementScreen extends StatefulWidget {
  final int courtId;
  final String courtName;

  const CourtPricingManagementScreen({
    super.key,
    required this.courtId,
    required this.courtName,
  });

  @override
  State<CourtPricingManagementScreen> createState() => _CourtPricingManagementScreenState();
}

class _CourtPricingManagementScreenState extends State<CourtPricingManagementScreen> {
  final ApiClient _apiClient = ApiClient();
  bool _isLoading = true;
  List<dynamic> _costs = [];

  @override
  void initState() {
    super.initState();
    _loadPricing();
  }

  Future<void> _loadPricing() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final response = await _apiClient.get('/api/courts/${widget.courtId}/costs');
      if (response.data['success'] == true) {
        setState(() {
          _costs = response.data['data'] as List<dynamic>? ?? [];
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lỗi tải bảng giá sân')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _handleAddPrice() async {
    int selectedDay = 2; // T2
    TimeOfDay startTime = const TimeOfDay(hour: 8, minute: 0);
    TimeOfDay endTime = const TimeOfDay(hour: 9, minute: 0);
    final costController = TextEditingController();

    final weekdays = [
      {'val': 2, 'label': 'Thứ Hai'},
      {'val': 3, 'label': 'Thứ Ba'},
      {'val': 4, 'label': 'Thứ Tư'},
      {'val': 5, 'label': 'Thứ Năm'},
      {'val': 6, 'label': 'Thứ Sáu'},
      {'val': 7, 'label': 'Thứ Bảy'},
      {'val': 8, 'label': 'Chủ Nhật'},
    ];

    final created = await showDialog<bool>(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: const Text('Thêm Khung Giá Mới', style: TextStyle(fontWeight: FontWeight.bold)),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    DropdownButtonFormField<int>(
                      value: selectedDay,
                      decoration: const InputDecoration(labelText: 'Thứ trong tuần', border: OutlineInputBorder()),
                      items: weekdays.map((day) {
                        return DropdownMenuItem<int>(
                          value: day['val'] as int,
                          child: Text(day['label'] as String),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) {
                          setDialogState(() {
                            selectedDay = val;
                          });
                        }
                      },
                    ),
                    const SizedBox(height: 16),
                    ListTile(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                        side: const BorderSide(color: Colors.grey),
                      ),
                      title: Text('Giờ Bắt Đầu: ${startTime.format(context)}'),
                      trailing: const Icon(Icons.access_time),
                      onTap: () async {
                        final picked = await showTimePicker(context: context, initialTime: startTime);
                        if (picked != null) {
                          setDialogState(() {
                            startTime = picked;
                          });
                        }
                      },
                    ),
                    const SizedBox(height: 12),
                    ListTile(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                        side: const BorderSide(color: Colors.grey),
                      ),
                      title: Text('Giờ Kết Thúc: ${endTime.format(context)}'),
                      trailing: const Icon(Icons.access_time),
                      onTap: () async {
                        final picked = await showTimePicker(context: context, initialTime: endTime);
                        if (picked != null) {
                          setDialogState(() {
                            endTime = picked;
                          });
                        }
                      },
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: costController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Đơn giá (VND/giờ)',
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Hủy')),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryColor),
                  onPressed: () async {
                    final costVal = double.tryParse(costController.text);
                    if (costVal == null || costVal <= 0) return;

                    // Calculate duration minutes
                    final startMin = startTime.hour * 60 + startTime.minute;
                    final endMin = endTime.hour * 60 + endTime.minute;
                    final duration = endMin - startMin;
                    if (duration <= 0) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Giờ kết thúc phải lớn hơn giờ bắt đầu')),
                      );
                      return;
                    }

                    try {
                      final formatTime = (TimeOfDay t) =>
                          '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}:00';

                      final requestBody = {
                        'courtId': widget.courtId,
                        'dayOfWeek': selectedDay,
                        'startTime': formatTime(startTime),
                        'endTime': formatTime(endTime),
                        'durationMinutes': duration,
                        'cost': costVal,
                      };

                      final response = await _apiClient.post(
                        '/api/courts/${widget.courtId}/costs',
                        data: requestBody,
                      );

                      if (response.data['success'] == true) {
                        Navigator.pop(context, true);
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(response.data['message'] ?? 'Thêm khung giá thất bại')),
                        );
                      }
                    } catch (e) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Lỗi kết nối máy chủ')),
                      );
                    }
                  },
                  child: const Text('Thêm', style: TextStyle(color: Colors.black)),
                ),
              ],
            );
          },
        );
      },
    );

    if (created == true) {
      _loadPricing();
    }
  }

  Future<void> _handleDeletePrice(int courtCostId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xác nhận xóa giá?'),
        content: const Text('Bạn có chắc chắn muốn xóa khung giờ giá này khỏi sân?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Hủy')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Xóa', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        final response = await _apiClient.delete('/api/court-costs/$courtCostId');
        if (response.data['success'] == true) {
          _loadPricing();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Đã xóa khung giá thành công.')),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(response.data['message'] ?? 'Xóa khung giá thất bại')),
          );
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Lỗi kết nối máy chủ')),
        );
      }
    }
  }

  String _getDayLabel(int day) {
    final labels = {
      2: 'Thứ Hai',
      3: 'Thứ Ba',
      4: 'Thứ Tư',
      5: 'Thứ Năm',
      6: 'Thứ Sáu',
      7: 'Thứ Bảy',
      8: 'Chủ Nhật',
    };
    return labels[day] ?? 'Chưa rõ';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'BẢNG GIÁ: ${widget.courtName.toUpperCase()}',
          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_rounded, color: AppTheme.primaryColor),
            onPressed: _handleAddPrice,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
              ),
            )
          : _costs.isEmpty
              ? const Center(child: Text('Chưa có cấu hình giá cho sân này.', style: TextStyle(color: Colors.grey)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _costs.length,
                  itemBuilder: (context, index) {
                    final cost = _costs[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: AppCard(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _getDayLabel(cost['dayOfWeek']),
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(Icons.access_time_rounded, size: 14, color: Colors.grey),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${cost['startTime'].substring(0, 5)} - ${cost['endTime'].substring(0, 5)}',
                                      style: const TextStyle(color: Colors.grey, fontSize: 13),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            Row(
                              children: [
                                Text(
                                  '${(cost['cost'] as num).toStringAsFixed(0)} VND',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                    color: AppTheme.primaryColor,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline_rounded, color: Colors.red),
                                  onPressed: () => _handleDeletePrice(cost['courtCostId']),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
