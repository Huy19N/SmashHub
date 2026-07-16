import 'package:flutter/material.dart';
import '../../../shared/theme/app_theme.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/network/api_client.dart';
import '../../../shared/widgets/payment_webview_screen.dart';
import 'payment_history_screen.dart';

class SubscriptionScreen extends StatefulWidget {
  const SubscriptionScreen({super.key});

  @override
  State<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends State<SubscriptionScreen> {
  final ApiClient _apiClient = ApiClient();
  List<dynamic> _plans = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchPlans();
  }

  Future<void> _fetchPlans() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final res = await _apiClient.get('/api/subscriptions/plans');
      if (mounted) {
        if (res.data['success'] == true) {
          setState(() {
            _plans = res.data['data'] as List<dynamic>? ?? [];
            _isLoading = false;
          });
        } else {
          setState(() {
            _errorMessage = res.data['message'] ?? 'Lỗi tải các gói dịch vụ.';
            _isLoading = false;
          });
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Lỗi kết nối máy chủ.';
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _purchasePlan(int planId, String tierName) async {
    setState(() {
      _isLoading = true;
    });
    try {
      final res = await _apiClient.post(
        '/api/payments/subscription',
        data: {'planId': planId},
      );
      if (mounted) {
        if (res.data['success'] == true) {
          final checkoutUrl = res.data['data']['checkoutUrl'] as String?;
          if (checkoutUrl != null && checkoutUrl.isNotEmpty) {
            final bool? paymentSuccess = await Navigator.push<bool>(
              context,
              MaterialPageRoute(
                builder: (_) => PaymentWebViewScreen(
                  url: checkoutUrl,
                  title: 'Thanh toán gói $tierName',
                ),
              ),
            );

            if (mounted) {
              if (paymentSuccess == true) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Nâng cấp gói dịch vụ $tierName thành công!'),
                    backgroundColor: AppTheme.primaryColor,
                  ),
                );
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Giao dịch thanh toán đã bị hủy.'),
                    backgroundColor: Colors.orange,
                  ),
                );
              }
            }
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Không lấy được link thanh toán.'),
                backgroundColor: Colors.red,
              ),
            );
          }
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(res.data['message'] ?? 'Tạo hóa đơn thanh toán thất bại.'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Lỗi kết nối khi gửi yêu cầu nâng cấp gói.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        _fetchPlans();
      }
    }
  }

  String _formatVND(double amount) {
    return '${amount.toStringAsFixed(0).replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (Match m) => '${m[1]}.',
        )} VND';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBackgroundColor : AppTheme.lightBackgroundColor,
      appBar: AppBar(
        title: const Text(
          'GÓI TÀI KHOẢN',
          style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 0.5),
        ),
        actions: [
          IconButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const PaymentHistoryScreen()),
              );
            },
            icon: const Icon(Icons.history_rounded),
            tooltip: 'Lịch sử giao dịch',
          ),
        ],
      ),
      body: _isLoading && _plans.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_errorMessage!, style: const TextStyle(color: Colors.red)),
                      const SizedBox(height: 16),
                      AppButton(
                        onPressed: _fetchPlans,
                        text: 'Tải lại',
                        width: 120,
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  itemCount: _plans.length,
                  padding: const EdgeInsets.all(16),
                  itemBuilder: (context, index) {
                    final plan = _plans[index];
                    final tierName = plan['tierName'] as String? ?? 'Gói';
                    final price = (plan['price'] as num?)?.toDouble() ?? 0.0;
                    final durationMonths = plan['durationMonths'] as int? ?? 1;
                    final features = (plan['features'] as String? ?? '').split('\n');

                    final isPremium = tierName.toLowerCase().contains('premium');
                    final isStandard = tierName.toLowerCase().contains('standard');

                    Color cardAccentColor = AppTheme.primaryColor;
                    if (isPremium) {
                      cardAccentColor = Colors.amber;
                    } else if (isStandard) {
                      cardAccentColor = Colors.blueAccent;
                    }

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16.0),
                      child: AppCard(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  tierName.toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.w900,
                                    color: cardAccentColor,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: cardAccentColor.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    '$durationMonths THÁNG',
                                    style: TextStyle(
                                      color: cardAccentColor,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 11,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              price == 0 ? 'MIỄN PHÍ' : _formatVND(price),
                              style: const TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.2,
                              ),
                            ),
                            const SizedBox(height: 16),
                            const Divider(),
                            const SizedBox(height: 12),
                            const Text(
                              'Đặc quyền bao gồm:',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                            const SizedBox(height: 8),
                            Column(
                              children: features.map((feature) {
                                if (feature.trim().isEmpty) return const SizedBox.shrink();
                                return Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 4.0),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Icon(
                                        Icons.check_circle_rounded,
                                        size: 16,
                                        color: cardAccentColor,
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          feature,
                                          style: const TextStyle(fontSize: 13),
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              }).toList(),
                            ),
                            const SizedBox(height: 20),
                            AppButton(
                              onPressed: price == 0
                                  ? null
                                  : () => _purchasePlan(plan['planId'] as int, tierName),
                              text: price == 0 ? 'GÓI MẶC ĐỊNH' : 'NÂNG CẤP NGAY',
                              width: double.infinity,
                              type: price == 0 ? AppButtonType.secondary : AppButtonType.primary,
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
