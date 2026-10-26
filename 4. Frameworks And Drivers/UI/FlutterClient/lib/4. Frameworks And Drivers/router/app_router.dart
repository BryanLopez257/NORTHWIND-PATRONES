import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../3. Interface Adapters/state_providers/auth_provider.dart';
import '../ui/layouts/main_layout.dart';
import '../ui/pages/auth/login_page.dart';
import '../ui/pages/auth/register_page.dart';
import '../ui/pages/customers/customers_page.dart';
import '../ui/pages/invoices/invoices_page.dart';
import '../ui/pages/orders/create_order_page.dart';
import '../ui/pages/products/products_page.dart';
import '../ui/pages/settings/settings_page.dart';
import 'protected_route.dart';

class AppRouter {
  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case '/login':
      case '/user/login':
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => const LoginPage(),
        );

      case '/register':
      case '/user/register':
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => const RegisterPage(),
        );

      case '/user/logout':
        return MaterialPageRoute(
          settings: settings,
          builder: (context) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              context.read<AuthProvider>().logout().then((_) {
                if (context.mounted) {
                  Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
                }
              });
            });
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          },
        );

      case '/':
      case '/create-order':
      case '/createorder':
        return MaterialPageRoute(
          settings: const RouteSettings(name: '/create-order'),
          builder: (_) => const ProtectedRoute(
            child: MainLayout(
              currentRoute: '/create-order',
              child: CreateOrderPage(),
            ),
          ),
        );

      case '/invoices':
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => const ProtectedRoute(
            child: MainLayout(
              currentRoute: '/invoices',
              child: InvoicesPage(),
            ),
          ),
        );

      case '/customers':
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => const ProtectedRoute(
            child: MainLayout(
              currentRoute: '/customers',
              child: CustomersPage(),
            ),
          ),
        );

      case '/products':
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => const ProtectedRoute(
            child: MainLayout(
              currentRoute: '/products',
              child: ProductsPage(),
            ),
          ),
        );

      case '/settings':
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => const ProtectedRoute(
            child: MainLayout(
              currentRoute: '/settings',
              child: SettingsPage(),
            ),
          ),
        );

      default:
        // Fallback route: create-order
        return MaterialPageRoute(
          settings: const RouteSettings(name: '/create-order'),
          builder: (_) => const ProtectedRoute(
            child: MainLayout(
              currentRoute: '/create-order',
              child: CreateOrderPage(),
            ),
          ),
        );
    }
  }
}
