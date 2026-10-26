import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../3. Interface Adapters/state_providers/auth_provider.dart';
import '../ui/pages/auth/login_page.dart';

class ProtectedRoute extends StatelessWidget {
  final Widget child;

  const ProtectedRoute({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    if (auth.isInitializing) {
      return const Scaffold(
        backgroundColor: Color(0xFFF8FAFC),
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (!auth.isAuthenticated) {
      return const LoginPage();
    }

    return child;
  }
}
