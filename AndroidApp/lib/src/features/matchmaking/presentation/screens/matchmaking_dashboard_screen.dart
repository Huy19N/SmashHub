import 'package:flutter/material.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/widgets/app_card.dart';
import '../../../../shared/widgets/app_badge.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../shared/network/api_client.dart';
import '../../data/data_sources/matchmaking_remote_data_source.dart';
import '../../data/repositories/matchmaking_repository_impl.dart';
import '../../data/models/matchmaking_models.dart';
import '../../../community/data/data_sources/community_remote_data_source.dart';
import '../../../community/data/repositories/community_repository_impl.dart';
import '../../../community/data/models/community_models.dart';

class MatchmakingDashboardScreen extends StatefulWidget {
  const MatchmakingDashboardScreen({super.key});

  @override
  State<MatchmakingDashboardScreen> createState() => _MatchmakingDashboardScreenState();
}

class _MatchmakingDashboardScreenState extends State<MatchmakingDashboardScreen> {
  late final MatchmakingRepositoryImpl _matchmakingRepository;
  late final CommunityRepositoryImpl _communityRepository;

  List<MatchChallengeResponse> _challenges = [];
  List<TeamResponse> _myTeams = [];
  bool _isLoading = true;
  String? _errorMessage;

  // Filters
  int? _selectedSportId;
  final TextEditingController _cityController = TextEditingController();
  final TextEditingController _districtController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final apiClient = ApiClient();
    _matchmakingRepository = MatchmakingRepositoryImpl(
      MatchmakingRemoteDataSource(apiClient),
    );
    _communityRepository = CommunityRepositoryImpl(
      CommunityRemoteDataSource(apiClient),
    );
    _fetchData();
  }

  @override
  void dispose() {
    _cityController.dispose();
    _districtController.dispose();
    super.dispose();
  }

  Future<void> _fetchData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final challengeRes = await _matchmakingRepository.getActiveChallenges(
        sportId: _selectedSportId,
        city: _cityController.text.trim(),
        district: _districtController.text.trim(),
      );

      final teamsRes = await _communityRepository.getTeams(pageNumber: 1, pageSize: 50);

      if (mounted) {
        setState(() {
          if (challengeRes.success) {
            _challenges = challengeRes.data ?? [];
          } else {
            _errorMessage = challengeRes.message;
          }

          if (teamsRes.success && teamsRes.data != null) {
            _myTeams = teamsRes.data!.items;
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Lỗi không xác định khi tải dữ liệu.';
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _joinChallenge(String challengeId, String teamId) async {
    setState(() {
      _isLoading = true;
    });
    try {
      final res = await _matchmakingRepository.joinChallenge(
        challengeId,
        JoinMatchRequest(challengerTeamId: teamId),
      );
      if (mounted) {
        if (res.success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Đã gửi yêu cầu ghép đấu thành công! Chờ đối thủ xác nhận.'),
              backgroundColor: AppTheme.primaryColor,
            ),
          );
          _fetchData();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(res.message ?? 'Đăng ký ghép đấu thất bại.'),
              backgroundColor: Colors.red,
            ),
          );
          setState(() {
            _isLoading = false;
          });
        }
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Lỗi kết nối khi gửi yêu cầu.'), backgroundColor: Colors.red),
        );
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _showJoinDialog(MatchChallengeResponse challenge) {
    if (_myTeams.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Bạn cần tham gia hoặc tạo một nhóm trước khi bắt kèo!'),
          backgroundColor: Colors.amber,
        ),
      );
      return;
    }

    String selectedTeamId = _myTeams.first.teamId;

    showDialog(
      context: context,
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: isDark ? AppTheme.darkSurfaceColor : Colors.white,
              title: const Text(
                'Bắt Kèo Giao Lưu',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Bạn đang yêu cầu ghép đấu với đội ${challenge.hostTeamName}.',
                    style: const TextStyle(fontSize: 14),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Chọn đội của bạn:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white54.withOpacity(0.05) : Colors.grey[100],
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: selectedTeamId,
                        dropdownColor: isDark ? AppTheme.darkSurfaceColor : Colors.white,
                        isExpanded: true,
                        items: _myTeams.map((t) {
                          return DropdownMenuItem<String>(
                            value: t.teamId,
                            child: Text(t.teamName),
                          );
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) {
                            setDialogState(() {
                              selectedTeamId = val;
                            });
                          }
                        },
                      ),
                    ),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Hủy', style: TextStyle(color: Colors.grey)),
                ),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    _joinChallenge(challenge.challengeId, selectedTeamId);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Gửi yêu cầu'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  String _formatDateTime(DateTime dt) {
    return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')} - ${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBackgroundColor : AppTheme.lightBackgroundColor,
      appBar: AppBar(
        title: const Text(
          'BẮT KÈO GHÉP ĐẤU',
          style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 0.5),
        ),
      ),
      body: Column(
        children: [
          // Filter section
          _buildFilterPanel(isDark),

          // Main content list
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _errorMessage != null
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(_errorMessage!, style: const TextStyle(color: Colors.red)),
                            const SizedBox(height: 16),
                            AppButton(
                              onPressed: _fetchData,
                              text: 'Tải lại',
                              width: 120,
                            ),
                          ],
                        ),
                      )
                    : _challenges.isEmpty
                        ? const Center(
                            child: Text(
                              'Hiện tại không có kèo ghép đấu nào hoạt động.',
                              style: TextStyle(color: Colors.grey),
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: _fetchData,
                            color: AppTheme.primaryColor,
                            child: ListView.builder(
                              itemCount: _challenges.length,
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              itemBuilder: (context, index) {
                                final challenge = _challenges[index];
                                final isSplit = challenge.isCostSplit;
                                final startTimeStr = _formatDateTime(challenge.startTime);

                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 12.0),
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
                                                challenge.hostTeamName.toUpperCase(),
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.w900,
                                                  fontSize: 16,
                                                  letterSpacing: 0.1,
                                                ),
                                              ),
                                            ),
                                            const SizedBox(width: 8),
                                            AppBadge(
                                              label: challenge.sportName,
                                              backgroundColor: AppTheme.primaryColor.withOpacity(0.15),
                                              textColor: AppTheme.primaryColor,
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 12),
                                        Container(
                                          width: double.infinity,
                                          padding: const EdgeInsets.all(12),
                                          decoration: BoxDecoration(
                                            color: isDark ? Colors.white.withOpacity(0.03) : Colors.grey[100],
                                            borderRadius: BorderRadius.circular(12),
                                            border: Border.all(
                                              color: isDark ? Colors.white10 : Colors.black12,
                                            ),
                                          ),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                challenge.scheduleTitle,
                                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                              ),
                                              const SizedBox(height: 6),
                                              Text(
                                                '📍 Sân: ${challenge.facilityName ?? "Chưa xác định"} - ${challenge.courtName ?? ""}',
                                                style: const TextStyle(fontSize: 13, color: Colors.grey),
                                              ),
                                              const SizedBox(height: 4),
                                              Text(
                                                '⏰ Thời gian: $startTimeStr',
                                                style: const TextStyle(fontSize: 13, color: Colors.grey),
                                              ),
                                              const SizedBox(height: 4),
                                              Row(
                                                children: [
                                                  const Text(
                                                    '💰 Phí sân: ',
                                                    style: TextStyle(fontSize: 13, color: Colors.grey),
                                                  ),
                                                  Text(
                                                    '${challenge.totalCost.toStringAsFixed(0)} VND',
                                                    style: const TextStyle(
                                                      fontSize: 13,
                                                      fontWeight: FontWeight.bold,
                                                      color: AppTheme.primaryColor,
                                                    ),
                                                  ),
                                                  if (isSplit) ...[
                                                    const SizedBox(width: 8),
                                                    const AppBadge(
                                                      label: 'CHIA ĐÔI',
                                                      backgroundColor: Color(0x1AFF9800),
                                                      textColor: Color(0xFFFF9800),
                                                    ),
                                                  ],
                                                ],
                                              ),
                                            ],
                                          ),
                                        ),
                                        if (challenge.message != null && challenge.message!.isNotEmpty) ...[
                                          const SizedBox(height: 10),
                                          Text(
                                            '"${challenge.message}"',
                                            style: const TextStyle(
                                              fontSize: 13,
                                              fontStyle: FontStyle.italic,
                                              color: Colors.grey,
                                            ),
                                          ),
                                        ],
                                        const SizedBox(height: 16),
                                        AppButton(
                                          onPressed: challenge.statusId == 1
                                              ? () => _showJoinDialog(challenge)
                                              : null,
                                          text: challenge.statusId == 1 ? 'BẮT KÈO NGAY' : 'ĐÃ CÓ ĐỐI THỦ',
                                          width: double.infinity,
                                          type: challenge.statusId == 1
                                              ? AppButtonType.primary
                                              : AppButtonType.secondary,
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterPanel(bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkSurfaceColor : Colors.white,
        border: Border(
          bottom: BorderSide(
            color: isDark ? Colors.white10 : Colors.black12,
            width: 1,
          ),
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Container(
                  height: 40,
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey[100],
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: TextField(
                    controller: _cityController,
                    style: const TextStyle(fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Thành phố...',
                      hintStyle: const TextStyle(color: Colors.grey, fontSize: 13),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      filled: false,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Container(
                  height: 40,
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey[100],
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: TextField(
                    controller: _districtController,
                    style: const TextStyle(fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Quận/Huyện...',
                      hintStyle: const TextStyle(color: Colors.grey, fontSize: 13),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      filled: false,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                height: 40,
                padding: const EdgeInsets.symmetric(horizontal: 8),
                decoration: BoxDecoration(
                  color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey[100],
                  borderRadius: BorderRadius.circular(10),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<int?>(
                    value: _selectedSportId,
                    hint: const Text('Môn', style: TextStyle(color: Colors.grey, fontSize: 13)),
                    dropdownColor: isDark ? AppTheme.darkSurfaceColor : Colors.white,
                    style: TextStyle(color: isDark ? Colors.white : Colors.black, fontSize: 13),
                    items: const [
                      DropdownMenuItem(value: null, child: Text('Tất cả')),
                      DropdownMenuItem(value: 1, child: Text('Cầu lông')),
                      DropdownMenuItem(value: 2, child: Text('Tennis')),
                      DropdownMenuItem(value: 3, child: Text('Pickleball')),
                    ],
                    onChanged: (val) {
                      setState(() {
                        _selectedSportId = val;
                      });
                    },
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                style: IconButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor.withOpacity(0.15),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                icon: const Icon(Icons.search, color: AppTheme.primaryColor, size: 20),
                onPressed: _fetchData,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
