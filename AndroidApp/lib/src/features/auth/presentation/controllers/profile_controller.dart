import 'package:flutter/foundation.dart';
import '../../../../shared/network/api_response.dart';
import '../../domain/repositories/profile_repository.dart';
import '../../data/models/auth_models.dart';

class ProfileController extends ChangeNotifier {
  final ProfileRepository _profileRepository;

  /// Global notifier to trigger UI updates across different tabs when profile changes
  static final ValueNotifier<int> profileUpdateNotifier = ValueNotifier(0);

  ProfileController({required ProfileRepository profileRepository}) : _profileRepository = profileRepository;

  UserProfileResponse? _userProfile;
  List<UserSportProfileResponse>? _sportProfiles;
  
  bool _isLoading = false;
  String? _errorMessage;

  UserProfileResponse? get userProfile => _userProfile;
  List<UserSportProfileResponse>? get sportProfiles => _sportProfiles;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  /// Đánh dấu tài khoản đã kích hoạt ngay trên bộ nhớ local để UI cập nhật tức thì.
  void markAsActive() {
    if (_userProfile != null) {
      _userProfile = UserProfileResponse(
        userId: _userProfile!.userId,
        fullName: _userProfile!.fullName,
        email: _userProfile!.email,
        phoneNumber: _userProfile!.phoneNumber,
        roleName: _userProfile!.roleName,
        createdAt: _userProfile!.createdAt,
        isActive: true,
        avatarFileId: _userProfile!.avatarFileId,
        subscriptionTier: _userProfile!.subscriptionTier,
      );
      notifyListeners();
    }
  }

  Future<void> fetchProfileData() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final responses = await Future.wait([
        _profileRepository.getMyProfile(),
        _profileRepository.getMySportProfiles(),
      ]);

      final profileRes = responses[0] as ApiResponse<UserProfileResponse>;
      final sportsRes = responses[1] as ApiResponse<List<UserSportProfileResponse>>;

      if (profileRes.success && profileRes.data != null) {
        _userProfile = profileRes.data;
      } else {
        _errorMessage = profileRes.message;
      }

      if (sportsRes.success && sportsRes.data != null) {
        _sportProfiles = sportsRes.data;
      }
    } catch (e) {
      _errorMessage = 'Lỗi kết nối tải dữ liệu hồ sơ';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> updateProfile(String fullName, String phoneNumber) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final request = UpdateProfileRequest(fullName: fullName, phoneNumber: phoneNumber);
      final response = await _profileRepository.updateMyProfile(request);

      if (response.success && response.data != null) {
        _userProfile = response.data;
        return true;
      } else {
        _errorMessage = response.message;
        return false;
      }
    } catch (e) {
      _errorMessage = 'Lỗi kết nối cập nhật hồ sơ';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> addSportProfile(int sportId, int rankValue) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final request = CreateSportProfileRequest(sportId: sportId, rankValue: rankValue);
      final response = await _profileRepository.createSportProfile(request);

      if (response.success && response.data != null) {
        _sportProfiles?.add(response.data!);
        return true;
      } else {
        _errorMessage = response.message;
        return false;
      }
    } catch (e) {
      _errorMessage = 'Lỗi kết nối thêm môn thể thao';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> updateSportRank(int sportId, int newRankValue) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final request = UpdateSportProfileRequest(rankValue: newRankValue);
      final response = await _profileRepository.updateSportProfile(sportId, request);

      if (response.success && response.data != null) {
        final index = _sportProfiles?.indexWhere((p) => p.sportId == sportId);
        if (index != null && index >= 0) {
          _sportProfiles![index] = response.data!;
        }
        return true;
      } else {
        _errorMessage = response.message;
        return false;
      }
    } catch (e) {
      _errorMessage = 'Lỗi kết nối cập nhật cấp độ';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> deleteSportProfile(int sportId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _profileRepository.deleteSportProfile(sportId);
      if (response.success) {
        _sportProfiles?.removeWhere((p) => p.sportId == sportId);
        return true;
      } else {
        _errorMessage = response.message;
        return false;
      }
    } catch (e) {
      _errorMessage = 'Lỗi kết nối xóa môn thể thao';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> uploadAvatar(String filePath) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _profileRepository.uploadAvatar(filePath);
      if (response.success && response.data != null && response.data!.isNotEmpty) {
        // Cập nhật lại thông tin profile
        if (_userProfile != null) {
          _userProfile = UserProfileResponse(
            userId: _userProfile!.userId,
            fullName: _userProfile!.fullName,
            email: _userProfile!.email,
            phoneNumber: _userProfile!.phoneNumber,
            roleName: _userProfile!.roleName,
            createdAt: _userProfile!.createdAt,
            isActive: _userProfile!.isActive,
            avatarFileId: response.data,
            subscriptionTier: _userProfile!.subscriptionTier,
          );
        }
        await fetchProfileData(); // Ensure we have the latest data
        ProfileController.profileUpdateNotifier.value++; // Notify other screens
        return true;
      } else {
        _errorMessage = response.message;
        return false;
      }
    } catch (e) {
      _errorMessage = 'Lỗi tải ảnh đại diện lên máy chủ';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> sendConfirmationEmail(String email) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _profileRepository.sendConfirmationEmail(email);
      if (response.success) {
        return true;
      } else {
        _errorMessage = response.message;
        return false;
      }
    } catch (e) {
      _errorMessage = 'Lỗi gửi yêu cầu xác thực email';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> verifyCode(String email, String code) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final request = EmailConfirmationRequest(email: email, code: code);
      final response = await _profileRepository.verifyCode(request);
      if (response.success && response.data == true) {
        // Nếu xác thực thành công, giả định isActive thành true để UI có thể mở lại
        if (_userProfile != null) {
          _userProfile = UserProfileResponse(
            userId: _userProfile!.userId,
            fullName: _userProfile!.fullName,
            email: _userProfile!.email,
            phoneNumber: _userProfile!.phoneNumber,
            roleName: _userProfile!.roleName,
            createdAt: _userProfile!.createdAt,
            isActive: true, // Cập nhật isActive thành true!
            avatarFileId: _userProfile!.avatarFileId,
            subscriptionTier: _userProfile!.subscriptionTier,
          );
        }
        return true;
      } else {
        _errorMessage = response.message;
        return false;
      }
    } catch (e) {
      _errorMessage = 'Lỗi xác thực mã OTP';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
