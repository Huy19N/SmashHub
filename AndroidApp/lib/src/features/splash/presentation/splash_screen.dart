import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../shared/theme/app_theme.dart';
import '../../onboarding/presentation/onboarding_screen.dart';
import '../../auth/presentation/login_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  // Animation values
  late final Animation<double> _opacityAnimation;
  late final Animation<double> _shimmerAnimation;
  late final Animation<double> _glowAnimation;
  late final Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();

    // Total duration is 4.5 seconds (4500 milliseconds)
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 4500),
    );

    // Phase 1 (Fade In): 0.0 to 1.0s -> 0% to 22.2%
    // Phase 2 (Slower Shimmer Sweep): 1.0s to 2.7s -> 22.2% to 60.0% (1.7s duration)
    // Phase 3 (Full Glow/Flash): 2.7s to 3.7s -> 60.0% to 82.2% (1.0s duration)
    // Phase 4 (Fade Out): 3.7s to 4.5s -> 82.2% to 100% (0.8s duration)

    // 1. Opacity Animation
    _opacityAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(
          begin: 0.0,
          end: 1.0,
        ).chain(CurveTween(curve: Curves.easeIn)),
        weight: 22.2,
      ),
      TweenSequenceItem(
        tween: ConstantTween<double>(1.0),
        weight: 60.0, // Holds opacity through shimmer (37.8) and glow (22.2)
      ),
      TweenSequenceItem(
        tween: Tween<double>(
          begin: 1.0,
          end: 0.0,
        ).chain(CurveTween(curve: Curves.easeOut)),
        weight: 17.8,
      ),
    ]).animate(_controller);

    // 2. Shimmer Animation (Alignment shift from left to right, adjusted for slower motion)
    _shimmerAnimation = Tween<double>(begin: -3.5, end: 3.5).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.222, 0.600, curve: Curves.easeInOut),
      ),
    );

    // 3. Glow Animation (Flashes the whole text green and adds white-hot overlay glow for 1 second)
    _glowAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: ConstantTween<double>(0.0), weight: 60.0),
      TweenSequenceItem(
        tween: Tween<double>(
          begin: 0.0,
          end: 1.0,
        ).chain(CurveTween(curve: Curves.easeOut)),
        weight: 8.0, // Fast flash build-up (approx 360ms)
      ),
      TweenSequenceItem(
        tween: ConstantTween<double>(1.0),
        weight: 14.2, // Hold the full flash intensity (approx 640ms)
      ),
      TweenSequenceItem(
        tween: Tween<double>(
          begin: 1.0,
          end: 0.0,
        ).chain(CurveTween(curve: Curves.easeIn)),
        weight: 17.8, // Fades during Phase 4
      ),
    ]).animate(_controller);

    // 4. Scale Animation (Slight expansion pulse during the 1s flash)
    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: ConstantTween<double>(1.0), weight: 60.0),
      TweenSequenceItem(
        tween: Tween<double>(
          begin: 1.0,
          end: 1.12,
        ).chain(CurveTween(curve: Curves.easeOutBack)),
        weight: 8.0,
      ),
      TweenSequenceItem(
        tween: Tween<double>(
          begin: 1.12,
          end: 1.05,
        ).chain(CurveTween(curve: Curves.easeOut)),
        weight: 14.2,
      ),
      TweenSequenceItem(
        tween: Tween<double>(
          begin: 1.05,
          end: 1.0,
        ).chain(CurveTween(curve: Curves.easeIn)),
        weight: 17.8,
      ),
    ]).animate(_controller);

    // Navigation trigger on complete
    _controller.addStatusListener((status) async {
      if (status == AnimationStatus.completed) {
        final prefs = await SharedPreferences.getInstance();
        final hasAgreed = prefs.getBool('agreedToTerms') ?? false;

        if (mounted) {
          Navigator.of(context).pushReplacement(
            PageRouteBuilder(
              pageBuilder: (context, animation, secondaryAnimation) =>
                  hasAgreed ? const LoginScreen() : const OnboardingScreen(),
              transitionsBuilder:
                  (context, animation, secondaryAnimation, child) {
                    return FadeTransition(opacity: animation, child: child);
                  },
              transitionDuration: const Duration(milliseconds: 800),
            ),
          );
        }
      }
    });

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Opacity(
              opacity: _opacityAnimation.value,
              child: Transform.scale(
                scale: _scaleAnimation.value,
                child: ShaderMask(
                  blendMode: BlendMode.srcIn,
                  shaderCallback: (bounds) {
                    // When glow starts (Phase 3), blend the edge colors from dark zinc to vibrant green
                    final baseColor = Color.lerp(
                      const Color(0xFF18181B),
                      AppTheme.primaryColor,
                      _glowAnimation.value,
                    )!;
                    return LinearGradient(
                      begin: Alignment(_shimmerAnimation.value, -0.2),
                      end: Alignment(_shimmerAnimation.value + 1.5, 0.2),
                      colors: [
                        baseColor,
                        baseColor,
                        AppTheme.primaryColor, // Vibrant sports green core
                        baseColor,
                        baseColor,
                      ],
                      stops: const [0.0, 0.35, 0.5, 0.65, 1.0],
                    ).createShader(bounds);
                  },
                  child: Text(
                    'SmashHub',
                    style: TextStyle(
                      fontSize: 56,
                      fontWeight: FontWeight.w900,
                      fontStyle: FontStyle.italic,
                      letterSpacing: 4.0,
                      shadows: [
                        Shadow(
                          color: AppTheme.primaryColor.withValues(
                            alpha: _glowAnimation.value * 0.8,
                          ),
                          blurRadius: _glowAnimation.value * 30.0,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
