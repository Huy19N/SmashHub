import 'package:flutter/material.dart';
import '../../../shared/theme/app_theme.dart';
import '../../auth/presentation/login_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingPageData> _pages = [
    OnboardingPageData(
      title: 'SmashHub - Đa Bản Sắc Thể Thao',
      description: 'Nền tảng thể thao toàn diện, hỗ trợ hầu hết các bộ môn bạn yêu thích.',
      imagePath: 'assets/onboarding/onboarding_1.png',
      icon: Icons.sports_volleyball_rounded,
      gradientColors: [Color(0xFF00E676), Color(0xFF00B248)],
    ),
    OnboardingPageData(
      title: 'Kết Nối Cộng Đồng',
      description: 'Dễ dàng tham gia hoặc tự tạo các nhóm câu lạc bộ, trò chuyện và tụ họp giao lưu cùng những người có cùng đam mê.',
      imagePath: 'assets/onboarding/onboarding_2.png',
      icon: Icons.people_alt_rounded,
      gradientColors: [Color(0xFF00E676), Color(0xFF00E5FF)],
    ),
    OnboardingPageData(
      title: 'Đặt Sân Siêu Tốc',
      description: 'Tìm kiếm sân trống gần bạn, kiểm tra lịch trình và đặt sân trực tuyến nhanh chóng chỉ với vài thao tác.',
      imagePath: 'assets/onboarding/onboarding_3.png',
      icon: Icons.flash_on_rounded,
      gradientColors: [Color(0xFF00E676), Color(0xFFFFD600)],
    ),
    OnboardingPageData(
      title: 'Bắt Kèo Thách Đấu',
      description: 'Hệ thống bắt kèo, giao lưu cọ xát giữa các nhóm với tính cạnh tranh cao, nâng tầm trải nghiệm thể thao.',
      imagePath: 'assets/onboarding/onboarding_4.png',
      icon: Icons.emoji_events_rounded,
      gradientColors: [Color(0xFF00E676), Color(0xFFFF3D00)],
    ),
  ];

  void _navigateToLogin() {
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) => const LoginScreen(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(opacity: animation, child: child);
        },
        transitionDuration: const Duration(milliseconds: 600),
      ),
    );
  }

  void _onNextPage() {
    if (_currentPage < _pages.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOutCubic,
      );
    } else {
      _navigateToLogin();
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isLastPage = _currentPage == _pages.length - 1;
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Background PageView for full-bleed images
          PageView.builder(
            controller: _pageController,
            onPageChanged: (index) {
              setState(() {
                _currentPage = index;
              });
            },
            itemCount: _pages.length,
            itemBuilder: (context, index) {
              final page = _pages[index];
              return Stack(
                children: [
                  // Full-bleed top image (occupies top 60% of the screen height)
                  Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    height: MediaQuery.of(context).size.height * 0.6,
                    child: Image.asset(
                      page.imagePath,
                      fit: BoxFit.cover,
                    ),
                  ),

                  // Bottom Overlay Card container
                  Align(
                    alignment: Alignment.bottomCenter,
                    child: Container(
                      height: MediaQuery.of(context).size.height * 0.45,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: isDark ? AppTheme.darkSurfaceColor : Colors.white,
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(36)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.08),
                            blurRadius: 24,
                            spreadRadius: 2,
                            offset: const Offset(0, -6),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.only(
                        left: 28,
                        right: 28,
                        top: 36,
                        bottom: 32,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Scrolling Title and Description
                          Expanded(
                            child: SingleChildScrollView(
                              physics: const BouncingScrollPhysics(),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    page.title,
                                    style: TextStyle(
                                      fontSize: 26,
                                      fontWeight: FontWeight.w900,
                                      color: isDark ? Colors.white : Colors.black,
                                      height: 1.25,
                                      letterSpacing: -0.5,
                                    ),
                                  ),
                                  const SizedBox(height: 14),
                                  Text(
                                    page.description,
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: isDark ? Colors.white70 : Colors.black54,
                                      height: 1.5,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 20),

                          // Bottom Navigation Row: dots and next button
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              // Page Indicators
                              Row(
                                children: List.generate(_pages.length, (idx) {
                                  final isActive = _currentPage == idx;
                                  return AnimatedContainer(
                                    duration: const Duration(milliseconds: 300),
                                    margin: const EdgeInsets.only(right: 6),
                                    height: 6,
                                    width: isActive ? 20 : 6,
                                    decoration: BoxDecoration(
                                      color: isActive
                                          ? (isDark ? Colors.white : Colors.black)
                                          : (isDark ? Colors.white24 : Colors.black12),
                                      borderRadius: BorderRadius.circular(3),
                                    ),
                                  );
                                }),
                              ),

                              // Pill Button (No Gradient)
                              GestureDetector(
                                onTap: _onNextPage,
                                child: Container(
                                  height: 48, // Touch target height
                                  padding: const EdgeInsets.symmetric(horizontal: 24),
                                  decoration: BoxDecoration(
                                    color: AppTheme.primaryColor,
                                    borderRadius: BorderRadius.circular(24),
                                    boxShadow: [
                                      BoxShadow(
                                        color: AppTheme.primaryColor.withValues(alpha: 0.3),
                                        blurRadius: 12,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  alignment: Alignment.center,
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text(
                                        isLastPage ? 'Bắt đầu ngay' : 'Tiếp theo',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 15,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      const Icon(
                                        Icons.chevron_right_rounded,
                                        color: Colors.white,
                                        size: 18,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            },
          ),

          // Floating Skip button top-right (outside PageView)
          Positioned(
            top: 0,
            right: 0,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                child: AnimatedOpacity(
                  opacity: isLastPage ? 0.0 : 1.0,
                  duration: const Duration(milliseconds: 200),
                  child: IgnorePointer(
                    ignoring: isLastPage,
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.35),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.25),
                          width: 1,
                        ),
                      ),
                      child: TextButton(
                        onPressed: _navigateToLogin,
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          minimumSize: const Size(80, 40), // touch target bounds
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                        ),
                        child: const Text(
                          'Bỏ qua',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class OnboardingPageData {
  final String title;
  final String description;
  final String imagePath;
  final IconData icon;
  final List<Color> gradientColors;

  OnboardingPageData({
    required this.title,
    required this.description,
    required this.imagePath,
    required this.icon,
    required this.gradientColors,
  });
}
