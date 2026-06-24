import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../../../shared/theme/app_theme.dart';
import 'booking_screen.dart';

class CheckoutScreen extends StatefulWidget {
  final String paymentUrl;
  final String bookingId;

  const CheckoutScreen({
    super.key,
    required this.paymentUrl,
    required this.bookingId,
  });

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  late final WebViewController _webViewController;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
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
    if (!mounted) return;
    
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
              // Chuyển hướng sang trang danh sách đặt sân
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (_) => const BookingScreen()),
              );
            },
            child: const Text('Xem lịch đặt sân', style: TextStyle(color: AppTheme.primaryColor)),
          ),
        ],
      ),
    );
  }

  void _handlePaymentCancelled() {
    if (!mounted) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
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
              Navigator.of(context).pop(); // Đóng dialog
              Navigator.of(context).pop(); // Trở về màn hình chọn giờ
            },
            child: const Text('Đồng ý', style: TextStyle(color: Colors.white)),
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
              builder: (context) => AlertDialog(
                title: const Text('Hủy thanh toán?'),
                content: const Text('Bạn có chắc chắn muốn rời khỏi trang thanh toán này?'),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Không'),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.pop(context); // Đóng dialog
                      Navigator.pop(context); // Thoát CheckoutScreen
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
