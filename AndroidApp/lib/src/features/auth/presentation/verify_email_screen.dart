import 'dart:async';
import 'package:flutter/material.dart';
import '../../../shared/theme/app_theme.dart';
import '../../../shared/widgets/main_wrapper.dart';
import 'controllers/auth_controller.dart';
import 'controllers/profile_controller.dart';
import '../data/repositories/auth_repository_impl.dart';
import '../data/data_sources/auth_remote_data_source.dart';
import '../data/repositories/profile_repository_impl.dart';
import '../data/data_sources/profile_remote_data_source.dart';
import '../../../shared/network/api_client.dart';

class VerifyEmailScreen extends StatefulWidget {
  final String email;
  final bool fromProfile;

  const VerifyEmailScreen({
    super.key,
    required this.email,
    this.fromProfile = false,
  });

  @override
  State<VerifyEmailScreen> createState() => _VerifyEmailScreenState();
}

class _VerifyEmailScreenState extends State<VerifyEmailScreen> {
  final _codeController = TextEditingController();
  late final AuthController _authController;
  late final ProfileController _profileController;

  Timer? _countdownTimer;
  int _remainingSeconds = 300; // 5 minutes

  @override
  void initState() {
    super.initState();
    final apiClient = ApiClient();
    
    if (!widget.fromProfile) {
      final authRemoteDataSource = AuthRemoteDataSource(apiClient);
      final authRepository = AuthRepositoryImpl(authRemoteDataSource);
      _authController = AuthController(authRepository: authRepository);
    } else {
      final profileRemoteDataSource = ProfileRemoteDataSource(apiClient);
      final profileRepository = ProfileRepositoryImpl(profileRemoteDataSource);
      _profileController = ProfileController(profileRepository: profileRepository);
    }

    _startCountdown();
  }

  void _startCountdown() {
    setState(() {
      _remainingSeconds = 300;
    });
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 0) {
        setState(() {
          _remainingSeconds--;
        });
      } else {
        timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _handleVerify() async {
    final code = _codeController.text.trim();
    if (code.isEmpty || code.length < 5) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập đầy đủ mã OTP gồm 5 ký tự')),
      );
      return;
    }

    if (!widget.fromProfile) {
      // Xác thực đăng ký mới
      final response = await _authController.verifyRegistration(
        context,
        email: widget.email,
        code: code,
      );

      if (mounted) {
        if (response.success && response.data != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Kích hoạt thành công! Đang chuyển đến màn hình chính...'),
              backgroundColor: Colors.green,
            ),
          );
          // ApiClient tự động lưu Token, giờ chỉ cần chuyển vào MainWrapper
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (_) => const MainWrapper()),
            (route) => false,
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.message),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } else {
      // Xác thực từ Profile
      final success = await _profileController.verifyCode(widget.email, code);
      if (mounted) {
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Tài khoản đã được kích hoạt thành công!'),
              backgroundColor: Colors.green,
            ),
          );
          Navigator.of(context).pop(true); // Trả về true để ProfileScreen biết cập nhật UI
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(_profileController.errorMessage ?? 'Mã xác thực không hợp lệ'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  Future<void> _handleResendCode() async {
    if (_remainingSeconds > 0) return;

    if (!widget.fromProfile) {
      final response = await _authController.resendVerificationCode(
        context,
        email: widget.email,
      );
      if (mounted && response.success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đã gửi lại mã xác nhận qua email của bạn.')),
        );
        _startCountdown();
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response.message),
            backgroundColor: Colors.red,
          ),
        );
      }
    } else {
      final success = await _profileController.sendConfirmationEmail(widget.email);
      if (mounted && success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đã gửi lại mã xác nhận qua email của bạn.')),
        );
        _startCountdown();
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_profileController.errorMessage ?? 'Có lỗi xảy ra khi gửi lại mã.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    final minutes = (_remainingSeconds / 60).floor();
    final seconds = _remainingSeconds % 60;
    final timeString = '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Xác thực Email'),
        centerTitle: true,
        automaticallyImplyLeading: false, // Ẩn nút quay lại
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 40),
              Icon(
                Icons.mark_email_unread_rounded,
                size: 80,
                color: AppTheme.primaryColor,
              ),
              const SizedBox(height: 24),
              Text(
                'Nhập mã xác thực',
                textAlign: TextAlign.center,
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Mã xác thực (OTP) đã được gửi đến:\n${widget.email}',
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: isDark ? Colors.white70 : Colors.black54,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 40),
              
              // Ô nhập mã OTP đơn giản
              TextField(
                controller: _codeController,
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                maxLength: 5,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 8.0,
                ),
                decoration: InputDecoration(
                  hintText: 'XXXXX',
                  hintStyle: TextStyle(
                    color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.2),
                    letterSpacing: 8.0,
                  ),
                  filled: true,
                  fillColor: isDark ? Colors.grey[900] : Colors.grey[100],
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: AppTheme.primaryColor, width: 2),
                  ),
                  contentPadding: const EdgeInsets.symmetric(vertical: 20),
                ),
              ),
              const SizedBox(height: 32),
              
              ElevatedButton(
                onPressed: _handleVerify,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Xác nhận',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(height: 24),
              
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Chưa nhận được mã?',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: isDark ? Colors.white70 : Colors.black54,
                    ),
                  ),
                  TextButton(
                    onPressed: _remainingSeconds > 0 ? null : _handleResendCode,
                    child: Text(
                      _remainingSeconds > 0 ? 'Gửi lại sau $timeString' : 'Gửi lại mã',
                      style: TextStyle(
                        color: _remainingSeconds > 0 
                            ? Colors.grey 
                            : AppTheme.primaryColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
