import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/network/api_client.dart';
import '../../../../shared/widgets/app_card.dart';

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
  final TextEditingController _latitudeController = TextEditingController(text: '16.047079');
  final TextEditingController _longitudeController = TextEditingController(text: '108.206230');
  final TextEditingController _businessCodeController = TextEditingController();

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
        'latitude': double.tryParse(_latitudeController.text) ?? 16.047079,
        'longitude': double.tryParse(_longitudeController.text) ?? 108.206230,
        'businessCode': _businessCodeController.text.trim(),
      };

      final response = await _apiClient.post(
        '/api/facilities',
        data: requestBody,
      );

      final responseData = response.data;
      if (responseData['success'] == true) {
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
                  Text('Đăng ký thành công!'),
                ],
              ),
              content: Text(
                'Cơ sở thể thao "${_nameController.text}" đã được đăng ký và lưu trữ hình ảnh trên MinIO (FileId: ${_uploadedFileId ?? "Không có"}) thành công.',
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(context); // Đóng dialog
                    Navigator.pop(context, true); // Trở về và trả về true để reload
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

                    Row(
                      children: [
                        Expanded(
                          child: _buildTextField(
                            controller: _latitudeController,
                            label: 'Vĩ Độ (Latitude) *',
                            icon: Icons.explore_rounded,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            validator: (value) {
                              if (value == null || double.tryParse(value) == null) return 'Vĩ độ không hợp lệ';
                              return null;
                            },
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: _buildTextField(
                            controller: _longitudeController,
                            label: 'Kinh Độ (Longitude) *',
                            icon: Icons.explore_outlined,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            validator: (value) {
                              if (value == null || double.tryParse(value) == null) return 'Kinh độ không hợp lệ';
                              return null;
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    _buildTextField(
                      controller: _businessCodeController,
                      label: 'Mã Số Doanh Nghiệp / GPKD',
                      icon: Icons.card_membership_rounded,
                    ),
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
