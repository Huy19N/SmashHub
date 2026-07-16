import 'package:flutter/material.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/widgets/app_card.dart';
import '../../../../shared/widgets/app_badge.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../shared/network/api_client.dart';
import '../../data/data_sources/matchmaking_remote_data_source.dart';
import '../../data/repositories/matchmaking_repository_impl.dart';
import '../../data/models/matchmaking_models.dart';

class MatchRequestsScreen extends StatefulWidget {
  final String challengeId;
  final String scheduleTitle;

  const MatchRequestsScreen({
    super.key,
    required this.challengeId,
    required this.scheduleTitle,
  });

  @override
  State<MatchRequestsScreen> createState() => _MatchRequestsScreenState();
}

class _MatchRequestsScreenState extends State<MatchRequestsScreen> {
  late final MatchmakingRepositoryImpl _matchmakingRepository;
  List<MatchAcceptanceResponse> _acceptances = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    final apiClient = ApiClient();
    _matchmakingRepository = MatchmakingRepositoryImpl(
      MatchmakingRemoteDataSource(apiClient),
    );
    _fetchAcceptances();
  }

  Future<void> _fetchAcceptances() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final res = await _matchmakingRepository.getAcceptances(widget.challengeId);
      if (mounted) {
        setState(() {
          if (res.success) {
            _acceptances = res.data ?? [];
          } else {
            _errorMessage = res.message;
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Lỗi không xác định khi tải danh sách yêu cầu.';
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _respond(String acceptanceId, bool accept) async {
    setState(() {
      _isLoading = true;
    });
    try {
      final res = await _matchmakingRepository.respondToAcceptance(acceptanceId, accept);
      if (mounted) {
        if (res.success) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(accept
                  ? 'Đã chấp nhận yêu cầu ghép đấu! Hệ thống đã gửi hóa đơn chia đôi phí cho đối thủ.'
                  : 'Đã từ chối yêu cầu ghép đấu.'),
              backgroundColor: accept ? AppTheme.primaryColor : Colors.orange,
            ),
          );
          _fetchAcceptances();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(res.message),
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
          const SnackBar(content: Text('Lỗi kết nối khi gửi phản hồi.'), backgroundColor: Colors.red),
        );
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBackgroundColor : AppTheme.lightBackgroundColor,
      appBar: AppBar(
        title: const Text(
          'YÊU CẦU GHÉP ĐẤU',
          style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 0.5),
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Buổi chơi: ${widget.scheduleTitle.toUpperCase()}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Dưới đây là danh sách các đội nhóm gửi lời giao lưu thách đấu cho bạn.',
                  style: TextStyle(color: Colors.grey, fontSize: 13),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
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
                              onPressed: _fetchAcceptances,
                              text: 'Tải lại',
                              width: 120,
                            ),
                          ],
                        ),
                      )
                    : _acceptances.isEmpty
                        ? const Center(
                            child: Text(
                              'Chưa có yêu cầu ghép đấu nào từ đội khác.',
                              style: TextStyle(color: Colors.grey),
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: _fetchAcceptances,
                            color: AppTheme.primaryColor,
                            child: ListView.builder(
                              itemCount: _acceptances.length,
                              padding: const EdgeInsets.all(16),
                              itemBuilder: (context, index) {
                                final acceptance = _acceptances[index];
                                final bool isPending = acceptance.statusId == 1;

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
                                                acceptance.challengerTeamName.toUpperCase(),
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.w900,
                                                  fontSize: 16,
                                                ),
                                              ),
                                            ),
                                            const SizedBox(width: 8),
                                            AppBadge(
                                              label: acceptance.statusName,
                                              backgroundColor: acceptance.statusId == 2
                                                  ? AppTheme.primaryColor.withValues(alpha: 0.15)
                                                  : acceptance.statusId == 3
                                                      ? Colors.red.withValues(alpha: 0.15)
                                                      : Colors.orange.withValues(alpha: 0.15),
                                              textColor: acceptance.statusId == 2
                                                  ? AppTheme.primaryColor
                                                  : acceptance.statusId == 3
                                                      ? Colors.red
                                                      : Colors.orange,
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 8),
                                        if (acceptance.createdAt != null)
                                          Text(
                                            'Gửi lúc: ${acceptance.createdAt!.hour}:${acceptance.createdAt!.minute.toString().padLeft(2, '0')} - ${acceptance.createdAt!.day}/${acceptance.createdAt!.month}/${acceptance.createdAt!.year}',
                                            style: const TextStyle(fontSize: 12, color: Colors.grey),
                                          ),
                                        if (isPending) ...[
                                          const SizedBox(height: 16),
                                          Row(
                                            children: [
                                              Expanded(
                                                child: AppButton(
                                                  onPressed: () => _respond(acceptance.acceptanceId, false),
                                                  text: 'TỪ CHỐI',
                                                  type: AppButtonType.secondary,
                                                ),
                                              ),
                                              const SizedBox(width: 12),
                                              Expanded(
                                                child: AppButton(
                                                  onPressed: () => _respond(acceptance.acceptanceId, true),
                                                  text: 'CHẤP NHẬN',
                                                  type: AppButtonType.primary,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
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
}
