import 'package:flutter/material.dart';
import '../../../shared/theme/app_theme.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/network/api_client.dart';
import 'package:intl/intl.dart';

class PaymentHistoryScreen extends StatefulWidget {
  const PaymentHistoryScreen({super.key});

  @override
  State<PaymentHistoryScreen> createState() => _PaymentHistoryScreenState();
}

class _PaymentHistoryScreenState extends State<PaymentHistoryScreen> {
  final ApiClient _apiClient = ApiClient();
  List<dynamic> _payments = [];
  bool _isLoading = true;
  String? _errorMessage;
  int _pageIndex = 1;
  int _totalPages = 1;

  @override
  void initState() {
    super.initState();
    _fetchPayments();
  }

  Future<void> _fetchPayments() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final res = await _apiClient.get('/api/payments/my', queryParameters: {
        'pageIndex': _pageIndex,
        'pageSize': 10,
      });
      if (mounted) {
        if (res.data['success'] == true) {
          setState(() {
            _payments = res.data['data']['items'] as List<dynamic>? ?? [];
            _totalPages = res.data['data']['totalPages'] as int? ?? 1;
            _isLoading = false;
          });
        } else {
          setState(() {
            _errorMessage = res.data['message'] ?? 'Lỗi tải lịch sử giao dịch.';
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

  String _formatVND(num amount) {
    return '${amount.toStringAsFixed(0).replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (Match m) => '${m[1]}.',
        )} VND';
  }

  Widget _getStatusBadge(String? statusName) {
    if (statusName == null) return const Text('Unknown');
    final lower = statusName.toLowerCase();
    Color bgColor = Colors.grey[200]!;
    Color textColor = Colors.grey[800]!;
    String text = statusName;

    if (lower.contains('thành công') || lower.contains('paid')) {
      bgColor = Colors.green[100]!;
      textColor = Colors.green[800]!;
      text = 'Thành công';
    } else if (lower.contains('hủy') || lower.contains('cancel')) {
      bgColor = Colors.orange[100]!;
      textColor = Colors.orange[800]!;
      text = 'Đã hủy';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: textColor,
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBackgroundColor : AppTheme.lightBackgroundColor,
      appBar: AppBar(
        title: const Text('Lịch sử giao dịch', style: TextStyle(fontWeight: FontWeight.w900)),
      ),
      body: _isLoading && _payments.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_errorMessage!, style: const TextStyle(color: Colors.red)),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _fetchPayments,
                        child: const Text('Tải lại'),
                      ),
                    ],
                  ),
                )
              : _payments.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.receipt_long_rounded, size: 64, color: Colors.grey[400]),
                          const SizedBox(height: 16),
                          const Text('Chưa có giao dịch nào', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.grey)),
                        ],
                      ),
                    )
                  : Column(
                      children: [
                        Expanded(
                          child: ListView.builder(
                            itemCount: _payments.length,
                            padding: const EdgeInsets.all(16),
                            itemBuilder: (context, index) {
                              final payment = _payments[index];
                              final amount = (payment['amount'] as num?) ?? 0;
                              final type = payment['paymentType'] == 'Booking' ? 'Đặt sân' : payment['paymentType'] == 'Subscription' ? 'Mua gói' : payment['paymentType'];
                              final dateStr = payment['createdAt'] as String?;
                              DateTime? date;
                              if (dateStr != null) {
                                date = DateTime.tryParse(dateStr)?.toLocal();
                              }

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
                                          Text(
                                            '#${payment['orderCode'] ?? 'Unknown'}',
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                          ),
                                          _getStatusBadge(payment['statusName'] as String?),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            type,
                                            style: const TextStyle(color: Colors.grey),
                                          ),
                                          Text(
                                            _formatVND(amount),
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.primaryColor),
                                          ),
                                        ],
                                      ),
                                      if (date != null) ...[
                                        const SizedBox(height: 4),
                                        Row(
                                          children: [
                                            const Icon(Icons.calendar_month_rounded, size: 14, color: Colors.grey),
                                            const SizedBox(width: 4),
                                            Text(
                                              DateFormat('dd/MM/yyyy HH:mm').format(date),
                                              style: const TextStyle(color: Colors.grey, fontSize: 12),
                                            ),
                                          ],
                                        ),
                                      ]
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                        if (_totalPages > 1)
                          Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                IconButton(
                                  onPressed: _pageIndex > 1
                                      ? () {
                                          setState(() {
                                            _pageIndex--;
                                          });
                                          _fetchPayments();
                                        }
                                      : null,
                                  icon: const Icon(Icons.chevron_left),
                                ),
                                Text('$_pageIndex / $_totalPages', style: const TextStyle(fontWeight: FontWeight.bold)),
                                IconButton(
                                  onPressed: _pageIndex < _totalPages
                                      ? () {
                                          setState(() {
                                            _pageIndex++;
                                          });
                                          _fetchPayments();
                                        }
                                      : null,
                                  icon: const Icon(Icons.chevron_right),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
    );
  }
}
