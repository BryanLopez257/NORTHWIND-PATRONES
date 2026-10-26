import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../3. Interface Adapters/state_providers/auth_provider.dart';
import '../../../3. Interface Adapters/state_providers/customers_provider.dart';
import '../../../3. Interface Adapters/state_providers/invoices_provider.dart';
import '../../../3. Interface Adapters/state_providers/orders_provider.dart';
import '../../../3. Interface Adapters/state_providers/products_provider.dart';

class AppProviders extends StatelessWidget {
  final Widget child;

  const AppProviders({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<AuthProvider>(
          create: (_) => AuthProvider()..init(),
        ),
        ChangeNotifierProvider<CustomersProvider>(
          create: (_) => CustomersProvider(),
        ),
        ChangeNotifierProvider<ProductsProvider>(
          create: (_) => ProductsProvider(),
        ),
        ChangeNotifierProvider<InvoicesProvider>(
          create: (_) => InvoicesProvider(),
        ),
        ChangeNotifierProvider<OrdersProvider>(
          create: (_) => OrdersProvider(),
        ),
      ],
      child: child,
    );
  }
}
