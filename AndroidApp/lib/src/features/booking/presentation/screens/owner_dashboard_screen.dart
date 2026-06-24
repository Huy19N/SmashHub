import 'package:flutter/material.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/network/api_client.dart';
import '../../../../shared/widgets/app_card.dart';

class OwnerDashboardScreen extends StatefulWidget {
  const OwnerDashboardScreen({super.key});

  @override
  State<OwnerDashboardScreen> createState() => _OwnerDashboardScreenState();
}

class _OwnerDashboardScreenState extends State<OwnerDashboardScreen> {
  final ApiClient _apiClient = ApiClient();
  bool _isLoading = true;
  String? _errorMessage;
  
  double _totalRevenue = 0.0;
  int _totalBookings = 0;
  int _uniqueCustomers = 0;
  String _peakHour = 'Chưa có';
  String _mostBookedCourt = 'Chưa có';
  
  List<dynamic> _dailyStats = [];
  List<dynamic> _monthlyStats = [];

  @override
  void initState() {
    super.initState();
    _loadStatistics();
  }

  Future<void> _loadStatistics() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await _apiClient.get('/api/statistics/me');
      final data = response.data;
      
      if (data['success'] == true && data['data'] != null) {
        final statsData = data['data'];
        final ownerStats = statsData['facilityOwnerStats'];
        
        if (ownerStats != null) {
          setState(() {
            _totalRevenue = (ownerStats['totalRevenue'] as num?)?.toDouble() ?? 0.0;
            _totalBookings = ownerStats['totalBookingsCount'] as int? ?? 0;
            _uniqueCustomers = ownerStats['uniqueCustomersCount'] as int? ?? 0;
            _peakHour = ownerStats['peakHour'] as String? ?? 'Chưa có';
            _mostBookedCourt = ownerStats['mostBookedCourt'] as String? ?? 'Chưa có';
            _dailyStats = ownerStats['dailyStats'] as List<dynamic>? ?? [];
            _monthlyStats = ownerStats['monthlyStats'] as List<dynamic>? ?? [];
          });
        }
      } else {
        setState(() {
          _errorMessage = data['message'] ?? 'Lỗi tải số liệu thống kê';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Lỗi kết nối máy chủ khi tải thống kê';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  String _formatCurrency(double amount) {
    if (amount >= 1000000) {
      return '${(amount / 1000000).toStringAsFixed(1)}M VND';
    }
    if (amount >= 1000) {
      return '${(amount / 1000).toStringAsFixed(0)}K VND';
    }
    return '${amount.toStringAsFixed(0)} VND';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
          ),
        ),
      );
    }

    if (_errorMessage != null) {
      return Scaffold(
        appBar: AppBar(title: const Text('THỐNG KÊ DOANH THU')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline_rounded, size: 64, color: Colors.red),
                const SizedBox(height: 16),
                Text(
                  _errorMessage!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _loadStatistics,
                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryColor),
                  child: const Text('Thử lại', style: TextStyle(color: Colors.black)),
                ),
              ],
            ),
          ),
        ),
      );
    }

    // Tính doanh thu cao nhất trong tuần để vẽ tỉ lệ biểu đồ
    double maxRevenue = 1.0;
    for (var item in _dailyStats) {
      final rev = (item['revenue'] as num?)?.toDouble() ?? 0.0;
      if (rev > maxRevenue) maxRevenue = rev;
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'THỐNG KÊ DOANH THU',
          style: TextStyle(fontWeight: FontWeight.w900),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _loadStatistics,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Revenue Card (Large)
            AppCard(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.account_balance_wallet_rounded,
                      color: AppTheme.primaryColor,
                      size: 32,
                    ),
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'TỔNG DOANH THU',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey,
                            letterSpacing: 1.2,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          _formatCurrency(_totalRevenue),
                          style: const TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.w900,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 2 Column statistics cards
            Row(
              children: [
                Expanded(
                  child: AppCard(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Số Lượt Đặt',
                              style: TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                            Icon(Icons.calendar_today_rounded, color: AppTheme.primaryColor, size: 18),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          _totalBookings.toString(),
                          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: AppCard(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Khách Hàng',
                              style: TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                            Icon(Icons.people_alt_rounded, color: AppTheme.primaryColor, size: 18),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          _uniqueCustomers.toString(),
                          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Analytical Summaries
            const Text(
              'TÌNH HÌNH HOẠT ĐỘNG',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 12),
            AppCard(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _buildSummaryRow(
                    icon: Icons.access_time_filled_rounded,
                    label: 'Giờ cao điểm nhất',
                    value: _peakHour,
                  ),
                  const Divider(height: 24),
                  _buildSummaryRow(
                    icon: Icons.sports_tennis_rounded,
                    label: 'Sân được đặt nhiều nhất',
                    value: _mostBookedCourt,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Revenue Bar Chart (Last 7 Days)
            const Text(
              'DOANH THU 7 NGÀY QUA',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 12),
            if (_dailyStats.isEmpty)
              const AppCard(
                padding: EdgeInsets.symmetric(vertical: 32),
                child: Center(
                  child: Text(
                    'Chưa có dữ liệu giao dịch 7 ngày qua.',
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
              )
            else
              AppCard(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    SizedBox(
                      height: 160,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: _dailyStats.map((item) {
                          final label = item['label'] as String? ?? '';
                          final revenue = (item['revenue'] as num?)?.toDouble() ?? 0.0;
                          final ratio = revenue / maxRevenue;

                          return Expanded(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                Tooltip(
                                  message: '${revenue.toStringAsFixed(0)} VND',
                                  child: Container(
                                    height: (110 * ratio).clamp(4.0, 110.0),
                                    margin: const EdgeInsets.symmetric(horizontal: 6),
                                    decoration: BoxDecoration(
                                      color: AppTheme.primaryColor,
                                      borderRadius: BorderRadius.circular(4),
                                      boxShadow: [
                                        BoxShadow(
                                          color: AppTheme.primaryColor.withValues(alpha: 0.3),
                                          blurRadius: 4,
                                          spreadRadius: 1,
                                        )
                                      ],
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  label,
                                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      children: [
        Icon(icon, color: AppTheme.primaryColor, size: 24),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            label,
            style: const TextStyle(fontSize: 14, color: Colors.grey, fontWeight: FontWeight.bold),
          ),
        ),
        Text(
          value,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}
