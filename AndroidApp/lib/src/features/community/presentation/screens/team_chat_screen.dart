import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/network/api_client.dart';
import '../../../../shared/network/api_config.dart';
import '../../data/data_sources/community_remote_data_source.dart';
import '../../data/repositories/community_repository_impl.dart';
import '../controllers/team_chat_controller.dart';
import '../../data/models/community_models.dart';
import '../../../auth/presentation/controllers/profile_controller.dart';
import '../../../auth/data/data_sources/profile_remote_data_source.dart';
import '../../../auth/data/repositories/profile_repository_impl.dart';
import 'dart:async';
import 'video_call_screen.dart';
import 'team_detail_screen.dart';
import '../../../../shared/widgets/app_media_image.dart';
import '../../../../shared/services/signalr_service.dart';

class TeamChatScreen extends StatefulWidget {
  final String teamId;
  final String teamName;
  final int memberCount;

  const TeamChatScreen({
    super.key,
    required this.teamId,
    required this.teamName,
    required this.memberCount,
  });

  @override
  State<TeamChatScreen> createState() => _TeamChatScreenState();
}

class _TeamChatScreenState extends State<TeamChatScreen> {
  late final TeamChatController _controller;
  late final ProfileController _profileController;
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  String? _currentUserId;
  StreamSubscription<Map<String, dynamic>>? _messageSubscription;
  StreamSubscription<Map<String, dynamic>>? _callSubscription;
  late final ProfileRepositoryImpl _profileRepository;
  final Map<String, String?> _userAvatars = {};

  @override
  void initState() {
    super.initState();

    final apiClient = ApiClient();
    final dataSource = CommunityRemoteDataSource(apiClient);
    final repository = CommunityRepositoryImpl(dataSource);

    _controller = TeamChatController(
      repository: repository,
      teamId: widget.teamId,
    );

    final profileRemoteDataSource = ProfileRemoteDataSource(apiClient);
    _profileRepository = ProfileRepositoryImpl(profileRemoteDataSource);
    _profileController = ProfileController(
      profileRepository: _profileRepository,
    );

    _controller.addListener(_onControllerUpdate);
    _profileController.addListener(_onProfileControllerUpdate);

    _controller.fetchMessages();
    _profileController.fetchProfileData();

    // Thiết lập SignalRService để nhận tin nhắn real-time
    SignalRService.instance.currentChatTeamId = widget.teamId;
    _messageSubscription = SignalRService.instance.messageStream.listen((data) {
      if (mounted && data['teamId']?.toString() == widget.teamId) {
        // Tải lại tin nhắn khi có tin nhắn mới (hoặc có thể tự append vào list để tối ưu hơn)
        _controller.fetchMessages(isRefresh: true);
      }
    });

    _callSubscription = SignalRService.instance.callEventStream.listen((data) {
      if (mounted && (data['roomId']?.toString() == widget.teamId || data['teamId']?.toString() == widget.teamId)) {
        _controller.fetchMessages(isRefresh: true);
      }
    });
  }

  void _showInviteDialog() async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    final response = await _controller.repository.createInvite(widget.teamId);
    if (!mounted) return;
    Navigator.of(context).pop(); // dismiss loading

    if (response.success && response.data != null) {
      final inviteToken = response.data!['inviteToken'];
      // final expiresAt = response.data!['expiresAt'];
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Mời tham gia nhóm'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Chia sẻ mã này cho bạn bè để họ tham gia nhóm:'),
              const SizedBox(height: 16),
              SelectableText(
                inviteToken,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2,
                  color: AppTheme.primaryColor,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Đóng'),
            ),
          ],
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(response.message)),
      );
    }
  }

  void _onProfileControllerUpdate() {
    if (mounted && _profileController.userProfile != null) {
      setState(() {
        _currentUserId = _profileController.userProfile!.userId;
      });
    }
  }

  void _onControllerUpdate() {
    if (mounted) {
      _fetchMissingAvatars();
      setState(() {});
      // Cuộn xuống dưới cùng khi có tin nhắn mới (sau khi build xong)
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_scrollController.hasClients) {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        }
      });
    }
  }

  void _fetchMissingAvatars() {
    for (final msg in _controller.messages) {
      if (!_userAvatars.containsKey(msg.senderId)) {
        _userAvatars[msg.senderId] = null; // Đánh dấu là đang tải/không có
        _profileRepository.getUserProfile(msg.senderId).then((res) {
          if (res.success && res.data?.avatarFileId != null) {
            if (mounted) {
              setState(() {
                _userAvatars[msg.senderId] = res.data!.avatarFileId;
              });
            }
          }
        }).catchError((_) {});
      }
    }
  }

  @override
  void dispose() {
    SignalRService.instance.currentChatTeamId = null;
    _messageSubscription?.cancel();
    _callSubscription?.cancel();
    _controller.removeListener(_onControllerUpdate);
    _profileController.removeListener(_onProfileControllerUpdate);
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _handleSend() {
    final text = _textController.text;
    if (text.isNotEmpty) {
      _controller.sendMessage(text).then((success) {
        if (mounted) {
          if (success) {
            _textController.clear();
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Gửi tin nhắn thất bại')),
            );
          }
        }
      });
    }
  }

  String _getInitials(String name) {
    if (name.isEmpty) return '?';
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.length == 1) {
      return parts[0].substring(0, 1).toUpperCase();
    }
    return '${parts[0].substring(0, 1)}${parts[parts.length - 1].substring(0, 1)}'
        .toUpperCase();
  }

  String _formatTime(DateTime? date) {
    if (date == null) return '';
    final localDate = date.toLocal();
    final hour = localDate.hour.toString().padLeft(2, '0');
    final minute = localDate.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final hasActiveCall = _controller.messages.any((m) => m.messageType == 4 && m.content.contains('STATUS:OPEN'));

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: AppTheme.primaryColor,
                shape: BoxShape.circle,
                border: Border.all(
                  color: isDark ? Colors.white24 : Colors.black12,
                  width: 1,
                ),
              ),
              alignment: Alignment.center,
              child: Text(
                _getInitials(widget.teamName),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  fontSize: 14,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    widget.teamName,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.1,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${widget.memberCount} thành viên',
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                      fontWeight: FontWeight.normal,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          // Nút gọi điện video call với touch target đạt chuẩn
          SizedBox(
            width: 48,
            height: 48,
            child: IconButton(
              icon: Icon(Icons.call_outlined, color: hasActiveCall ? Colors.grey : null),
              tooltip: 'Gọi video',
              onPressed: hasActiveCall ? () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Đang có cuộc gọi diễn ra trong nhóm')),
                );
              } : () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => VideoCallScreen(
                      teamId: widget.teamId,
                      roomId: widget.teamId, // Thường roomId sẽ trùng với teamId trong chat nhóm
                      isInitiator: true,
                    ),
                  ),
                );
              },
            ),
          ),
          // Nút thêm thành viên
          SizedBox(
            width: 48,
            height: 48,
            child: IconButton(
              icon: const Icon(Icons.person_add_alt_1_outlined),
              tooltip: 'Thêm thành viên',
              onPressed: _showInviteDialog,
            ),
          ),
          // Nút thông tin nhóm
          SizedBox(
            width: 48,
            height: 48,
            child: IconButton(
              icon: const Icon(Icons.info_outline),
              tooltip: 'Thông tin nhóm',
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => TeamDetailScreen(
                      teamId: widget.teamId,
                      teamName: widget.teamName,
                      memberCount: widget.memberCount,
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: Column(
        children: [
          // Banner thông báo cuộc gọi đang diễn ra
          if (hasActiveCall)
            Container(
              width: double.infinity,
              color: AppTheme.primaryColor.withValues(alpha: 0.1),
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
              child: Row(
                children: [
                  const Icon(Icons.videocam_rounded, color: AppTheme.primaryColor, size: 20),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'Đang có cuộc gọi video diễn ra...',
                      style: TextStyle(
                        color: AppTheme.primaryColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (context) => VideoCallScreen(
                            teamId: widget.teamId,
                            roomId: widget.teamId,
                            isInitiator: false,
                          ),
                        ),
                      );
                    },
                    style: TextButton.styleFrom(
                      backgroundColor: AppTheme.primaryColor,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text('Tham gia', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
          // Danh sách tin nhắn
          Expanded(
            child: _controller.isLoading && _controller.messages.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: () => _controller.fetchMessages(isRefresh: true),
                    child: ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      itemCount: _controller.messages.length,
                      itemBuilder: (context, index) {
                        final msg = _controller.messages[index];
                        // Xác định tin nhắn là của bản thân hay người khác
                        bool isMine = false;
                        if (_currentUserId != null &&
                            msg.senderId == _currentUserId) {
                          isMine = true;
                        } else if (_currentUserId == null &&
                            msg.senderName == null) {
                          isMine = true;
                        }

                        return _buildMessageBubble(msg, isMine, isDark);
                      },
                    ),
                  ),
          ),

          // Thanh nhập tin nhắn (Input Area) được nâng cấp hiện đại
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF0F0F11) : Colors.white,
              border: Border(
                top: BorderSide(
                  color: isDark ? Colors.white.withValues(alpha: 0.06) : Colors.black.withValues(alpha: 0.06),
                ),
              ),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  // Nút đính kèm tệp tin với touch target 48dp
                  SizedBox(
                    width: 48,
                    height: 48,
                    child: IconButton(
                      icon: const Icon(Icons.add_circle_outline, size: 24),
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Tính năng đính kèm đang phát triển'),
                          ),
                        );
                      },
                    ),
                  ),
                  // Nút gửi ảnh với touch target 48dp
                  SizedBox(
                    width: 48,
                    height: 48,
                    child: IconButton(
                      icon: const Icon(Icons.image_outlined, size: 24),
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Tính năng gửi ảnh đang phát triển'),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 4),
                  // Ô nhập tin nhắn với viền outline và focus màu xanh lá thể thao
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      style: TextStyle(
                        fontSize: 14.5,
                        color: isDark ? Colors.white : Colors.black87,
                      ),
                      decoration: InputDecoration(
                        hintText: 'Nhập tin nhắn...',
                        filled: true,
                        fillColor: isDark ? const Color(0xFF1C1C1F) : const Color(0xFFF3F4F6),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        isDense: true,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide(
                            color: isDark ? Colors.white.withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.08),
                            width: 1,
                          ),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: const BorderSide(
                            color: AppTheme.primaryColor, // Màu viền khi focus là xanh đậm
                            width: 1.5,
                          ),
                        ),
                        hintStyle: TextStyle(
                          color: isDark ? Colors.grey[500] : Colors.grey[400],
                        ),
                      ),
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _handleSend(),
                      enabled: !_controller.isSending,
                    ),
                  ),
                  const SizedBox(width: 8),
                  SizedBox(
                    width: 48,
                    height: 48,
                    child: Container(
                      decoration: const BoxDecoration(
                        color: AppTheme.primaryColor, // Nền xanh đậm
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        icon: _controller.isSending
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(
                                Icons.send_rounded,
                                color: Colors.white, // Chữ trắng tương phản tốt
                                size: 20,
                              ),
                        onPressed: _controller.isSending ? null : _handleSend,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Xây dựng bong bóng chat cao cấp với bo góc không đối xứng và phân cấp rõ ràng
  Widget _buildMessageBubble(
    TeamMessageResponse msg,
    bool isMine,
    bool isDark,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14.0),
      child: Row(
        mainAxisAlignment: isMine ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // Nếu không phải tin nhắn của mình, hiển thị avatar người gửi
          if (!isMine) ...[
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                gradient: _userAvatars[msg.senderId] == null ? LinearGradient(
                  colors: [
                    Colors.primaries[msg.senderId.hashCode % Colors.primaries.length],
                    Colors.primaries[(msg.senderId.hashCode + 2) % Colors.primaries.length].withValues(alpha: 0.8),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ) : null,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              alignment: Alignment.center,
              child: _userAvatars[msg.senderId] != null && _userAvatars[msg.senderId]!.isNotEmpty
                  ? ClipOval(
                      child: AppMediaImage(
                        fileId: _userAvatars[msg.senderId]!,
                        width: 32,
                        height: 32,
                        fit: BoxFit.cover,
                      ),
                    )
                  : Text(
                      _getInitials(msg.senderName ?? 'User'),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Column(
              crossAxisAlignment: isMine ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                // Hiển thị tên người gửi nếu là tin nhắn của thành viên khác
                if (!isMine)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 4, left: 4),
                    child: Text(
                      msg.senderName ?? 'Thành viên',
                      style: TextStyle(
                        fontSize: 11.5,
                        color: isDark ? Colors.grey[400] : Colors.grey[600],
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                // Bong bóng tin nhắn chính
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: isMine
                        ? AppTheme.primaryColor // Xanh đậm cho tin nhắn cá nhân
                        : (isDark ? const Color(0xFF1E1E22) : const Color(0xFFE5E7EB)),
                    // Bo góc không đối xứng chuẩn Premium
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(16),
                      topRight: const Radius.circular(16),
                      bottomLeft: Radius.circular(!isMine ? 4 : 16),
                      bottomRight: Radius.circular(isMine ? 4 : 16),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start, // Căn lề nội dung text tự nhiên
                    children: [
                      // Xử lý hiển thị hình ảnh đính kèm nếu có
                      if (msg.messageType == 1 && msg.mediaFileId != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 8.0),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: CachedNetworkImage(
                              imageUrl: ApiConfig.getFileUrl(msg.mediaFileId!),
                              width: 200,
                              fit: BoxFit.cover,
                              placeholder: (context, url) => Container(
                                width: 200,
                                height: 150,
                                color: isDark ? Colors.grey[800] : Colors.grey[300],
                                child: const Center(
                                  child: CircularProgressIndicator(),
                                ),
                              ),
                              errorWidget: (context, url, error) => const Icon(Icons.error),
                            ),
                          ),
                        ),
                      // Hiển thị nội dung văn bản
                      if (msg.content.isNotEmpty && msg.content != '[Hình ảnh]') ...[
                        () {
                          String displayText = msg.content;
                          bool isClosed = false;
                          String callRoomId = "";

                          if (msg.messageType == 4) {
                            isClosed = msg.isEnded || msg.content.contains('STATUS:CLOSED');
                            callRoomId = msg.roomId ?? widget.teamId;
                            displayText = isClosed ? "Cuộc gọi video đã kết thúc" : "Đã bắt đầu phòng gọi video nhóm.";
                          }

                          return Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                displayText,
                                style: TextStyle(
                                  color: isMine
                                      ? Colors.white // Chữ trắng trên nền xanh đậm
                                      : (isDark ? Colors.white : Colors.black87),
                                  fontSize: 14.5,
                                  height: 1.35,
                                ),
                              ),
                              if (msg.messageType == 4) ...[
                                const SizedBox(height: 8),
                                ElevatedButton.icon(
                                  onPressed: isClosed ? null : () {
                                    Navigator.of(context).push(
                                      MaterialPageRoute(
                                        builder: (context) => VideoCallScreen(
                                          teamId: widget.teamId,
                                          roomId: callRoomId.isNotEmpty ? callRoomId : widget.teamId,
                                          isInitiator: false,
                                        ),
                                      ),
                                    );
                                  },
                                  icon: isClosed 
                                      ? const Icon(Icons.call_end_rounded, size: 18) 
                                      : const Icon(Icons.videocam_rounded, size: 18),
                                  label: Text(isClosed ? 'Phòng đã đóng' : 'Tham gia', style: const TextStyle(fontWeight: FontWeight.bold)),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: isMine 
                                        ? (isClosed ? Colors.white.withValues(alpha: 0.5) : Colors.white) 
                                        : (isClosed ? Colors.grey.shade400 : AppTheme.primaryColor),
                                    foregroundColor: isMine 
                                        ? AppTheme.primaryColor 
                                        : Colors.white,
                                    disabledBackgroundColor: isMine 
                                        ? Colors.white.withValues(alpha: 0.3) 
                                        : Colors.grey.shade300,
                                    disabledForegroundColor: isMine 
                                        ? AppTheme.primaryColor.withValues(alpha: 0.5) 
                                        : Colors.grey.shade600,
                                    padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 16),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    elevation: 0,
                                  ),
                                ),
                              ],
                            ],
                          );
                        }(),
                      ],

                      const SizedBox(height: 6),
                      // Hiển thị thời gian gửi tin nhắn căn góc phải
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            _formatTime(msg.sentAt),
                            style: TextStyle(
                              fontSize: 9.5,
                              color: isMine
                                  ? Colors.white.withValues(alpha: 0.7)
                                  : (isDark ? Colors.grey[400] : Colors.grey[500]),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
