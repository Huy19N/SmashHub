import 'package:flutter/foundation.dart';
import '../../domain/repositories/community_repository.dart';
import '../../data/models/community_models.dart';

class MessagesController extends ChangeNotifier {
  final CommunityRepository _communityRepository;

  MessagesController({required CommunityRepository communityRepository}) : _communityRepository = communityRepository;

  bool _isLoading = false;
  String? _errorMessage;
  List<TeamResponse> _teams = [];

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<TeamResponse> get teams => _teams;

  Future<void> fetchTeams() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _communityRepository.getTeams(pageNumber: 1, pageSize: 50);
      if (response.success && response.data != null) {
        _teams = response.data!.items;
      } else {
        _errorMessage = response.message;
      }
    } catch (e) {
      _errorMessage = 'Lỗi kết nối tải dữ liệu câu lạc bộ';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> joinTeam(String inviteToken) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _communityRepository.joinTeam(inviteToken);
      if (response.success) {
        await fetchTeams();
        return true;
      } else {
        _errorMessage = response.message ?? 'Mã mời không hợp lệ hoặc đã hết hạn';
      }
    } catch (e) {
      _errorMessage = 'Đã có lỗi xảy ra';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
    return false;
  }
}
