import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry margin;
  final Color? backgroundColor;
  final double borderRadius;
  final BorderSide? borderSide;

  const AppCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(20.0),
    this.margin = EdgeInsets.zero,
    this.backgroundColor,
    this.borderRadius = 20.0,
    this.borderSide,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final Color effectiveBg = backgroundColor ??
        (isDark ? AppTheme.darkSurfaceColor : AppTheme.lightSurfaceColor);

    final BorderSide effectiveBorder = borderSide ??
        BorderSide(
          color: isDark ? Colors.white.withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.08),
          width: 1.0,
        );

    return Container(
      margin: margin,
      padding: padding,
      decoration: BoxDecoration(
        color: effectiveBg,
        borderRadius: BorderRadius.circular(borderRadius),
        border: Border.fromBorderSide(effectiveBorder),
      ),
      child: child,
    );
  }
}
