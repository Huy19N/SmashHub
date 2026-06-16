import 'package:flutter/material.dart';

class AppDropdown<T> extends StatelessWidget {
  final T? value;
  final List<DropdownMenuItem<T>> items;
  final ValueChanged<T?>? onChanged;
  final String labelText;
  final String? hintText;
  final Widget? prefixIcon;

  const AppDropdown({
    super.key,
    required this.value,
    required this.items,
    required this.onChanged,
    required this.labelText,
    this.hintText,
    this.prefixIcon,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DropdownButtonFormField<T>(
      key: ValueKey(value),
      initialValue: value,
      items: items,
      onChanged: onChanged,
      decoration: InputDecoration(
        labelText: labelText,
        hintText: hintText,
        prefixIcon: prefixIcon,
        filled: true,
        fillColor: theme.brightness == Brightness.dark
            ? theme.colorScheme.surface
            : theme.colorScheme.surface,
      ),
      icon: Icon(
        Icons.keyboard_arrow_down_rounded,
        color: theme.brightness == Brightness.dark
            ? Colors.white70
            : Colors.black87,
      ),
      dropdownColor: theme.brightness == Brightness.dark
          ? theme.colorScheme.surface
          : theme.scaffoldBackgroundColor,
      style: TextStyle(
        color: theme.brightness == Brightness.dark
            ? Colors.white
            : Colors.black,
        fontSize: 14,
      ),
      isExpanded: true,
    );
  }
}
