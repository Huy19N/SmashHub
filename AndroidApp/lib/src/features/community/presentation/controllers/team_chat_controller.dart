import 'package:flutter/foundation.dart';
import '../../domain/repositories/community_repository.dart';
import '../../data/models/community_models.dart';

class TeamChatController extends ChangeNotifier {
  final CommunityRepository _repository;
  final String teamId;

  TeamChatController({
    required CommunityRepository repository,
    required this.teamId,
  }) : _repository = repository;

  CommunityRepository get repository => _repository;

  bool _isLoading = false;
  bool _isSending = false;
  String? _errorMessage;
  List<TeamMessageResponse> _messages = [];

  bool get isLoading => _isLoading;
  bool get isSending => _isSending;
  String? get errorMessage => _errorMessage;
  List<TeamMessageResponse> get messages => _messages;

  Future<void> fetchMessages({bool isRefresh = false}) async {
    if (!isRefresh) {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();
    }

    try {
      final response = await _repository.getTeamMessages(
        teamId,
        pageNumber: 1,
        pageSize: 100, // Fetch 100 recent messages for now
      );
      if (response.success && response.data != null) {
        _messages = response.data!.items;
        // Sort messages by sentAt ascending (oldest first, newest at the bottom)
        _messages.sort((a, b) {
          if (a.sentAt == null || b.sentAt == null) return 0;
          return a.sentAt!.compareTo(b.sentAt!);
        });
      } else {
        _errorMessage = response.message;
      }
    } catch (e) {
      _errorMessage = 'Lỗi kết nối tải tin nhắn';
    } finally {
      if (!isRefresh) {
        _isLoading = false;
      }
      notifyListeners();
    }
  }

  Future<bool> sendMessage(String content, {int messageType = 0, String? mediaFileId}) async {
    if (content.trim().isEmpty && mediaFileId == null) return false;
    
    _isSending = true;
    notifyListeners();

    try {
      final request = SendMessageRequest(
        teamId: teamId,
        content: content.trim(),
        messageType: messageType,
        mediaFileId: mediaFileId,
      );
      final response = await _repository.sendMessage(teamId, request);
      
      if (response.success && response.data != null) {
        // Automatically fetch messages again to sync
        await fetchMessages(isRefresh: true);
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    } finally {
      _isSending = false;
      notifyListeners();
    }
  }

  Future<bool> deleteMessage(String messageId) async {
    try {
      final response = await _repository.deleteMessage(teamId, messageId);
      if (response.success) {
        _messages.removeWhere((m) => m.messageId == messageId);
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}
