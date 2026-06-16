import 'dart:async';
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// A dynamic custom painter that programmatically draws a highly abstract, premium
/// sports logo fusing the letters 'S' and 'H' inside an outer dynamic broken circle.
class BrandLogoPainter extends CustomPainter {
  final Color color;

  BrandLogoPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final double w = size.width;
    final double h = size.height;
    final double centerX = w / 2;
    final double centerY = h / 2;
    final double radius = w * 0.45;

    // Glowing shadow paint (MaskFilter.blur creates a soft outer glow effect)
    final shadowPaint = Paint()
      ..color = color.withValues(alpha: 0.35)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 9.0
      ..strokeCap = StrokeCap.round
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 5.0);

    // Solid sharp green paint
    final solidPaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4.5
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final rect = Rect.fromCircle(center: Offset(centerX, centerY), radius: radius);

    // Draw Dynamic Broken Circle (Outer Arcs) - cyber-sports style
    // We create three segmented arcs with gaps to present a futuristic broken ring
    canvas.drawArc(rect, -0.2, 2.2, false, shadowPaint);
    canvas.drawArc(rect, -0.2, 2.2, false, solidPaint);

    canvas.drawArc(rect, 2.4, 1.8, false, shadowPaint);
    canvas.drawArc(rect, 2.4, 1.8, false, solidPaint);

    canvas.drawArc(rect, 4.6, 1.2, false, shadowPaint);
    canvas.drawArc(rect, 4.6, 1.2, false, solidPaint);

    // Draw Fused S+H Abstract Ribbon
    // This is drawn as a single continuous fluid geometric ribbon where the
    // loops form an 'S' and the intersections with the side vertical segments form an 'H'.
    final path = Path();

    // 1. Start at top-left of the left H leg
    path.moveTo(centerX - w * 0.18, centerY - h * 0.22);
    // 2. Line to bottom-left of the left H leg
    path.lineTo(centerX - w * 0.18, centerY + h * 0.22);
    // 3. Curve up-right to start forming the top S loop
    path.cubicTo(
      centerX - w * 0.18,
      centerY + h * 0.08,
      centerX - w * 0.1,
      centerY - h * 0.2,
      centerX,
      centerY - h * 0.2,
    );
    // 4. Continue top loop and transition to the center diagonal crossbar
    path.cubicTo(
      centerX + w * 0.1,
      centerY - h * 0.2,
      centerX + w * 0.18,
      centerY - h * 0.14,
      centerX + w * 0.18,
      centerY - h * 0.08,
    );
    // 5. Diagonal sweep down-left across the center (H's crossbar and S's spine)
    path.cubicTo(
      centerX + w * 0.18,
      centerY - h * 0.02,
      centerX - w * 0.18,
      centerY + h * 0.02,
      centerX - w * 0.18,
      centerY + h * 0.08,
    );
    // 6. Curve down-right to form the bottom S loop
    path.cubicTo(
      centerX - w * 0.18,
      centerY + h * 0.14,
      centerX - w * 0.1,
      centerY + h * 0.2,
      centerX,
      centerY + h * 0.2,
    );
    // 7. Finish bottom loop and connect with the right H leg
    path.cubicTo(
      centerX + w * 0.1,
      centerY + h * 0.2,
      centerX + w * 0.18,
      centerY + h * 0.08,
      centerX + w * 0.18,
      centerY + h * 0.22,
    );
    // 8. Line up to top-right of the right H leg
    path.lineTo(centerX + w * 0.18, centerY - h * 0.22);

    // Draw the glow path first, then overlay the solid path
    canvas.drawPath(path, shadowPaint);
    canvas.drawPath(path, solidPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// A stateful widget wrapping the custom logo inside a two-phase sequential animation:
/// Phase 1: Entry Scale (elastic pop) + Fade in (600ms)
/// Phase 2: Loop Rotation (360-deg linear loop, 1.2s duration) triggered upon Entry completion.
class SpinningLogo extends StatefulWidget {
  final double size;

  const SpinningLogo({super.key, this.size = 80.0});

  @override
  State<SpinningLogo> createState() => _SpinningLogoState();
}

class _SpinningLogoState extends State<SpinningLogo> with TickerProviderStateMixin {
  late AnimationController _entryController;
  late AnimationController _rotationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();

    // Phase 1 (Entry): Lasts exactly 600ms
    _entryController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );

    _scaleAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _entryController,
        curve: Curves.easeOutBack, // Elastic pop effect
      ),
    );

    _opacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _entryController,
        curve: Curves.easeIn,
      ),
    );

    // Phase 2 (Loop Rotation): Lasts 1.2s per 360-degree loop
    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    // Trigger Phase 2 once Phase 1 (Entry) completes
    _entryController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _rotationController.repeat();
      }
    });

    // Start Phase 1 immediately
    _entryController.forward();
  }

  @override
  void dispose() {
    _entryController.dispose();
    _rotationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _opacityAnimation,
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: RotationTransition(
          turns: _rotationController,
          child: SizedBox(
            width: widget.size,
            height: widget.size,
            child: CustomPaint(
              painter: BrandLogoPainter(color: AppTheme.primaryColor),
            ),
          ),
        ),
      ),
    );
  }
}

/// A modal backdrop loading overlay displaying spinning logo and optional text.
class _GlobalLoadingOverlay extends StatelessWidget {
  final String? message;

  const _GlobalLoadingOverlay({this.message});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: Stack(
        children: [
          // Dark, semi-transparent backdrop to block touch gestures
          GestureDetector(
            onTap: () {}, // Block taps (anti-double-tap)
            behavior: HitTestBehavior.opaque,
            child: Container(
              color: Colors.black.withValues(alpha: 0.6),
            ),
          ),
          // Spinning custom brand logo and optional message
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                const SpinningLogo(size: 84),
                if (message != null) ...[
                  const SizedBox(height: 24),
                  Text(
                    message!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// A static manager class to easily control showing and dismissing the loading state.
class GlobalLoading {
  GlobalLoading._();

  static OverlayEntry? _overlayEntry;
  static Timer? _timeoutTimer;

  /// Shows the modal global loading overlay.
  static void show(BuildContext context, {String? message, VoidCallback? onTimeout}) {
    if (_overlayEntry != null) return; // Already showing

    final overlayState = Overlay.of(context);

    _overlayEntry = OverlayEntry(
      builder: (context) => _GlobalLoadingOverlay(
        message: message,
      ),
    );

    overlayState.insert(_overlayEntry!);

    // Start a 15-second safety timeout
    _timeoutTimer = Timer(const Duration(seconds: 15), () {
      if (_overlayEntry != null) {
        dismiss();

        if (onTimeout != null) {
          onTimeout();
        } else {
          // Show default snackbar warning on screen
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Kết nối mạng quá hạn. Vui lòng thử lại.'),
              backgroundColor: Colors.redAccent,
              duration: Duration(seconds: 3),
            ),
          );
        }
      }
    });
  }

  /// Automatically dismisses the loading state, cancelling timers.
  static void dismiss() {
    _timeoutTimer?.cancel();
    _timeoutTimer = null;

    _overlayEntry?.remove();
    _overlayEntry = null;
  }
}
