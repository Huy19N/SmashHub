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
}
