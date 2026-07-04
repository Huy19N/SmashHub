import 'package:flutter/material.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/network/api_client.dart';
import '../../../../shared/widgets/app_card.dart';

class SplitBillScreen extends StatefulWidget {
  final String scheduleId;
  final String scheduleTitle;

  const SplitBillScreen({
    super.key,
    required this.scheduleId,
    required this.scheduleTitle,
  });

  @override
  State<SplitBillScreen> createState() => _SplitBillScreenState();
}

class _SplitBillScreenState extends State<SplitBillScreen> {
  final ApiClient _apiClient = ApiClient();
  final _formKey = GlobalKey<FormState>();

  final TextEditingController _extraFeeController = TextEditingController(text: '0');
  final TextEditingController _extraFeeNoteController = TextEditingController();
  final TextEditingController _fixedCostController = TextEditingController();

  bool _isLoading = true;
  String _splitMode = 'auto'; // 'auto', 'fixed', 'custom'
  List<dynamic> _participants = [];

  final Map<String, TextEditingController> _customCourtCostControllers = {};
  final Map<String, TextEditingController> _customExtraFeeControllers = {};

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
        final data = response.data['data'] as List<dynamic>? ?? [];
        setState(() {
          _participants = data;

          _customCourtCostControllers.clear();
          _customExtraFeeControllers.clear();

          for (var p in data) {
            final userId = p['userId'] as String;
            _customCourtCostControllers[userId] = TextEditingController(text: '0');
            _customExtraFeeControllers[userId] = TextEditingController(text: '0');
          }
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lỗi tải danh sách thành viên')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _calculateSplitBill() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final extraFee = double.tryParse(_extraFeeController.text) ?? 0.0;
      final fixedCost = _splitMode == 'fixed' ? double.tryParse(_fixedCostController.text) : null;

      Map<String, double>? customAmounts;
      double totalCustomExtra = 0.0;

      if (_splitMode == 'custom') {
        customAmounts = {};
        int participantCount = _participants.where((p) => p['isAttended'] == true).length;
        if (participantCount == 0) participantCount = 1; // avoid divide by 0
        
        for (var p in _participants) {
          if (p['isAttended'] == true) {
            final userId = p['userId'] as String;
            final userExtraFee = double.tryParse(_customExtraFeeControllers[userId]?.text ?? '0') ?? 0.0;
            totalCustomExtra += userExtraFee;
          }
        }
        
        final averageExtra = totalCustomExtra / participantCount;
        
        for (var p in _participants) {
          if (p['isAttended'] == true) {
             final userId = p['userId'] as String;
             final userCourtCost = double.tryParse(_customCourtCostControllers[userId]?.text ?? '0') ?? 0.0;
             final userExtraFee = double.tryParse(_customExtraFeeControllers[userId]?.text ?? '0') ?? 0.0;
             
             customAmounts[userId] = userCourtCost + userExtraFee - averageExtra;
          }
        }
      }

      final requestBody = {
        'extraFee': _splitMode == 'custom' ? totalCustomExtra : extraFee,
        'extraFeeNote': _extraFeeNoteController.text.trim(),
        'fixedAmountPerPerson': fixedCost,
        'customAmounts': customAmounts,
      };

      final response = await _apiClient.post(
        '/api/schedules/${widget.scheduleId}/calculate-split-bill',
        data: requestBody,
      );

      if (response.data['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Tính toán chia phí thành công!')),
        );
        // Tải lại danh sách để hiển thị số tiền từng người
        await _loadParticipants();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(response.data['message'] ?? 'Chia phí thất bại')),
        );
        setState(() {
          _isLoading = false;
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lỗi kết nối máy chủ khi chia phí')),
      );
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _togglePaymentPaid(dynamic participant, bool isPaid) async {
    setState(() {
      _isLoading = true;
    });

    try {
      final response = await _apiClient.patch(
        '/api/schedules/${widget.scheduleId}/participants/${participant['userId']}/split-bill',
        data: {
          'costToPay': (participant['costToPay'] as num?)?.toDouble() ?? 0.0,
          'isPaid': isPaid,
        },
      );

      if (response.data['success'] == true) {
        setState(() {
          participant['isPaid'] = isPaid;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Cập nhật đóng tiền cho ${participant['fullName']} thành công!'),
            duration: const Duration(seconds: 1),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(response.data['message'] ?? 'Lỗi cập nhật đóng tiền')),
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
  void dispose() {
    _extraFeeController.dispose();
    _extraFeeNoteController.dispose();
    _fixedCostController.dispose();
    for (var controller in _customCourtCostControllers.values) {
      controller.dispose();
    }
    for (var controller in _customExtraFeeControllers.values) {
      controller.dispose();
    }
    super.dispose();
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
              'CHIA TIỀN SÂN & PHỤ PHÍ',
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
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Form config
                  Form(
                    key: _formKey,
                    child: AppCard(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'CẤU HÌNH PHÍ PHÁT SINH',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                          const SizedBox(height: 12),
                          if (_splitMode != 'custom') ...[
                            _buildTextField(
                              controller: _extraFeeController,
                              label: 'Phụ phí phát sinh (Cầu, bóng, nước...) (VND)',
                              icon: Icons.payments_rounded,
                              keyboardType: TextInputType.number,
                            ),
                            const SizedBox(height: 12),
                          ],
                          _buildTextField(
                            controller: _extraFeeNoteController,
                            label: 'Chi tiết phụ phí',
                            icon: Icons.note_add_rounded,
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'CHẾ ĐỘ CHIA TIỀN',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                          const SizedBox(height: 8),
                          Wrap(
                            crossAxisAlignment: WrapCrossAlignment.center,
                            spacing: 8,
                            runSpacing: 4,
                            children: [
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Radio<String>(
                                    value: 'auto',
                                    groupValue: _splitMode,
                                    activeColor: AppTheme.primaryColor,
                                    onChanged: (value) {
                                      if (value != null) setState(() => _splitMode = value);
                                    },
                                  ),
                                  const Text('Chia đều (Auto)', style: TextStyle(fontWeight: FontWeight.bold)),
                                ],
                              ),
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Radio<String>(
                                    value: 'fixed',
                                    groupValue: _splitMode,
                                    activeColor: AppTheme.primaryColor,
                                    onChanged: (value) {
                                      if (value != null) setState(() => _splitMode = value);
                                    },
                                  ),
                                  const Text('Mức cố định', style: TextStyle(fontWeight: FontWeight.bold)),
                                ],
                              ),
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Radio<String>(
                                    value: 'custom',
                                    groupValue: _splitMode,
                                    activeColor: AppTheme.primaryColor,
                                    onChanged: (value) {
                                      if (value != null) setState(() => _splitMode = value);
                                    },
                                  ),
                                  const Text('Tùy chỉnh', style: TextStyle(fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ],
                          ),
                          if (_splitMode == 'fixed') ...[
                            const SizedBox(height: 12),
                            _buildTextField(
                              controller: _fixedCostController,
                              label: 'Phí cố định mỗi người (VND)',
                              icon: Icons.person_pin_rounded,
                              keyboardType: TextInputType.number,
                              validator: (value) {
                                if (_splitMode == 'fixed' &&
                                    (value == null || double.tryParse(value) == null || double.parse(value) <= 0)) {
                                  return 'Mức phí cố định không hợp lệ';
                                }
                                return null;
                              },
                            ),
                          ],
                          const SizedBox(height: 20),
                          SizedBox(
                            width: double.infinity,
                            height: 48,
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primaryColor,
                                foregroundColor: Colors.black,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              onPressed: _calculateSplitBill,
                              child: const Text('TÍNH TOÁN & CHIA PHÍ', style: TextStyle(fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Participants Payment List
                  const Text(
                    'TRẠNG THÁI ĐÓNG TIỀN THÀNH VIÊN',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                  ),
                  const SizedBox(height: 12),
                  if (_participants.isEmpty)
                    const Center(child: Text('Không có thành viên tham gia chơi.', style: TextStyle(color: Colors.grey)))
                  else
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _participants.length,
                      itemBuilder: (context, index) {
                        final p = _participants[index];
                        final isAttended = p['isAttended'] as bool? ?? false;
                        final costToPay = (p['costToPay'] as num?)?.toDouble() ?? 0.0;
                        final isPaid = p['isPaid'] as bool? ?? false;

                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: AppCard(
                            padding: const EdgeInsets.all(16),
                            child: Row(
                              children: [
                                CircleAvatar(
                                  backgroundColor: isAttended
                                      ? AppTheme.primaryColor.withValues(alpha: 0.15)
                                      : Colors.grey.withValues(alpha: 0.15),
                                  child: Text(
                                    p['fullName'] != null && (p['fullName'] as String).isNotEmpty
                                        ? (p['fullName'] as String)[0].toUpperCase()
                                        : 'U',
                                    style: TextStyle(
                                      color: isAttended ? AppTheme.primaryColor : Colors.grey,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(p['fullName'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
                                      const SizedBox(height: 4),
                                      Text(
                                        isAttended ? 'Điểm danh: Có tham gia' : 'Vắng mặt',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: isAttended ? Colors.green : Colors.grey,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    if (_splitMode == 'custom' && isAttended) ...[
                                      SizedBox(
                                        width: 120,
                                        child: TextField(
                                          controller: _customCourtCostControllers[p['userId']],
                                          keyboardType: TextInputType.number,
                                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                          decoration: InputDecoration(
                                            labelText: 'Tiền sân',
                                            labelStyle: const TextStyle(fontSize: 11),
                                            isDense: true,
                                            contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      SizedBox(
                                        width: 120,
                                        child: TextField(
                                          controller: _customExtraFeeControllers[p['userId']],
                                          keyboardType: TextInputType.number,
                                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                          decoration: InputDecoration(
                                            labelText: 'Phụ phí',
                                            labelStyle: const TextStyle(fontSize: 11),
                                            isDense: true,
                                            contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                          ),
                                        ),
                                      ),
                                    ] else ...[
                                      Text(
                                        '${costToPay.toStringAsFixed(0)} VND',
                                        style: const TextStyle(fontWeight: FontWeight.w900, color: AppTheme.primaryColor),
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Text(
                                            isPaid ? 'Đã đóng' : 'Chưa đóng',
                                            style: TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              color: isPaid ? Colors.green : Colors.red,
                                            ),
                                          ),
                                          Checkbox(
                                            activeColor: Colors.green,
                                            value: isPaid,
                                            onChanged: (val) {
                                              if (val != null) {
                                                _togglePaymentPaid(p, val);
                                              }
                                            },
                                          ),
                                        ],
                                      ),
                                    ],
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  const SizedBox(height: 32),
                ],
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
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
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
