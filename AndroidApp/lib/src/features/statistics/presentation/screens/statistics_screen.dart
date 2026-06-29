import 'package:flutter/material.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/network/api_client.dart';
import '../../data/data_sources/statistics_remote_data_source.dart';
import '../../data/repositories/statistics_repository_impl.dart';
import '../../data/models/statistics_model.dart';
import '../../../../shared/widgets/app_card.dart';
import 'package:intl/intl.dart';

class StatisticsScreen extends StatefulWidget {
  const StatisticsScreen({super.key});

  @override
  State<StatisticsScreen> createState() => _StatisticsScreenState();
}

class _StatisticsScreenState extends State<StatisticsScreen> {
  late final StatisticsRepositoryImpl _repository;
  UserStatisticsResponse? _stats;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    final apiClient = ApiClient();
    _repository = StatisticsRepositoryImpl(StatisticsRemoteDataSource(apiClient));
    _loadStatistics();
  }

  Future<void> _loadStatistics() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final response = await _repository.getMyStatistics();

    if (mounted) {
      setState(() {
        _isLoading = false;
        if (response.success && response.data != null) {
          _stats = response.data;
        } else {
          _errorMessage = response.message;
        }
      });
    }
  }

  String _formatCurrency(double amount) {
    final formatCurrency = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
    return formatCurrency.format(amount);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBackgroundColor : AppTheme.lightBackgroundColor,
      appBar: AppBar(
        title: const Text('Thống kê hoạt động'),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(child: Text(_errorMessage!, style: const TextStyle(color: Colors.red)))
              : _stats == null
                  ? const Center(child: Text('Không có dữ liệu thống kê'))
                  : RefreshIndicator(
                      onRefresh: _loadStatistics,
                      child: SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Tổng quan',
                              style: theme.textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 20),
                            _buildStatCard(
                              icon: Icons.sports_tennis_rounded,
                              title: 'Số trận tham gia',
                              value: '${_stats!.generalStats.totalMatchesJoined} trận',
                              color: Colors.blueAccent,
                              isDark: isDark,
                            ),
                            const SizedBox(height: 16),
                            _buildStatCard(
                              icon: Icons.account_balance_wallet_rounded,
                              title: 'Tổng chi tiêu',
                              value: _formatCurrency(_stats!.generalStats.totalSpending),
                              color: Colors.green,
                              isDark: isDark,
                            ),
                            const SizedBox(height: 16),
                            _buildStatCard(
                              icon: Icons.local_fire_department_rounded,
                              title: 'Môn chơi nhiều nhất',
                              value: _stats!.generalStats.mostPlayedSport,
                              color: Colors.orange,
                              isDark: isDark,
                            ),
                          ],
                        ),
                      ),
                    ),
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String title,
    required String value,
    required Color color,
    required bool isDark,
  }) {
    return AppCard(
      padding: const EdgeInsets.all(20),
      borderRadius: 16,
      backgroundColor: isDark ? AppTheme.darkSurfaceColor : Colors.white,
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: isDark ? Colors.grey[400] : Colors.grey[600],
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: TextStyle(
                    color: isDark ? Colors.white : Colors.black87,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
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
