// ignore_for_file: use_build_context_synchronously
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/network/api_client.dart';
import '../../data/data_sources/booking_remote_data_source.dart';
import '../../data/repositories/booking_repository_impl.dart';
import '../../domain/repositories/booking_repository.dart';
import 'booking_screen.dart';

class CheckoutScreen extends StatefulWidget {
  final String paymentUrl;
  final String bookingId;
  final bool isMultipleBookings;

  const CheckoutScreen({
    super.key,
    required this.paymentUrl,
    required this.bookingId,
    this.isMultipleBookings = false,
  });

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  late final WebViewController _webViewController;
  late final BookingRepository _bookingRepository;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    
    final apiClient = ApiClient();
    final dataSource = BookingRemoteDataSource(apiClient);
    _bookingRepository = BookingRepositoryImpl(dataSource);

    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            // Có thể hiển thị thanh tiến trình nếu cần
          },
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
            });
            _checkRedirect(url);
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
            _checkRedirect(url);
          },
          onWebResourceError: (WebResourceError error) {
            debugPrint('WebView Error: ${error.description}');
          },
          onNavigationRequest: (NavigationRequest request) {
            final url = request.url;
            if (_isSuccessUrl(url)) {
              _handlePaymentSuccess();
              return NavigationDecision.prevent;
            }
            if (_isCancelUrl(url)) {
              _handlePaymentCancelled();
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.paymentUrl));
  }

  bool _isSuccessUrl(String url) {
    return url.contains('payment/success') || 
           (url.contains('payment') && url.contains('success')) || 
           url.contains('status=PAID');
  }

  bool _isCancelUrl(String url) {
    return url.contains('payment/cancel') || 
           url.contains('cancel') || 
           url.contains('status=CANCELLED');
  }

  void _checkRedirect(String url) {
    if (_isSuccessUrl(url)) {
      _handlePaymentSuccess();
    } else if (_isCancelUrl(url)) {
      _handlePaymentCancelled();
    }
  }

  void _handlePaymentSuccess() {
    
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.check_circle_rounded, color: Colors.green, size: 28),
            SizedBox(width: 8),
            Text('Thanh toán thành công!'),
          ],
        ),
        content: const Text('Lịch đặt sân của bạn đã hoàn tất và được thanh toán thành công.'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(); // Đóng dialog
              if (widget.isMultipleBookings) {
                Navigator.of(context).pop(true); // Trả về kết quả true
              } else {
                // Chuyển hướng sang trang danh sách đặt sân
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(builder: (_) => const BookingScreen()),
                );
              }
            },
            child: Text(
              widget.isMultipleBookings ? 'Đồng ý' : 'Xem lịch đặt sân',
              style: const TextStyle(color: AppTheme.primaryColor),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _handlePaymentCancelled() async {

    setState(() {
      _isLoading = true;
    });

    try {
      await _bookingRepository.cancelBooking(widget.bookingId);
    } catch (e) {
      debugPrint('Error cancelling booking: $e');
    }


    setState(() {
      _isLoading = false;
    });

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.cancel_rounded, color: Colors.red, size: 28),
            SizedBox(width: 8),
            Text('Đã hủy thanh toán'),
          ],
        ),
        content: const Text('Giao dịch thanh toán đặt sân đã bị hủy. Bạn có thể tiến hành đặt lại.'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(dialogContext); // Đóng dialog
              Navigator.pop(context, false); // Trở về màn hình chọn giờ và trả về false
            },
            child: const Text('Đồng ý', style: TextStyle(color: AppTheme.primaryColor)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'THANH TOÁN ĐẶT SÂN',
          style: TextStyle(fontWeight: FontWeight.w900),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () {
            // Hiển thị hộp thoại xác nhận thoát khi đang thanh toán
            showDialog(
              context: context,
              builder: (dialogContext) => AlertDialog(
                title: const Text('Hủy thanh toán?'),
                content: const Text('Bạn có chắc chắn muốn rời khỏi trang thanh toán này?'),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(dialogContext),
                    child: const Text('Không'),
                  ),
                  TextButton(
                    onPressed: () async {
                      Navigator.pop(dialogContext); // Đóng dialog
                      
                      setState(() {
                        _isLoading = true;
                      });

                      try {
                        await _bookingRepository.cancelBooking(widget.bookingId);
                      } catch (e) {
                        debugPrint('Error cancelling booking: $e');
                      }

                      if (mounted) {
                        setState(() {
                          _isLoading = false;
                        });
                        Navigator.pop(context, false); // Thoát CheckoutScreen và trả về false
                      }
                    },
                    child: const Text('Thoát', style: TextStyle(color: Colors.red)),
                  ),
                ],
              ),
            );
          },
        ),
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _webViewController),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
              ),
            ),
        ],
      ),
    );
  }
}
