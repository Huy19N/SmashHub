import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../shared/theme/app_theme.dart';
import '../../auth/presentation/login_screen.dart';

class TermsPermissionsScreen extends StatefulWidget {
  final bool isReadOnly;
  const TermsPermissionsScreen({super.key, this.isReadOnly = false});

  @override
  State<TermsPermissionsScreen> createState() => _TermsPermissionsScreenState();
}

class _TermsPermissionsScreenState extends State<TermsPermissionsScreen> {
  bool _isAgreed = false;

  void _onAccept() async {
    if (!_isAgreed) return;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('agreedToTerms', true);

    if (mounted) {
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) =>
              const LoginScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(opacity: animation, child: child);
          },
          transitionDuration: const Duration(milliseconds: 500),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const SizedBox(width: 48), // Balance for back button
                  Center(
                    child: Icon(
                      Icons.security_rounded,
                      size: 64,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                  if (widget.isReadOnly)
                    IconButton(
                      icon: const Icon(Icons.close_rounded, size: 32),
                      color: Colors.black54,
                      onPressed: () => Navigator.of(context).pop(),
                    )
                  else
                    const SizedBox(width: 48),
                ],
              ),
              const SizedBox(height: 24),
              const Text(
                'Điều Khoản & Quyền Riêng Tư',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              const Text(
                'Để mang lại trải nghiệm tìm đối thủ và đặt sân tốt nhất, SmashHub cần một số quyền truy cập trên thiết bị của bạn. Chúng tôi cam kết bảo vệ dữ liệu của bạn và không chia sẻ cho bên thứ ba ngoài mục đích phục vụ ứng dụng.',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.black54,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 24),
              Expanded(
                child: ListView(
                  children: [
                    _buildPermissionItem(
                      icon: Icons.location_on,
                      title: 'Vị trí (Location)',
                      description:
                          'Dùng để gợi ý các sân cầu lông gần bạn nhất và tối ưu hóa việc tìm đối thủ xung quanh.',
                    ),
                    const SizedBox(height: 16),
                    _buildPermissionItem(
                      icon: Icons.camera_alt,
                      title: 'Máy ảnh & Thư viện ảnh',
                      description:
                          'Cần thiết để bạn có thể tải lên ảnh đại diện, chụp ảnh sân bãi hoặc đăng hình ảnh lên cộng đồng.',
                    ),
                    const SizedBox(height: 16),
                    _buildPermissionItem(
                      icon: Icons.mic,
                      title: 'Micro (Record Audio)',
                      description:
                          'Dùng để hỗ trợ tính năng gọi điện thoại (Video/Voice Call) trực tiếp với chủ sân hoặc đối thủ.',
                    ),
                    const SizedBox(height: 16),
                    _buildPermissionItem(
                      icon: Icons.notifications,
                      title: 'Thông báo (Notifications)',
                      description:
                          'Để không bỏ lỡ các lời mời đánh chung, tin nhắn hoặc thay đổi lịch đặt sân.',
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              if (!widget.isReadOnly) ...[
                const SizedBox(height: 16),
                Row(
                  children: [
                    Checkbox(
                      value: _isAgreed,
                      activeColor: AppTheme.primaryColor,
                      onChanged: (value) {
                        setState(() {
                          _isAgreed = value ?? false;
                        });
                      },
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () {
                          setState(() {
                            _isAgreed = !_isAgreed;
                          });
                        },
                        child: const Text(
                          'Tôi đã đọc và đồng ý với các Điều khoản sử dụng và Chính sách quyền riêng tư.',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.black87,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _isAgreed ? _onAccept : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryColor,
                      foregroundColor: Colors.white,
                      disabledBackgroundColor: Colors.grey.shade300,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Tiếp tục',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: TextButton(
                    onPressed: () {
                      SystemNavigator.pop();
                    },
                    style: TextButton.styleFrom(foregroundColor: Colors.red),
                    child: const Text(
                      'Từ chối và Thoát',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPermissionItem({
    required IconData icon,
    required String title,
    required String description,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: AppTheme.primaryColor.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: AppTheme.primaryColor, size: 24),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                description,
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.black54,
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
