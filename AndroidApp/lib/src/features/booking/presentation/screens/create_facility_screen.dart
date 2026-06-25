import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/theme/app_dialogs.dart';
import '../../../../shared/network/api_client.dart';
import '../../../../shared/widgets/app_card.dart';
import 'package:latlong2/latlong.dart';
import 'facility_location_picker_screen.dart';

class CreateFacilityScreen extends StatefulWidget {
  const CreateFacilityScreen({super.key});

  @override
  State<CreateFacilityScreen> createState() => _CreateFacilityScreenState();
}

class _CreateFacilityScreenState extends State<CreateFacilityScreen> {
  final ApiClient _apiClient = ApiClient();
  final ImagePicker _imagePicker = ImagePicker();
  final _formKey = GlobalKey<FormState>();

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _cityController = TextEditingController(text: 'Đà Nẵng');
  final TextEditingController _districtController = TextEditingController(text: 'Hải Châu');
  final TextEditingController _addressController = TextEditingController();
  final TextEditingController _businessCodeController = TextEditingController();
  
  LatLng? _selectedLocation;

  // Operating Hours State
  final List<Map<String, dynamic>> _operatingHours = [
    {'dayOfWeek': 2, 'isOpen': true, 'openTime': const TimeOfDay(hour: 5, minute: 0), 'closeTime': const TimeOfDay(hour: 23, minute: 0)},
    {'dayOfWeek': 3, 'isOpen': true, 'openTime': const TimeOfDay(hour: 5, minute: 0), 'closeTime': const TimeOfDay(hour: 23, minute: 0)},
    {'dayOfWeek': 4, 'isOpen': true, 'openTime': const TimeOfDay(hour: 5, minute: 0), 'closeTime': const TimeOfDay(hour: 23, minute: 0)},
    {'dayOfWeek': 5, 'isOpen': true, 'openTime': const TimeOfDay(hour: 5, minute: 0), 'closeTime': const TimeOfDay(hour: 23, minute: 0)},
    {'dayOfWeek': 6, 'isOpen': true, 'openTime': const TimeOfDay(hour: 5, minute: 0), 'closeTime': const TimeOfDay(hour: 23, minute: 0)},
    {'dayOfWeek': 7, 'isOpen': true, 'openTime': const TimeOfDay(hour: 5, minute: 0), 'closeTime': const TimeOfDay(hour: 23, minute: 0)},
    {'dayOfWeek': 8, 'isOpen': true, 'openTime': const TimeOfDay(hour: 5, minute: 0), 'closeTime': const TimeOfDay(hour: 23, minute: 0)},
  ];

  String _getDayName(int dayOfWeek) {
    if (dayOfWeek == 8) return 'Chủ Nhật';
    return 'Thứ $dayOfWeek';
  }

  String _formatTimeOfDay(TimeOfDay time) {
    final hour = time.hour.toString().padLeft(2, '0');
    final minute = time.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  File? _selectedImage;
  bool _isLoading = false;
  String? _uploadedFileId;

  Future<void> _pickImage() async {
    try {
      final pickedFile = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 80,
      );
      if (pickedFile != null) {
        setState(() {
          _selectedImage = File(pickedFile.path);
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lỗi khi mở thư viện ảnh.')),
      );
    }
  }

  Future<String?> _uploadImage(String filePath) async {
    try {
      final fileName = filePath.split('/').last;
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath, filename: fileName),
      });

      final response = await _apiClient.post(
        '/api/files/upload?purpose=Facility',
        data: formData,
        options: Options(
          headers: {'Content-Type': 'multipart/form-data'},
        ),
      );

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data['data'];
        if (data != null && data['fileId'] != null) {
          return data['fileId'] as String;
        }
      }
    } catch (e) {
      debugPrint('Upload image error: $e');
    }
    return null;
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedLocation == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn vị trí cơ sở trên bản đồ'), backgroundColor: Colors.red),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // 1. Upload ảnh trước nếu có chọn
      if (_selectedImage != null) {
        final fileId = await _uploadImage(_selectedImage!.path);
        if (fileId != null) {
          _uploadedFileId = fileId;
        } else {
          setState(() {
            _isLoading = false;
          });
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Không thể tải ảnh lên hệ thống, vui lòng thử lại!'), backgroundColor: Colors.red),
            );
          }
          return;
        }
      }

      // 2. Tạo Request Body
      final requestBody = {
        'name': _nameController.text.trim(),
        'city': _cityController.text.trim(),
        'district': _districtController.text.trim(),
        'address': _addressController.text.trim(),
        'latitude': _selectedLocation?.latitude ?? 16.047079,
        'longitude': _selectedLocation?.longitude ?? 108.206230,
        'businessCode': _businessCodeController.text.trim(),
      };

      final response = await _apiClient.post(
        '/api/facilities',
        data: requestBody,
      );

      final responseData = response.data;
      if (responseData['success'] == true) {
        // Cập nhật giờ hoạt động
        try {
          final data = responseData['data'];
          final facilityId = data != null ? (data['facilityId'] ?? data['id']) : null;
          
          if (facilityId != null) {
            final hoursPayload = _operatingHours.where((h) => h['isOpen'] == true).map((h) {
              return {
                'dayOfWeek': h['dayOfWeek'],
                'openTime': _formatTimeOfDay(h['openTime']),
                'closeTime': _formatTimeOfDay(h['closeTime']),
              };
            }).toList();

            if (hoursPayload.isNotEmpty) {
              await _apiClient.put(
                '/api/facilities/$facilityId/operating-hours',
                data: hoursPayload,
              );
            }
          }
        } catch (e) {
          debugPrint('Update operating hours error: $e');
        }

        if (mounted) {
          AppDialogs.showSuccess(
            context: context,
            title: 'Đăng ký thành công!',
            message: 'Đơn đã gửi về quản lý để duyệt đơn, bạn hãy vui lòng chờ đợi.',
            onConfirm: () {
              Navigator.pop(context, true); // Trở về và trả về true để reload
            },
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(responseData['message'] ?? 'Đã xảy ra lỗi khi đăng ký cơ sở'),
              backgroundColor: Colors.red,
            ),
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

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'ĐĂNG KÝ SÂN MỚI',
          style: TextStyle(fontWeight: FontWeight.w900),
        ),
      ),
      body: _isLoading
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
                    // Image Picker area
                    Center(
                      child: GestureDetector(
                        onTap: _pickImage,
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          width: double.infinity,
                          height: 180,
                          decoration: BoxDecoration(
                            color: isDark ? AppTheme.darkSurfaceColor : Colors.grey[200],
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: AppTheme.primaryColor.withValues(alpha: 0.5),
                              width: 1.5,
                            ),
                          ),
                          child: _selectedImage != null
                              ? ClipRRect(
                                  borderRadius: BorderRadius.circular(16),
                                  child: Image.file(
                                    _selectedImage!,
                                    fit: BoxFit.cover,
                                  ),
                                )
                              : Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.add_photo_alternate_rounded,
                                      size: 48,
                                      color: AppTheme.primaryColor.withValues(alpha: 0.8),
                                    ),
                                    const SizedBox(height: 10),
                                    const Text(
                                      'Chọn hình ảnh đại diện sân',
                                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                    ),
                                    const SizedBox(height: 4),
                                    const Text(
                                      'Lưu trữ trực tiếp trên MinIO Cloud Storage',
                                      style: TextStyle(fontSize: 11, color: Colors.grey),
                                    ),
                                  ],
                                ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Inputs
                    _buildTextField(
                      controller: _nameController,
                      label: 'Tên Cơ Sở / Sân Chơi *',
                      icon: Icons.business_rounded,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) return 'Vui lòng nhập tên cơ sở';
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    Row(
                      children: [
                        Expanded(
                          child: _buildTextField(
                            controller: _cityController,
                            label: 'Thành phố *',
                            icon: Icons.location_city_rounded,
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) return 'Vui lòng nhập';
                              return null;
                            },
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: _buildTextField(
                            controller: _districtController,
                            label: 'Quận / Huyện *',
                            icon: Icons.map_rounded,
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) return 'Vui lòng nhập';
                              return null;
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    _buildTextField(
                      controller: _addressController,
                      label: 'Địa Chỉ Chi Tiết *',
                      icon: Icons.location_on_rounded,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) return 'Vui lòng nhập địa chỉ chi tiết';
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    const SizedBox(height: 16),

                    // Vị trí bản đồ thay cho TextFields
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isDark ? AppTheme.darkSurfaceColor : Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey.shade300),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.map_rounded, color: AppTheme.primaryColor),
                              SizedBox(width: 8),
                              Text('Vị Trí Cơ Sở Trên Bản Đồ *', style: TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const SizedBox(height: 12),
                          if (_selectedLocation != null)
                            Container(
                              padding: const EdgeInsets.all(12),
                              margin: const EdgeInsets.only(bottom: 12),
                              decoration: BoxDecoration(
                                color: AppTheme.primaryColor.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.check_circle, color: Colors.green, size: 20),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      'Đã chọn: ${_selectedLocation!.latitude.toStringAsFixed(5)}, ${_selectedLocation!.longitude.toStringAsFixed(5)}',
                                      style: const TextStyle(fontWeight: FontWeight.w600),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          SizedBox(
                            width: double.infinity,
                            child: OutlinedButton.icon(
                              onPressed: () async {
                                final result = await Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => const FacilityLocationPickerScreen(),
                                  ),
                                );
                                if (result != null && result is LatLng) {
                                  setState(() {
                                    _selectedLocation = result;
                                  });
                                }
                              },
                              icon: const Icon(Icons.location_on),
                              label: Text(_selectedLocation == null ? 'Bấm để chọn vị trí trên bản đồ' : 'Chọn lại vị trí'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: AppTheme.primaryColor,
                                side: const BorderSide(color: AppTheme.primaryColor),
                                padding: const EdgeInsets.symmetric(vertical: 12),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    _buildTextField(
                      controller: _businessCodeController,
                      label: 'Mã Số Doanh Nghiệp / GPKD',
                      icon: Icons.card_membership_rounded,
                    ),
                    const SizedBox(height: 16),

                    _buildOperatingHoursSection(),
                    const SizedBox(height: 32),

                    // Button
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
                        onPressed: _handleSubmit,
                        child: const Text(
                          'ĐĂNG KÝ CƠ SỞ',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildTimeSelector({
    required TimeOfDay time,
    required bool isEnabled,
    required Function(TimeOfDay) onChanged,
  }) {
    return InkWell(
      onTap: isEnabled
          ? () async {
              final picked = await showTimePicker(
                context: context,
                initialTime: time,
              );
              if (picked != null) {
                onChanged(picked);
              }
            }
          : null,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        decoration: BoxDecoration(
          color: isEnabled ? Colors.white : Colors.grey.shade200,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.grey.shade300),
        ),
        child: Row(
          children: [
            Text(
              _formatTimeOfDay(time),
              style: TextStyle(
                fontSize: 13,
                color: isEnabled ? Colors.black87 : Colors.grey,
              ),
            ),
            const SizedBox(width: 4),
            Icon(
              Icons.access_time,
              size: 14,
              color: isEnabled ? Colors.black54 : Colors.grey,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOperatingHoursSection() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: AppTheme.primaryColor.withValues(alpha: 0.1),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
              ),
            ),
            child: const Row(
              children: [
                Icon(Icons.access_time_rounded, size: 20, color: AppTheme.primaryColor),
                SizedBox(width: 8),
                Text(
                  'GIỜ HOẠT ĐỘNG',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
              ],
            ),
          ),
          ..._operatingHours.asMap().entries.map((entry) {
            final index = entry.key;
            final hourData = entry.value;
            final bool isLast = index == _operatingHours.length - 1;
            
            return Column(
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
                  child: Row(
                    children: [
                      Checkbox(
                        value: hourData['isOpen'],
                        activeColor: AppTheme.primaryColor,
                        onChanged: (val) {
                          setState(() {
                            hourData['isOpen'] = val ?? false;
                          });
                        },
                      ),
                      SizedBox(
                        width: 75,
                        child: Text(
                          _getDayName(hourData['dayOfWeek']),
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                        ),
                      ),
                      Expanded(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            _buildTimeSelector(
                              time: hourData['openTime'],
                              isEnabled: hourData['isOpen'],
                              onChanged: (newTime) {
                                setState(() {
                                  hourData['openTime'] = newTime;
                                });
                              },
                            ),
                            const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 8.0),
                              child: Text('-', style: TextStyle(color: Colors.grey)),
                            ),
                            _buildTimeSelector(
                              time: hourData['closeTime'],
                              isEnabled: hourData['isOpen'],
                              onChanged: (newTime) {
                                setState(() {
                                  hourData['closeTime'] = newTime;
                                });
                              },
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                if (!isLast) Divider(height: 1, thickness: 1, color: Colors.grey.shade200),
              ],
            );
          }),
        ],
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
