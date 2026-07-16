import 'package:flutter/material.dart';
import '../../../shared/theme/app_theme.dart';
import '../../../shared/widgets/main_wrapper.dart';
import 'register_screen.dart';
import 'controllers/auth_controller.dart';
import '../data/repositories/auth_repository_impl.dart';
import '../data/data_sources/auth_remote_data_source.dart';
import '../../../shared/network/api_client.dart';
import 'forgot_password_screen.dart';


class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  late final AuthController _authController;

  @override
  void initState() {
    super.initState();
    // Khởi tạo các phụ thuộc và bộ điều khiển xác thực (Auth Controller)
    final apiClient = ApiClient();
    final remoteDataSource = AuthRemoteDataSource(apiClient);
    final repository = AuthRepositoryImpl(remoteDataSource);
    _authController = AuthController(authRepository: repository);
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _navigateToRegister() {
    Navigator.of(context).push(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) =>
            const RegisterScreen(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(opacity: animation, child: child);
        },
        transitionDuration: const Duration(milliseconds: 400),
      ),
    );
  }

  void _handleLogin() async {
    // 1. Thực hiện kiểm tra tính hợp lệ của dữ liệu đầu vào cục bộ để tiết kiệm băng thông mạng
    if (_formKey.currentState!.validate()) {
      final email = _emailController.text.trim();
      final password = _passwordController.text;

      // 2. Gọi API Đăng nhập thông qua AuthController
      final response = await _authController.login(
        context,
        email: email,
        password: password,
      );

      // 3. Xử lý phản hồi kết quả từ máy chủ
      if (mounted) {
        if (response.success) {
          // Thành công: Chuyển hướng người dùng sang MainWrapper
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(
              builder: (context) => const MainWrapper(),
            ),
          );
        } else {
          // Thất bại: Hiển thị thông báo lỗi bằng SnackBar chuẩn
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.message),
              backgroundColor: Colors.redAccent,
              behavior: SnackBarBehavior.floating,
              duration: const Duration(seconds: 3),
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBackgroundColor : AppTheme.lightBackgroundColor,
      body: SafeArea(
            child: Center(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(
                  horizontal: 28.0,
                  vertical: 24.0,
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(height: 20),
                      // Brand Header: SmashHub (italicized green bold text)
                      Text(
                        'SmashHub',
                        style: TextStyle(
                          fontSize: 40,
                          fontWeight: FontWeight.w900,
                          fontStyle: FontStyle.italic,
                          color: theme.colorScheme.primary,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 6),
                      // Subtitle
                      Text(
                        'Login',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 48),

                      // Email input field
                      TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: const InputDecoration(
                          hintText: 'Email',
                          prefixIcon: null, // As shown on image concept
                        ),
                        validator: (val) {
                          if (val == null || val.trim().isEmpty) {
                            return 'Vui lòng nhập Email';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 20),

                      // Password input field
                      TextFormField(
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        decoration: InputDecoration(
                          hintText: 'Password',
                          suffixIcon: IconButton(
                            onPressed: () {
                              setState(() {
                                _obscurePassword = !_obscurePassword;
                              });
                            },
                            icon: Icon(
                              _obscurePassword
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                              color: Colors.grey,
                            ),
                            constraints: const BoxConstraints(
                              minWidth: 48,
                              minHeight: 48,
                            ), // touch target
                          ),
                        ),
                        validator: (val) {
                          if (val == null || val.isEmpty) {
                            return 'Vui lòng nhập Mật khẩu';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),

                      // Forgot Password Link
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (context) => const ForgotPasswordScreen(),
                              ),
                            );
                          },
                          style: TextButton.styleFrom(
                            foregroundColor: theme.colorScheme.primary,
                            minimumSize: const Size(
                              120,
                              48,
                            ), // safe touch target
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: const Text(
                            'Quên mật khẩu?',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Login Button (No Gradient)
                      GestureDetector(
                        onTap: _handleLogin,
                        child: Container(
                          height: 52, // Target touch height
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: AppTheme.primaryColor,
                            borderRadius: BorderRadius.circular(26),
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.primaryColor.withValues(
                                  alpha: 0.3,
                                ),
                                blurRadius: 14,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          alignment: Alignment.center,
                          child: const Text(
                            'Login',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Register Toggle Footer Action
                      GestureDetector(
                        onTap: _navigateToRegister,
                        behavior: HitTestBehavior.opaque,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                            vertical: 12.0,
                            horizontal: 24.0,
                          ), // touch target bounds padding
                          child: Text.rich(
                            TextSpan(
                              text: 'Or ',
                              style: TextStyle(
                                color: isDark ? Colors.white70 : Colors.black54,
                                fontSize: 14,
                              ),
                              children: const [
                                TextSpan(
                                  text: 'Register',
                                  style: TextStyle(
                                    color: AppTheme.primaryColor,
                                    fontWeight: FontWeight.bold,
                                    decoration: TextDecoration.underline,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
    );
  }
}
