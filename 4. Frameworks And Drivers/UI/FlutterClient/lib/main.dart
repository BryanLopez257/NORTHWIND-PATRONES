import 'package:flutter/material.dart';
import '4. Frameworks And Drivers/config/api_config.dart';
import '4. Frameworks And Drivers/config/app_theme.dart';
import '4. Frameworks And Drivers/di/app_providers.dart';
import '4. Frameworks And Drivers/network/api_client.dart';
import '4. Frameworks And Drivers/router/app_router.dart';

final GlobalKey<NavigatorState> appNavigatorKey = GlobalKey<NavigatorState>();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ApiConfig.initialize();

  ApiClient.onUnauthorized = () {
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
