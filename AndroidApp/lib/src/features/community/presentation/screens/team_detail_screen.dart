import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/network/api_client.dart';
import '../../../../shared/network/api_config.dart';
import '../../data/data_sources/community_remote_data_source.dart';
import '../../data/repositories/community_repository_impl.dart';
import '../../data/models/community_models.dart';
import '../../../auth/data/data_sources/profile_remote_data_source.dart';
import '../../../auth/data/repositories/profile_repository_impl.dart';
import '../../../auth/data/models/auth_models.dart';
import 'team_chat_screen.dart';
import '../../../../shared/widgets/app_card.dart';
import '../../../../shared/widgets/app_badge.dart';
import '../../../../shared/widgets/app_button.dart';

class TeamDetailScreen extends StatefulWidget {
  final String teamId;
  final String teamName;
  final int memberCount;

  const TeamDetailScreen({
    super.key,
    required this.teamId,
    required this.teamName,
    required this.memberCount,
  });

  @override
  State<TeamDetailScreen> createState() => _TeamDetailScreenState();
}

class _TeamDetailScreenState extends State<TeamDetailScreen> {
  late final CommunityRepositoryImpl _communityRepository;
  late final ProfileRepositoryImpl _profileRepository;

  TeamDetailResponse? _teamDetail;
  UserProfileResponse? _currentUserProfile;
  bool _isLoading = true;
  String? _errorMessage;
  String? _expandedMemberId; // Theo dõi ID của thành viên được mở rộng chi tiết
  final Map<String, String?> _userAvatars = {}; // Cache avatarFileId của các thành viên

  @override
  void initState() {
    super.initState();
    final apiClient = ApiClient();
    _communityRepository = CommunityRepositoryImpl(
      CommunityRemoteDataSource(apiClient),
    );
    _profileRepository = ProfileRepositoryImpl(
      ProfileRemoteDataSource(apiClient),
    );
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final teamRes = await _communityRepository.getTeamDetail(widget.teamId);
      final profileRes = await _profileRepository.getMyProfile();

      if (mounted) {
        if (teamRes.success) {
          _teamDetail = teamRes.data;
        } else {
          _errorMessage = teamRes.message;
        }

        if (profileRes.success) {
          _currentUserProfile = profileRes.data;
          if (_currentUserProfile != null && _currentUserProfile!.avatarFileId != null) {
            _userAvatars[_currentUserProfile!.userId] = _currentUserProfile!.avatarFileId;
          }
        }
      }

      // Tải avatar cho các thành viên khác
      if (_teamDetail != null) {
        _fetchAvatars();
      }
    } catch (e) {
      if (mounted) {
        _errorMessage = 'Đã xảy ra lỗi không xác định.';
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _fetchAvatars() async {
    for (final member in _teamDetail!.members) {
      if (!_userAvatars.containsKey(member.userId)) {
        try {
          final res = await _profileRepository.getUserProfile(member.userId);
          if (res.success && res.data != null) {
            if (mounted) {
              setState(() {
                _userAvatars[member.userId] = res.data!.avatarFileId;
              });
            }
          }
        } catch (_) {}
      }
    }
  }

  Future<void> _removeMember(String userId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xác nhận kích'),
        content: const Text(
          'Bạn có chắc chắn muốn kích thành viên này khỏi nhóm?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Kích', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final res = await _communityRepository.removeTeamMember(
        widget.teamId,
        userId,
      );
      if (res.success) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Đã kích thành viên khỏi nhóm.')),
          );
          _fetchData(); // Reload data
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(res.message)),
          );
        }
      }
    }
  }

  Color _getAvatarColor(String name) {
    const colors = [
      Colors.red,
      Colors.pink,
      Colors.purple,
      Colors.deepPurple,
      Colors.indigo,
      Colors.blue,
      Colors.lightBlue,
      Colors.cyan,
      Colors.teal,
      Colors.green,
      Colors.lightGreen,
      Colors.orange,
      Colors.deepOrange,
      Colors.brown,
      Colors.blueGrey,
    ];
    int hash = 0;
    for (int i = 0; i < name.length; i++) {
      hash = name.codeUnitAt(i) + ((hash << 5) - hash);
    }
    return colors[hash.abs() % colors.length];
  }

  bool _isCurrentUserLeader() {
    if (_currentUserProfile == null || _teamDetail == null) return false;
    final currentUserId = _currentUserProfile!.userId;
    try {
      final myMemberInfo = _teamDetail!.members.firstWhere(
        (m) => m.userId == currentUserId,
      );
      return myMemberInfo.roleName.toLowerCase() == 'leader';
    } catch (e) {
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.teamName,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
          ? Center(child: Text(_errorMessage!))
          : _teamDetail == null
          ? const Center(child: Text('Không tìm thấy thông tin nhóm'))
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                  child: Text(
                    'Thành viên (${_teamDetail!.members.length})',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.1,
                    ),
                  ),
                ),
                Expanded(
                  child: ListView.builder(
                    itemCount: _teamDetail!.members.length,
                    padding: const EdgeInsets.only(bottom: 80.0), // Chừa khoảng trống cho FAB nổi bên dưới
                    itemBuilder: (context, index) {
                      final member = _teamDetail!.members[index];
                      final isMe = _currentUserProfile?.userId == member.userId;
                      final amILeader = _isCurrentUserLeader();
                      final isExpanded = _expandedMemberId == member.userId;

                      // Mỗi thành viên được bọc trong một AppCard dùng chung để đồng bộ giao diện
                      return AppCard(
                        margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 16),
                        padding: EdgeInsets.zero,
                        child: InkWell(
                          onTap: () {
                            setState(() {
                              _expandedMemberId = isExpanded ? null : member.userId;
                            });
                          },
                          borderRadius: BorderRadius.circular(20.0), // Đồng bộ bo góc với AppCard
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Phần thông tin tiêu đề của thành viên
                                Row(
                                  children: [
                                    // Tạo viền nổi bật quanh avatar của trưởng nhóm
                                    Container(
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: member.roleName.toLowerCase() == 'leader'
                                              ? const Color(0xFFFFC107) // Viền vàng đặc trưng cho Trưởng nhóm
                                              : (isDark ? Colors.white24 : Colors.black12),
                                          width: 2,
                                        ),
                                      ),
                                      child: Padding(
                                        padding: const EdgeInsets.all(2.0),
                                        child: _buildAvatar(member),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    // Tên thành viên và chức vụ
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            member.fullName + (isMe ? ' (Bạn)' : ''),
                                            style: const TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 15,
                                              letterSpacing: 0.1,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            member.roleName,
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: isDark ? Colors.grey[400] : Colors.grey[600],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    // Huy hiệu vai trò Trưởng nhóm (Leader) sử dụng AppBadge dùng chung
                                    if (member.roleName.toLowerCase() == 'leader') ...[
                                      const AppBadge(
                                        label: 'Trưởng nhóm',
                                        backgroundColor: Color(0x1AFFC107), // Vàng hổ phách với opacity thấp
                                        textColor: Color(0xFFFFC107),
                                        icon: Icons.star_rounded,
                                      ),
                                      const SizedBox(width: 8),
                                    ],
                                    // Icon điều hướng trạng thái đóng/mở thẻ
                                    Icon(
                                      isExpanded
                                          ? Icons.keyboard_arrow_up_rounded
                                          : Icons.keyboard_arrow_down_rounded,
                                      color: isDark ? Colors.white54 : Colors.black54,
                                      size: 24,
                                    ),
                                  ],
                                ),
                                // Chi tiết mở rộng khi chạm vào thẻ thành viên
                                AnimatedCrossFade(
                                  firstChild: const SizedBox.shrink(),
                                  secondChild: Column(
                                    children: [
                                      const SizedBox(height: 16),
                                      Divider(height: 1, color: isDark ? Colors.white12 : Colors.black12),
                                      const SizedBox(height: 16),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                                        children: [
                                          _buildStatItem(
                                            'Thắng',
                                            member.wins.toString(),
                                            AppTheme.primaryColor, // Màu xanh đậm của app
                                          ),
                                          _buildStatItem(
                                            'Thua',
                                            member.losses.toString(),
                                            const Color(0xFFFF5252), // Màu đỏ cảnh báo
                                          ),
                                          // Hiển thị nút kích thành viên nếu tài khoản hiện tại là leader
                                          if (amILeader && !isMe)
                                            AppButton(
                                              onPressed: () => _removeMember(member.userId),
                                              text: 'Kích khỏi nhóm',
                                              type: AppButtonType.secondary,
                                              height: 40,
                                              icon: const Icon(
                                                Icons.person_remove_rounded,
                                                color: Color(0xFFFF5252),
                                                size: 16,
                                              ),
                                            ),
                                        ],
                                      ),
                                    ],
                                  ),
                                  crossFadeState: isExpanded
                                      ? CrossFadeState.showSecond
                                      : CrossFadeState.showFirst,
                                  duration: const Duration(milliseconds: 200),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => TeamChatScreen(
                teamId: widget.teamId,
                teamName: widget.teamName,
                memberCount: widget.memberCount,
              ),
            ),
          );
        },
        backgroundColor: AppTheme.primaryColor, // Sử dụng màu xanh đậm của app
        icon: const Icon(Icons.chat_bubble_rounded, color: Colors.white),
        label: const Text(
          'Trò chuyện nhóm',
          style: TextStyle(
            color: Colors.white, // Màu chữ trắng nổi bật trên nền xanh đậm
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
        elevation: 4,
      ),
    );
  }

  Widget _buildAvatar(TeamMemberResponse member) {
    final avatarId = member.avatarFileId?.isNotEmpty == true
        ? member.avatarFileId
        : _userAvatars[member.userId];

    if (avatarId != null && avatarId.isNotEmpty) {
      return CircleAvatar(
        radius: 24,
        backgroundImage: CachedNetworkImageProvider(
          ApiConfig.getFileUrl(avatarId),
        ),
        backgroundColor: Colors.transparent,
      );
    } else {
      return CircleAvatar(
        radius: 24,
        backgroundColor: _getAvatarColor(member.fullName),
        child: Text(
          member.fullName.isNotEmpty ? member.fullName[0].toUpperCase() : 'U',
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
      );
    }
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
      ],
    );
  }
}
