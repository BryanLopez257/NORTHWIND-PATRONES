import 'package:flutter/material.dart';

class PasswordStrengthIndicator extends StatelessWidget {
  final String password;

  const PasswordStrengthIndicator({
    super.key,
    required this.password,
  });

  bool get _hasMinLength => password.length >= 6;
  bool get _hasUppercase => RegExp(r'[A-Z]').hasMatch(password);
  bool get _hasDigit => RegExp(r'[0-9]').hasMatch(password);
  bool get _hasSpecialChar => RegExp(r'[^a-zA-Z0-9\s]').hasMatch(password);
  bool get _hasNoWhitespace => !password.contains(' ');
  bool get _hasNoEmojis => !RegExp(
        r'[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]',
        unicode: true,
      ).hasMatch(password);

  int get _score {
    int s = 0;
    if (_hasMinLength) s++;
    if (_hasUppercase) s++;
    if (_hasDigit) s++;
    if (_hasSpecialChar) s++;
    if (_hasNoWhitespace) s++;
    if (_hasNoEmojis) s++;
    return s;
  }

  @override
  Widget build(BuildContext context) {
    if (password.isEmpty) return const SizedBox.shrink();

    final score = _score;
    Color barColor;
    String label;

    if (score <= 2) {
      barColor = const Color(0xFFEF4444); // red-500
      label = 'Muy débil';
    } else if (score <= 4) {
      barColor = const Color(0xFFF59E0B); // amber-500
      label = 'Moderada';
    } else {
      barColor = const Color(0xFF10B981); // emerald-500
      label = 'Fuerte';
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 6),
        Row(
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: score / 6.0,
                  backgroundColor: const Color(0xFFE2E8F0),
                  color: barColor,
                  minHeight: 5,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: barColor,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 4,
          children: [
            _buildCheckItem('6+ caracteres', _hasMinLength),
            _buildCheckItem('1 Mayúscula', _hasUppercase),
            _buildCheckItem('1 Número', _hasDigit),
            _buildCheckItem('1 Especial (!@#\$)', _hasSpecialChar),
            _buildCheckItem('Sin espacios', _hasNoWhitespace),
            _buildCheckItem('Sin emojis', _hasNoEmojis),
          ],
        ),
      ],
    );
  }

  Widget _buildCheckItem(String text, bool met) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          met ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
          size: 13,
          color: met ? const Color(0xFF10B981) : const Color(0xFF94A3B8),
        ),
        const SizedBox(width: 3),
        Text(
          text,
          style: TextStyle(
            fontSize: 10,
            color: met ? const Color(0xFF047857) : const Color(0xFF64748B),
            fontWeight: met ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}
