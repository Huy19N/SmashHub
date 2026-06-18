import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

enum AppButtonType { primary, secondary, text }

class AppButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final String text;
  final Widget? icon;
  final AppButtonType type;
  final bool isLoading;
  final double? width;
  final double height;

  const AppButton({
    super.key,
    required this.onPressed,
    required this.text,
    this.icon,
    this.type = AppButtonType.primary,
    this.isLoading = false,
    this.width,
    this.height = 48.0, // Minimum mobile touch target height
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    Widget buttonContent = Row(
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (isLoading) ...[
          SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(
                type == AppButtonType.primary ? Colors.black : theme.colorScheme.primary,
              ),
            ),
          ),
          const SizedBox(width: 12),
        ] else if (icon != null) ...[
          icon!,
          const SizedBox(width: 8),
        ],
        Text(
          text,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 14,
            letterSpacing: 0.5,
            color: _getTextColor(theme, isDark),
          ),
        ),
      ],
    );

    ButtonStyle style;
    switch (type) {
      case AppButtonType.primary:
        style = ElevatedButton.styleFrom(
          backgroundColor: AppTheme.primaryColor,
          elevation: 0,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 20),
        );
        break;
      case AppButtonType.secondary:
        style = ElevatedButton.styleFrom(
          backgroundColor: isDark ? AppTheme.darkSurfaceColor : AppTheme.lightSurfaceColor,
          elevation: 0,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(
              color: isDark ? Colors.white10 : Colors.black12,
              width: 1,
            ),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 20),
        );
        break;
      case AppButtonType.text:
        return TextButton(
          onPressed: isLoading ? null : onPressed,
          style: TextButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            minimumSize: Size(48, height),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          child: buttonContent,
        );
    }

    return SizedBox(
      width: width,
      height: height,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: style,
        child: buttonContent,
      ),
    );
  }

  Color _getTextColor(ThemeData theme, bool isDark) {
    if (onPressed == null) return Colors.grey;
    switch (type) {
      case AppButtonType.primary:
        return Colors.white;
      case AppButtonType.secondary:
        return isDark ? Colors.white : Colors.black87;
      case AppButtonType.text:
        return AppTheme.primaryColor;
    }
  }
}
