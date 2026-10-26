import 'package:flutter/material.dart';

enum BadgeVariant {
  defaultVariant,
  info,
  success,
  warning,
  danger,
}

class BadgeWidget extends StatelessWidget {
  final String label;
  final BadgeVariant variant;
  final Widget? icon;
  final EdgeInsetsGeometry? padding;
  final TextStyle? textStyle;

  const BadgeWidget({
    super.key,
    required this.label,
    this.variant = BadgeVariant.defaultVariant,
    this.icon,
    this.padding,
    this.textStyle,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color border;
    Color text;

    switch (variant) {
      case BadgeVariant.info:
        bg = const Color(0xFFEFF6FF); // blue-50
        border = const Color(0xFFBFDBFE); // blue-200
        text = const Color(0xFF1D4ED8); // blue-700
        break;
      case BadgeVariant.success:
        bg = const Color(0xFFECFDF5); // emerald-50
        border = const Color(0xFFA7F3D0); // emerald-200
        text = const Color(0xFF047857); // emerald-700
        break;
      case BadgeVariant.warning:
        bg = const Color(0xFFFFFBEB); // amber-50
        border = const Color(0xFFFDE68A); // amber-200
        text = const Color(0xFFB45309); // amber-700
        break;
      case BadgeVariant.danger:
        bg = const Color(0xFFFFF1F2); // rose-50
        border = const Color(0xFFFECDD3); // rose-200
        text = const Color(0xFFBE123C); // rose-700
        break;
      case BadgeVariant.defaultVariant:
        bg = const Color(0xFFF1F5F9); // slate-100
        border = const Color(0xFFE2E8F0); // slate-200
        text = const Color(0xFF334155); // slate-700
        break;
    }

    return Container(
      padding: padding ?? const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        border: Border.all(color: border, width: 1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          if (icon != null) ...[
            icon!,
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: textStyle ??
                TextStyle(
                  color: text,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.2,
                ),
          ),
        ],
      ),
    );
  }
}
