import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '3. Interface Adapters/repositories/auth_repository.dart';
import '3. Interface Adapters/state_providers/auth_provider.dart';
import '4. Frameworks And Drivers/config/api_config.dart';
import '4. Frameworks And Drivers/config/app_theme.dart';
import '4. Frameworks And Drivers/di/app_providers.dart';
import '4. Frameworks And Drivers/network/api_client.dart';
import '4. Frameworks And Drivers/router/app_router.dart';

final GlobalKey<NavigatorState> appNavigatorKey = GlobalKey<NavigatorState>();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ApiConfig.initialize();

  final authRepo = AuthRepository();
  // Warm up and set token into ApiClient immediately before app mounts
  await authRepo.getSavedToken();

  ApiClient.onUnauthorized = () async {
    await authRepo.clearSession();
    final context = appNavigatorKey.currentContext;
    if (context != null && context.mounted) {
      context.read<AuthProvider>().handleUnauthorized();
    }
    appNavigatorKey.currentState?.pushNamedAndRemoveUntil('/login', (route) => false);
  };

  runApp(const NorthWindApp());
}

class NorthWindApp extends StatelessWidget {
  const NorthWindApp({super.key});

  @override
  Widget build(BuildContext context) {
    return AppProviders(
      child: MaterialApp(
        navigatorKey: appNavigatorKey,
        title: 'NorthWind Enterprise Sales',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        initialRoute: '/',
        onGenerateRoute: AppRouter.onGenerateRoute,
      ),
    );
  }
}
