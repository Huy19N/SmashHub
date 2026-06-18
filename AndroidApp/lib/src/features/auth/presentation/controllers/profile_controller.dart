import 'package:flutter/foundation.dart';
import '../../../../shared/network/api_response.dart';
import '../../domain/repositories/profile_repository.dart';
import '../../data/models/auth_models.dart';

class ProfileController extends ChangeNotifier {
  final ProfileRepository _profileRepository;

  ProfileController({required ProfileRepository profileRepository}) : _profileRepository = profileRepository;

  UserProfileResponse? _userProfile;
  List<UserSportProfileResponse>? _sportProfiles;
  
  bool _isLoading = false;
  String? _errorMessage;

  UserProfileResponse? get userProfile => _userProfile;
  List<UserSportProfileResponse>? get sportProfiles => _sportProfiles;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

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
}
