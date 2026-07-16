// ignore_for_file: use_build_context_synchronously
import 'package:flutter/material.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/network/api_client.dart';
import '../../data/data_sources/community_remote_data_source.dart';
import '../../data/repositories/community_repository_impl.dart';
import '../../data/models/community_models.dart';
import '../../../auth/data/data_sources/profile_remote_data_source.dart';
import '../../../auth/data/repositories/profile_repository_impl.dart';
import '../../../auth/data/models/auth_models.dart';
import 'team_chat_screen.dart';
import 'create_schedule_screen.dart';
import 'attendance_screen.dart';
import 'split_bill_screen.dart';
import '../../../matchmaking/data/data_sources/matchmaking_remote_data_source.dart';
import '../../../matchmaking/data/repositories/matchmaking_repository_impl.dart';
import '../../../matchmaking/data/models/matchmaking_models.dart';
import '../../../matchmaking/presentation/screens/match_requests_screen.dart';
import '../../../../shared/widgets/app_card.dart';
import '../../../../shared/widgets/app_badge.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../shared/widgets/app_media_image.dart';

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
  late final MatchmakingRepositoryImpl _matchmakingRepository;
  final ApiClient _apiClient = ApiClient();

  TeamDetailResponse? _teamDetail;
  UserProfileResponse? _currentUserProfile;
  List<dynamic> _schedules = [];
  List<MatchChallengeResponse> _teamChallenges = [];
  
  bool _isLoading = true;
  bool _isLoadingSchedules = false;
  String? _errorMessage;
  String? _expandedMemberId; 
  final Map<String, String?> _userAvatars = {}; 

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
    _matchmakingRepository = MatchmakingRepositoryImpl(
      MatchmakingRemoteDataSource(apiClient),
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

      if (_teamDetail != null) {
        _fetchAvatars();
        await _fetchSchedules();
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

  Future<void> _fetchSchedules() async {
    setState(() {
      _isLoadingSchedules = true;
    });
    try {
      final res = await _apiClient.get('/api/teams/${widget.teamId}/schedules');
      if (res.data['success'] == true) {
        _schedules = res.data['data'] as List<dynamic>? ?? [];
      }
      
      final challengesRes = await _matchmakingRepository.getTeamChallenges(widget.teamId);
      if (challengesRes.success) {
        _teamChallenges = challengesRes.data ?? [];
      }
    } catch (_) {}
    setState(() {
      _isLoadingSchedules = false;
    });
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
        content: const Text('Bạn có chắc chắn muốn kích thành viên này khỏi nhóm?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Hủy')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Kích', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final res = await _communityRepository.removeTeamMember(widget.teamId, userId);
      if (res.success) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Đã kích thành viên khỏi nhóm.')),
          );
          _fetchData(); 
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

  Future<void> _joinSchedule(String scheduleId) async {
    try {
      final res = await _apiClient.post('/api/schedules/$scheduleId/participants');
      if (res.data['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đã đăng ký tham gia buổi chơi!')),
        );
        _fetchSchedules();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(res.data['message'] ?? 'Tham gia thất bại')),
        );
      }
    } catch (_) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lỗi kết nối khi tham gia lịch chơi')),
      );
    }
  }

  Future<void> _leaveSchedule(String scheduleId) async {
    try {
      final res = await _apiClient.delete('/api/schedules/$scheduleId/participants/me');
      if (res.data['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đã hủy tham gia buổi chơi.')),
        );
        _fetchSchedules();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(res.data['message'] ?? 'Hủy tham gia thất bại')),
        );
      }
    } catch (_) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lỗi kết nối khi hủy tham gia')),
      );
    }
  }

  Future<void> _deleteSchedule(String scheduleId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xác nhận xóa lịch chơi?'),
        content: const Text('Bạn có chắc chắn muốn hủy bỏ lịch chơi nhóm này không?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Không')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Xóa', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        final res = await _apiClient.delete('/api/schedules/$scheduleId');
        if (res.data['success'] == true) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Đã xóa lịch chơi thành công.')),
          );
          _fetchSchedules();
        }
      } catch (_) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Lỗi kết nối máy chủ')),
        );
      }
    }
  }

  Color _getAvatarColor(String name) {
    const colors = [
      Colors.red, Colors.pink, Colors.purple, Colors.deepPurple, Colors.indigo,
      Colors.blue, Colors.lightBlue, Colors.cyan, Colors.teal, Colors.green,
      Colors.lightGreen, Colors.orange, Colors.deepOrange, Colors.brown, Colors.blueGrey,
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

  String _formatDateTime(String isoStr) {
    final date = DateTime.parse(isoStr);
    return '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')} - ${date.day}/${date.month}/${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final amILeader = _isCurrentUserLeader();

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            widget.teamName,
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          bottom: const TabBar(
            indicatorColor: AppTheme.primaryColor,
            labelColor: AppTheme.primaryColor,
            unselectedLabelColor: Colors.grey,
            tabs: [
              Tab(text: 'Thành viên'),
              Tab(text: 'Lịch chơi'),
            ],
          ),
        ),
        body: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _errorMessage != null
                ? Center(child: Text(_errorMessage!))
                : _teamDetail == null
                    ? const Center(child: Text('Không tìm thấy thông tin nhóm'))
                    : TabBarView(
                        children: [
                          _buildMembersTab(isDark, amILeader),
                          _buildSchedulesTab(isDark, amILeader),
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
          backgroundColor: AppTheme.primaryColor,
          icon: const Icon(Icons.chat_bubble_rounded, color: Colors.white),
          label: const Text(
            'Trò chuyện nhóm',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          elevation: 4,
        ),
      ),
    );
  }

  Widget _buildMembersTab(bool isDark, bool amILeader) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          child: Text(
            'Thành viên (${_teamDetail!.members.length})',
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 0.1),
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: _teamDetail!.members.length,
            padding: const EdgeInsets.only(bottom: 80.0),
            itemBuilder: (context, index) {
              final member = _teamDetail!.members[index];
              final isMe = _currentUserProfile?.userId == member.userId;
              final isExpanded = _expandedMemberId == member.userId;

              return AppCard(
                margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 16),
                padding: EdgeInsets.zero,
                child: InkWell(
                  onTap: () {
                    setState(() {
                      _expandedMemberId = isExpanded ? null : member.userId;
                    });
                  },
                  borderRadius: BorderRadius.circular(20.0),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: member.roleName.toLowerCase() == 'leader'
                                      ? const Color(0xFFFFC107)
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
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    member.fullName + (isMe ? ' (Bạn)' : ''),
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, letterSpacing: 0.1),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    member.roleName,
                                    style: TextStyle(fontSize: 12, color: isDark ? Colors.grey[400] : Colors.grey[600]),
                                  ),
                                ],
                              ),
                            ),
                            if (member.roleName.toLowerCase() == 'leader') ...[
                              const AppBadge(
                                label: 'Trưởng nhóm',
                                backgroundColor: Color(0x1AFFC107),
                                textColor: Color(0xFFFFC107),
                                icon: Icons.star_rounded,
                              ),
                              const SizedBox(width: 8),
                            ],
                            Icon(
                              isExpanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                              color: isDark ? Colors.white54 : Colors.black54,
                              size: 24,
                            ),
                          ],
                        ),
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
                                  _buildStatItem('Thắng', member.wins.toString(), AppTheme.primaryColor),
                                  _buildStatItem('Thua', member.losses.toString(), const Color(0xFFFF5252)),
                                  if (amILeader && !isMe)
                                    AppButton(
                                      onPressed: () => _removeMember(member.userId),
                                      text: 'Kích khỏi nhóm',
                                      type: AppButtonType.secondary,
                                      height: 40,
                                      icon: const Icon(Icons.person_remove_rounded, color: Color(0xFFFF5252), size: 16),
                                    ),
                                ],
                              ),
                            ],
                          ),
                          crossFadeState: isExpanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
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
    );
  }

  Widget _buildSchedulesTab(bool isDark, bool amILeader) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Lịch giao lưu nhóm (${_schedules.length})',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 0.1),
              ),
              if (amILeader)
                IconButton(
                  tooltip: 'Tạo buổi giao lưu',
                  icon: const Icon(Icons.add_circle_rounded, color: AppTheme.primaryColor, size: 28),
                  onPressed: () async {
                    final created = await Navigator.push<bool>(
                      context,
                      MaterialPageRoute(builder: (_) => CreateScheduleScreen(teamId: widget.teamId)),
                    );
                    if (created == true) {
                      _fetchSchedules();
                    }
                  },
                ),
            ],
          ),
        ),
        Expanded(
          child: _isLoadingSchedules
              ? const Center(child: CircularProgressIndicator())
              : _schedules.isEmpty
                  ? const Center(child: Text('Chưa có lịch chơi nhóm nào được lên lịch.', style: TextStyle(color: Colors.grey)))
                  : ListView.builder(
                      itemCount: _schedules.length,
                      padding: const EdgeInsets.only(bottom: 80.0),
                      itemBuilder: (context, index) {
                        final schedule = _schedules[index];
                        final scheduleId = schedule['scheduleId'] as String;
                        final title = schedule['title'] ?? 'Giao lưu CLB';
                        
                        final booking = schedule['booking'];
                        final facilityName = booking != null ? booking['facilityName'] : 'Chưa xác định';
                        final courtName = booking != null ? booking['courtName'] : '';
                        final startTime = booking != null ? _formatDateTime(booking['startTime']) : '';
                        final totalCost = booking != null ? (booking['totalCost'] as num?)?.toDouble() : null;

                        final maxP = schedule['maxParticipants'] as int? ?? 12;
                        final participants = schedule['participants'] as List<dynamic>? ?? [];
                        final joinedCount = participants.length;

                        final bool isJoined = _currentUserProfile != null &&
                            participants.any((p) => p['userId'] == _currentUserProfile!.userId);

                        MatchChallengeResponse? activeChallenge;
                        try {
                          activeChallenge = _teamChallenges.firstWhere((c) => c.scheduleId == scheduleId);
                        } catch (_) {
                          activeChallenge = null;
                        }

                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                          child: AppCard(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        title.toUpperCase(),
                                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                                      ),
                                    ),
                                    if (amILeader)
                                      IconButton(
                                        icon: const Icon(Icons.delete_outline, color: Colors.red),
                                        onPressed: () => _deleteSchedule(scheduleId),
                                      ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    const Icon(Icons.location_on_outlined, size: 16, color: Colors.grey),
                                    const SizedBox(width: 8),
                                    Text('$facilityName ${courtName.isNotEmpty ? "- $courtName" : ""}',
                                        style: const TextStyle(color: Colors.grey)),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Row(
                                  children: [
                                    const Icon(Icons.access_time_rounded, size: 16, color: Colors.grey),
                                    const SizedBox(width: 8),
                                    Text(startTime, style: const TextStyle(color: Colors.grey)),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Row(
                                  children: [
                                    const Icon(Icons.people_outline_rounded, size: 16, color: Colors.grey),
                                    const SizedBox(width: 8),
                                    Text('Sĩ số: $joinedCount / $maxP thành viên',
                                        style: const TextStyle(color: Colors.grey)),
                                  ],
                                ),
                                if (totalCost != null) ...[
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      const Icon(Icons.payments_outlined, size: 16, color: Colors.grey),
                                      const SizedBox(width: 8),
                                      Text('Tổng tiền sân: ${totalCost.toStringAsFixed(0)} VND',
                                          style: const TextStyle(color: Colors.grey)),
                                    ],
                                  ),
                                ],
                                const SizedBox(height: 6),
                                Row(
                                  children: [
                                    const Icon(Icons.local_fire_department_rounded, size: 16, color: Colors.orangeAccent),
                                    const SizedBox(width: 8),
                                    if (activeChallenge != null) ...[
                                      Text(
                                        'Kèo ghép: ${activeChallenge.statusName.toUpperCase()}',
                                        style: TextStyle(
                                          color: activeChallenge.statusId == 2 ? AppTheme.primaryColor : Colors.orangeAccent,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13,
                                        ),
                                      ),
                                      if (amILeader && activeChallenge.statusId == 1) ...[
                                        const SizedBox(width: 12),
                                        InkWell(
                                          onTap: () {
                                            Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                builder: (_) => MatchRequestsScreen(
                                                  challengeId: activeChallenge!.challengeId,
                                                  scheduleTitle: title,
                                                ),
                                              ),
                                            ).then((_) => _fetchSchedules());
                                          },
                                          child: const AppBadge(
                                            label: 'Xem yêu cầu',
                                            backgroundColor: Color(0x1A00663C),
                                            textColor: AppTheme.primaryColor,
                                            icon: Icons.people_outline,
                                          ),
                                        ),
                                      ],
                                    ] else ...[
                                      const Text(
                                        'Chưa đăng bắt kèo',
                                        style: TextStyle(color: Colors.grey, fontSize: 13),
                                      ),
                                      if (amILeader) ...[
                                        const SizedBox(width: 12),
                                        InkWell(
                                          onTap: () => _showCreateChallengeDialog(scheduleId),
                                          child: const AppBadge(
                                            label: 'Tìm đối thủ',
                                            backgroundColor: Color(0x1A00663C),
                                            textColor: AppTheme.primaryColor,
                                            icon: Icons.add,
                                          ),
                                        ),
                                      ],
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 16),
                                const Divider(),
                                const SizedBox(height: 8),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    // RSVP button
                                    ElevatedButton(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: isJoined ? Colors.grey[750] : AppTheme.primaryColor,
                                        foregroundColor: isJoined ? Colors.white : Colors.black,
                                      ),
                                      onPressed: isJoined
                                          ? () => _leaveSchedule(scheduleId)
                                          : (joinedCount < maxP ? () => _joinSchedule(scheduleId) : null),
                                      child: Text(isJoined
                                          ? 'HỦY THAM GIA'
                                          : (joinedCount < maxP ? 'THAM GIA NGAY' : 'HẾT CHỖ')),
                                    ),

                                    // Leader operational buttons
                                    if (amILeader)
                                      Row(
                                        children: [
                                          IconButton(
                                            tooltip: 'Điểm danh',
                                            icon: const Icon(Icons.fact_check_outlined, color: AppTheme.primaryColor),
                                            onPressed: () {
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (_) => AttendanceScreen(
                                                    scheduleId: scheduleId,
                                                    scheduleTitle: title,
                                                  ),
                                                ),
                                              );
                                            },
                                          ),
                                          IconButton(
                                            tooltip: 'Chia tiền sân',
                                            icon: const Icon(Icons.monetization_on_outlined, color: Colors.amber),
                                            onPressed: () {
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (_) => SplitBillScreen(
                                                    scheduleId: scheduleId,
                                                    scheduleTitle: title,
                                                  ),
                                                ),
                                              ).then((_) => _fetchSchedules());
                                            },
                                          ),
                                        ],
                                      ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
        ),
      ],
    );
  }

  Widget _buildAvatar(TeamMemberResponse member) {
    final avatarId = member.avatarFileId?.isNotEmpty == true ? member.avatarFileId : _userAvatars[member.userId];

    if (avatarId != null && avatarId.isNotEmpty) {
      return ClipOval(
        child: AppMediaImage(
          fileId: avatarId,
          width: 48,
          height: 48,
          fit: BoxFit.cover,
        ),
      );
    } else {
      return CircleAvatar(
        radius: 24,
        backgroundColor: _getAvatarColor(member.fullName),
        child: Text(
          member.fullName.isNotEmpty ? member.fullName[0].toUpperCase() : 'U',
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      );
    }
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color),
        ),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
      ],
    );
  }

  void _showCreateChallengeDialog(String scheduleId) {
    final messageController = TextEditingController();
    int selectedSportId = 1; // Default to Badminton
    bool isCostSplit = true;

    showDialog(
      context: context,
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: isDark ? AppTheme.darkSurfaceColor : Colors.white,
              title: const Text(
                'Đăng Tin Bắt Kèo',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Tạo yêu cầu ghép đối thủ giao lưu cho buổi chơi này.',
                      style: TextStyle(color: Colors.grey, fontSize: 13),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Chọn bộ môn:',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: isDark ? Colors.white54.withValues(alpha: 0.05) : Colors.grey[100],
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<int>(
                          value: selectedSportId,
                          dropdownColor: isDark ? AppTheme.darkSurfaceColor : Colors.white,
                          isExpanded: true,
                          items: const [
                            DropdownMenuItem(value: 1, child: Text('Cầu lông')),
                            DropdownMenuItem(value: 2, child: Text('Tennis')),
                            DropdownMenuItem(value: 3, child: Text('Pickleball')),
                          ],
                          onChanged: (val) {
                            if (val != null) {
                              setDialogState(() {
                                selectedSportId = val;
                              });
                            }
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Chia đôi tiền sân:',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        Switch(
                          value: isCostSplit,
                          activeThumbColor: AppTheme.primaryColor,
                          onChanged: (val) {
                            setDialogState(() {
                              isCostSplit = val;
                            });
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Lời nhắn gửi đối thủ:',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: messageController,
                      maxLines: 3,
                      decoration: InputDecoration(
                        hintText: 'Nhập trình độ mong muốn, ghi chú...',
                        hintStyle: const TextStyle(fontSize: 13, color: Colors.grey),
                        fillColor: isDark ? Colors.white54.withValues(alpha: 0.05) : Colors.grey[100],
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: isDark ? Colors.white10 : Colors.black12),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Hủy', style: TextStyle(color: Colors.grey)),
                ),
                ElevatedButton(
                  onPressed: () async {
                    Navigator.pop(context);
                    setState(() {
                      _isLoadingSchedules = true;
                    });
                    try {
                      final req = CreateMatchChallengeRequest(
                        scheduleId: scheduleId,
                        hostTeamId: widget.teamId,
                        sportId: selectedSportId,
                        isCostSplit: isCostSplit,
                        message: messageController.text.trim(),
                      );
                      final res = await _matchmakingRepository.createChallenge(req);
                      if (mounted) {
                        if (res.success) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Đã đăng tin bắt kèo thành công!'),
                              backgroundColor: AppTheme.primaryColor,
                            ),
                          );
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(res.message),
                              backgroundColor: Colors.red,
                            ),
                          );
                        }
                      }
                    } catch (_) {
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Đã xảy ra lỗi kết nối.'), backgroundColor: Colors.red),
                        );
                      }
                    } finally {
                      _fetchSchedules();
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Đăng tin'),
                ),
              ],
            );
          },
        );
      },
    );
  }
}
