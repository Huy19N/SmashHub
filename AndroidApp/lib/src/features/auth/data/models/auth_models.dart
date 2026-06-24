/// DTO gửi đi để yêu cầu Đăng nhập.
class LoginRequest {
  final String email;
  final String password;

  LoginRequest({
    required this.email,
    required this.password,
  });

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'password': password,
    };
  }
}

/// DTO gửi đi để yêu cầu Đăng ký tài khoản.
class RegisterRequest {
  final String fullName;
  final String email;
  final String password;
  final String phoneNumber;

  RegisterRequest({
    required this.fullName,
    required this.email,
    required this.password,
    required this.phoneNumber,
  });

  Map<String, dynamic> toJson() {
    return {
      'fullName': fullName,
      'email': email,
      'password': password,
      'phoneNumber': phoneNumber,
    };
  }
}

/// DTO gửi đi để xác thực tài khoản qua OTP gửi về Email.
class VerifyEmailRequest {
  final String email;
  final String code;

  VerifyEmailRequest({
    required this.email,
    required this.code,
  });

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'code': code,
    };
  }
}

/// DTO gửi đi để xác thực Email khi đang ở trong Profile (kích hoạt bằng tay).
class EmailConfirmationRequest {
  final String email;
  final String code;

  EmailConfirmationRequest({
    required this.email,
    required this.code,
  });

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'code': code,
    };
  }
}

/// DTO phản hồi chứa Access Token và Refresh Token từ Backend.
class TokenResponse {
  final String accessToken;
  final String refreshToken;
  final DateTime expiresAt;

  TokenResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresAt,
  });

  factory TokenResponse.fromJson(Map<String, dynamic> json) {
    return TokenResponse(
      accessToken: json['accessToken'] as String? ?? '',
      refreshToken: json['refreshToken'] as String? ?? '',
      expiresAt: json['expiresAt'] != null
          ? DateTime.parse(json['expiresAt'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'accessToken': accessToken,
      'refreshToken': refreshToken,
      'expiresAt': expiresAt.toIso8601String(),
    };
  }
}

/// DTO gửi đi để Reset mật khẩu bằng mã khôi phục.
class ResetPasswordRequest {
  final String code;
  final String email;
  final String newPassword;

  ResetPasswordRequest({
    required this.code,
    required this.email,
    required this.newPassword,
  });

  Map<String, dynamic> toJson() {
    return {
      'code': code,
      'email': email,
      'newPassword': newPassword,
    };
  }
}

/// DTO phản hồi thông tin Trình độ thể thao (Sport Profile) của người dùng.
class UserSportProfileResponse {
  final int sportId;
  final String sportName;
  final int rankValue;
  final String levelName;
  final DateTime? updatedAt;

  UserSportProfileResponse({
    required this.sportId,
    required this.sportName,
    required this.rankValue,
    required this.levelName,
    this.updatedAt,
  });

  factory UserSportProfileResponse.fromJson(Map<String, dynamic> json) {
    return UserSportProfileResponse(
      sportId: json['sportId'] as int? ?? 0,
      sportName: json['sportName'] as String? ?? '',
      rankValue: json['rankValue'] as int? ?? 0,
      levelName: json['levelName'] as String? ?? '',
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'sportId': sportId,
      'sportName': sportName,
      'rankValue': rankValue,
      'levelName': levelName,
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }
}

/// DTO gửi đi để khai báo Trình độ môn thể thao mới.
class CreateSportProfileRequest {
  final int sportId;
  final int rankValue;

  CreateSportProfileRequest({
    required this.sportId,
    required this.rankValue,
  });

  Map<String, dynamic> toJson() {
    return {
      'sportId': sportId,
      'rankValue': rankValue,
    };
  }
}

/// DTO gửi đi để cập nhật Trình độ môn thể thao.
class UpdateSportProfileRequest {
  final int rankValue;

  UpdateSportProfileRequest({
    required this.rankValue,
  });

  Map<String, dynamic> toJson() {
    return {
      'rankValue': rankValue,
    };
  }
}

/// DTO phản hồi thông tin cá nhân của người dùng.
class UserProfileResponse {
  final String userId;
  final String fullName;
  final String email;
  final String phoneNumber;
  final String roleName;
  final DateTime? createdAt;
  final bool? isActive;
  final String? avatarFileId;

  UserProfileResponse({
    required this.userId,
    required this.fullName,
    required this.email,
    required this.phoneNumber,
    required this.roleName,
    this.createdAt,
    this.isActive,
    this.avatarFileId,
  });

  factory UserProfileResponse.fromJson(Map<String, dynamic> json) {
    return UserProfileResponse(
      userId: json['userId'] as String? ?? '',
      fullName: json['fullName'] as String? ?? '',
      email: json['email'] as String? ?? '',
      phoneNumber: json['phoneNumber'] as String? ?? '',
      roleName: json['roleName'] as String? ?? '',
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt'] as String) : null,
      isActive: json['isActive'] as bool?,
      avatarFileId: json['avatarFileId'] as String?,
    );
  }
}

/// DTO gửi đi để cập nhật thông tin cá nhân.
class UpdateProfileRequest {
  final String fullName;
  final String phoneNumber;

  UpdateProfileRequest({
    required this.fullName,
    required this.phoneNumber,
  });

  Map<String, dynamic> toJson() {
    return {
      'fullName': fullName,
      'phoneNumber': phoneNumber,
    };
  }
}
