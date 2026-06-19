import 'package:flutter/material.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/auth/presentation/profile_screen.dart';
import '../../features/booking/presentation/screens/booking_screen.dart';
import '../../features/community/presentation/screens/messages_screen.dart';
import '../theme/app_theme.dart';

/// Lớp điều khiển giao diện chính chứa thanh điều hướng phía dưới (Bottom Navigation Bar)
/// Thiết kế giao diện tối tối giản, thể thao chuyên nghiệp với màu xanh lá neon làm điểm nhấn.
class MainWrapper extends StatefulWidget {
  const MainWrapper({super.key});

  @override
  State<MainWrapper> createState() => _MainWrapperState();
}

class _MainWrapperState extends State<MainWrapper> {
  int _currentIndex = 0;

  // Danh sách các màn hình tương ứng với từng Tab
  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      const HomeScreen(),
      const BookingScreen(),
      const MessagesScreen(),
      const ProfileScreen(
        isEmbedded: true,
      ), // Nhúng ProfileScreen và ẩn nút quay lại
    ];
  }

  void _onTabTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _screens),
      bottomNavigationBar: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            height: 76,
            decoration: BoxDecoration(
              color: isDark ? AppTheme.darkSurfaceColor : Colors.white,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(32),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.06),
                  blurRadius: 20,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildNavItem(
                      0,
                      Icons.home_outlined,
                      Icons.home_rounded,
                      'Trang chủ',
                    ),
                    _buildNavItem(
                      1,
                      Icons.explore_outlined,
                      Icons.explore,
                      'Đặt sân',
                    ),
                    const SizedBox(
                      width: 64,
                    ), // Spacer cho nút tròn nổi bật ở giữa
                    _buildNavItem(
                      2,
                      Icons.groups_outlined,
                      Icons.groups,
                      'Nhóm',
                    ),
                    _buildNavItem(
                      3,
                      Icons.person_outline_rounded,
                      Icons.person_rounded,
                      'Profile',
                    ),
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            top: -24, // Nút nổi bật nhô lên 24dp so với thanh điều hướng
            left: 0,
            right: 0,
            child: Center(child: _buildCenterNavItem(context)),
          ),
        ],
      ),
    );
  }

  /// Hàm xây dựng các nút điều hướng thông thường
  /// Chỉ hiển thị tên nhãn khi tab đó đang được chọn, các tab còn lại ẩn nhãn và căn giữa icon
  Widget _buildNavItem(
    int index,
    IconData inactiveIcon,
    IconData activeIcon,
    String label,
  ) {
    final isSelected = _currentIndex == index;
    final activeColor = AppTheme.primaryColor;
    final inactiveColor = Colors.grey;

    return Expanded(
      child: InkWell(
        onTap: () => _onTabTapped(index),
        borderRadius: BorderRadius.circular(16),
        child: Container(
          height: 56,
          alignment: Alignment.center,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                isSelected ? activeIcon : inactiveIcon,
                color: isSelected ? activeColor : inactiveColor,
                size: 24,
              ),
              if (isSelected) ...[
                const SizedBox(height: 4),
                Text(
                  label,
                  style: TextStyle(
                    color: activeColor,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  /// Hàm xây dựng nút Tạo nhóm (+) nổi bật ở trung tâm (Hình tròn xanh lá cây, không có nhãn)
  Widget _buildCenterNavItem(BuildContext context) {
    final primaryColor = AppTheme.primaryColor;
    return Container(
      width: 64,
      height: 64,
      decoration: BoxDecoration(
        color: primaryColor,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: primaryColor.withValues(alpha: 0.35),
            blurRadius: 14,
            spreadRadius: 2,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _showCreateDialog(context),
          customBorder: const CircleBorder(),
          child: const Icon(
            Icons.add_circle_outline_rounded,
            color: Colors.white,
            size: 38,
          ),
        ),
      ),
    );
  }

  void _showCreateDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 24),
                decoration: BoxDecoration(
                  color: Colors.grey[400],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const Text(
                'Tạo Mới',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 24),
              _buildDialogOption(
                context,
                icon: Icons.group_add_rounded,
                title: 'Tạo Nhóm / CLB',
                subtitle: 'Xây dựng câu lạc bộ và mời thành viên',
                onTap: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Tính năng tạo nhóm đang phát triển!')),
                  );
                },
              ),
              const SizedBox(height: 16),
              _buildDialogOption(
                context,
                icon: Icons.calendar_month_rounded,
                title: 'Tạo Lịch Giao Lưu',
                subtitle: 'Tìm đối thủ hoặc đồng đội nhanh chóng',
                onTap: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Tính năng giao lưu đang phát triển!')),
                  );
                },
              ),
              const SizedBox(height: 16),
              _buildDialogOption(
                context,
                icon: Icons.post_add_rounded,
                title: 'Tạo Bài Viết',
                subtitle: 'Chia sẻ hoạt động lên cộng đồng',
                onTap: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Tính năng bài viết đang phát triển!')),
                  );
                },
              ),
              const SizedBox(height: 32),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDialogOption(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final Color bgColor = isDark ? Colors.grey[800]! : Colors.grey[100]!;

    return Container(
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, color: AppTheme.primaryColor),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: TextStyle(
                          fontSize: 13,
                          color: isDark ? Colors.grey[400] : Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.chevron_right_rounded,
                  color: isDark ? Colors.grey[400] : Colors.grey[600],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}


