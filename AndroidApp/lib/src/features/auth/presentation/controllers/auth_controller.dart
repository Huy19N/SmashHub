import 'package:flutter/material.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../data/models/auth_models.dart';
import '../../../../shared/network/api_response.dart';
import '../../../../shared/widgets/global_loading_overlay.dart';

/// Bộ điều khiển trạng thái xác thực (Auth Controller) ở lớp Presentation.
/// Chịu trách nhiệm gọi tầng Nghiệp vụ (Repository) và quản lý hiệu ứng hiển thị Loading Overlay.
class AuthController {
  final AuthRepository authRepository;

  AuthController({required this.authRepository});

  /// Thực hiện tác vụ Đăng nhập hệ thống.
  /// Nhận thông tin đăng nhập, gọi API từ Repo và tự động xử lý vòng đời của Loading Overlay.
  Future<ApiResponse<TokenResponse>> login(
    BuildContext context, {
    required String email,
    required String password,
  }) async {
    // Hiển thị loading overlay chặn tương tác người dùng
    GlobalLoading.show(context, message: 'Đang đăng nhập...');

    try {
      final request = LoginRequest(email: email, password: password);
      final response = await authRepository.login(request);
      return response;
    } finally {
      // Luôn đóng loading overlay bất kể thành công hay thất bại
      GlobalLoading.dismiss();
    }
  }

  /// Thực hiện tác vụ Đăng ký tài khoản mới.
  /// Nhận thông tin đăng ký, gọi API từ Repo và tự động xử lý vòng đời của Loading Overlay.
  Future<ApiResponse<void>> register(
    BuildContext context, {
    required String fullName,
    required String email,
    required String password,
    required String phoneNumber,
  }) async {
    // Hiển thị loading overlay chặn tương tác người dùng
    GlobalLoading.show(context, message: 'Đang tạo tài khoản...');

    try {
      final request = RegisterRequest(
        fullName: fullName,
        email: email,
        password: password,
        phoneNumber: phoneNumber,
      );
      final response = await authRepository.register(request);
      return response;
    } finally {
      // Luôn đóng loading overlay bất kể thành công hay thất bại
      GlobalLoading.dismiss();
    }
  }

  /// Xác thực OTP khi vừa đăng ký xong.
  Future<ApiResponse<TokenResponse>> verifyRegistration(
    BuildContext context, {
    required String email,
    required String code,
  }) async {
    GlobalLoading.show(context, message: 'Đang xác thực...');
    try {
      final request = VerifyEmailRequest(email: email, code: code);
      return await authRepository.verifyRegistration(request);
    } finally {
      GlobalLoading.dismiss();
    }
  }

  /// Gửi lại mã OTP qua email (trong màn hình đăng ký).
  Future<ApiResponse<void>> resendVerificationCode(
    BuildContext context, {
    required String email,
  }) async {
    GlobalLoading.show(context, message: 'Đang gửi lại mã...');
    try {
      return await authRepository.resendVerificationCode(email);
    } finally {
      GlobalLoading.dismiss();
    }
  }
  /// Gửi yêu cầu lấy lại mật khẩu qua email.
  Future<ApiResponse<void>> forgotPassword(
    BuildContext context, {
    required String email,
  }) async {
    GlobalLoading.show(context, message: 'Đang gửi yêu cầu...');
    try {
      return await authRepository.forgotPassword(email);
    } finally {
      GlobalLoading.dismiss();
    }
  }

  /// Đặt lại mật khẩu mới.
  Future<ApiResponse<void>> resetPassword(
    BuildContext context, {
    required String email,
    required String code,
    required String newPassword,
  }) async {
    GlobalLoading.show(context, message: 'Đang khôi phục...');
    try {
      final request = ResetPasswordRequest(
        email: email,
        code: code,
        newPassword: newPassword,
      );
      return await authRepository.resetPassword(request);
    } finally {
      GlobalLoading.dismiss();
    }
  }
}
