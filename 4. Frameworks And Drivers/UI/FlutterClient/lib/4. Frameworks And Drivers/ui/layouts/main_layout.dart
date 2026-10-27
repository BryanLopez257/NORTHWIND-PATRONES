import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../3. Interface Adapters/state_providers/auth_provider.dart';
import '../components/badge_widget.dart';

class MainLayout extends StatelessWidget {
  final Widget child;
  final String currentRoute;

  const MainLayout({
    super.key,
    required this.child,
    required this.currentRoute,
  });

  static const List<NavItem> navItems = [
    NavItem(label: 'Nueva Orden', route: '/create-order', icon: Icons.shopping_cart_outlined),
    NavItem(label: 'Facturas', route: '/invoices', icon: Icons.receipt_long_outlined),
    // NavItem(label: 'Clientes', route: '/customers', icon: Icons.people_outline), // Oculto
    // NavItem(label: 'Productos', route: '/products', icon: Icons.inventory_2_outlined), // Oculto
    // NavItem(label: 'Configuración', route: '/settings', icon: Icons.settings_outlined),
  ];

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Text(
          '¿Desea cerrar la sesión activa?',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              'Se revocará el acceso local en este dispositivo y se requerirá autenticación nuevamente.',
              style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
            ),
            SizedBox(height: 12),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.warning_amber_rounded, color: Color(0xFFD97706), size: 18),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Cualquier cambio sin guardar en órdenes o formularios en progreso podría perderse.',
                    style: TextStyle(fontSize: 12, color: Color(0xFF92400E)),
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          OutlinedButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Permanecer Conectado'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE11D48)),
            onPressed: () async {
              Navigator.of(ctx).pop();
              await context.read<AuthProvider>().logout();
              if (context.mounted) {
                Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
              }
            },
            child: const Text('Confirmar Cierre de Sesión', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _navigate(BuildContext context, String route) {
    if (currentRoute == route) return;
    Navigator.of(context).pushReplacementNamed(route);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;
    final isDesktop = MediaQuery.of(context).size.width >= 768;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(64),
        child: Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: SafeArea(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Brand / Mobile toggle
                Row(
                  children: [
                    if (!isDesktop)
                      Builder(
                        builder: (ctx) => IconButton(
                          icon: const Icon(Icons.menu, color: Color(0xFF475569)),
                          onPressed: () => Scaffold.of(ctx).openDrawer(),
                        ),
                      ),
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF2563EB),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.store, color: Colors.white, size: 20),
                    ),
                    const SizedBox(width: 8),
                    RichText(
                      text: const TextSpan(
                        children: [
                          TextSpan(
                            text: 'NorthWind ',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          TextSpan(
                            text: 'Enterprise',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF2563EB),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                // User Info & Logout Button
                Row(
                  children: [
                    if (isDesktop && user != null) ...[
                      CircleAvatar(
                        radius: 18,
                        backgroundColor: const Color(0xFFEFF6FF),
                        child: const Icon(Icons.person, color: Color(0xFF2563EB), size: 20),
                      ),
                      const SizedBox(width: 8),
                      Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                user.name.isNotEmpty ? user.name : 'Usuario',
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                              const SizedBox(width: 6),
                              BadgeWidget(
                                label: user.role.isNotEmpty ? user.role : 'Vendedor',
                                variant: BadgeVariant.info,
                              ),
                            ],
                          ),
                          Text(
                            user.email.isNotEmpty ? user.email : 'usuario@northwind.com',
                            style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                          ),
                        ],
                      ),
                      const SizedBox(width: 16),
                    ],
                    OutlinedButton.icon(
                      onPressed: () => _showLogoutDialog(context),
                      icon: const Icon(Icons.logout, size: 16),
                      label: Text(isDesktop ? 'Cerrar Sesión' : ''),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF475569),
                        side: const BorderSide(color: Color(0xFFCBD5E1)),
                        padding: EdgeInsets.symmetric(
                          horizontal: isDesktop ? 12 : 8,
                          vertical: 8,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
      drawer: isDesktop
          ? null
          : Drawer(
              backgroundColor: Colors.white,
              child: SafeArea(
                child: Column(
                  children: [
                    // Drawer Header
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: const Color(0xFF2563EB),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(Icons.store, color: Colors.white, size: 20),
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'NorthWind Sales',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                          ),
                        ],
                      ),
                    ),
                    const Divider(height: 1, color: Color(0xFFE2E8F0)),

                    // Nav items
                    Expanded(
                      child: ListView(
                        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                        children: navItems.map((item) {
                          final isActive = currentRoute == item.route;
                          return ListTile(
                            leading: Icon(
                              item.icon,
                              color: isActive ? const Color(0xFF2563EB) : const Color(0xFF64748B),
                            ),
                            title: Text(
                              item.label,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
                                color: isActive ? const Color(0xFF2563EB) : const Color(0xFF334155),
                              ),
                            ),
                            selected: isActive,
                            selectedTileColor: const Color(0xFFEFF6FF),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            onTap: () {
                              Navigator.of(context).pop();
                              _navigate(context, item.route);
                            },
                          );
                        }).toList(),
                      ),
                    ),

                    // User Profile Footnote
                    const Divider(height: 1, color: Color(0xFFE2E8F0)),
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          if (user != null)
                            Row(
                              children: [
                                CircleAvatar(
                                  radius: 18,
                                  backgroundColor: const Color(0xFFEFF6FF),
                                  child: const Icon(Icons.person, color: Color(0xFF2563EB), size: 20),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Flexible(
                                            child: Text(
                                              user.name.isNotEmpty ? user.name : 'Usuario',
                                              overflow: TextOverflow.ellipsis,
                                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                            ),
                                          ),
                                          const SizedBox(width: 6),
                                          BadgeWidget(
                                            label: user.role.isNotEmpty ? user.role : 'Vendedor',
                                            variant: BadgeVariant.info,
                                          ),
                                        ],
                                      ),
                                      Text(
                                        user.email.isNotEmpty ? user.email : 'usuario@northwind.com',
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          const SizedBox(height: 12),
                          OutlinedButton.icon(
                            onPressed: () {
                              Navigator.of(context).pop();
                              _showLogoutDialog(context);
                            },
                            icon: const Icon(Icons.logout, size: 16, color: Color(0xFFE11D48)),
                            label: const Text('Cerrar Sesión', style: TextStyle(color: Color(0xFFE11D48))),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Color(0xFFFECDD3)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
      body: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Desktop Sidebar
          if (isDesktop)
            Container(
              width: 220,
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(right: BorderSide(color: Color(0xFFE2E8F0))),
              ),
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
              child: Column(
                children: navItems.map((item) {
                  final isActive = currentRoute == item.route;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 4.0),
                    child: InkWell(
                      onTap: () => _navigate(context, item.route),
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: isActive ? const Color(0xFFEFF6FF) : Colors.transparent,
                          borderRadius: BorderRadius.circular(8),
                          border: isActive
                              ? const Border(right: BorderSide(color: Color(0xFF2563EB), width: 3))
                              : null,
                        ),
                        child: Row(
                          children: [
                            Icon(
                              item.icon,
                              size: 20,
                              color: isActive ? const Color(0xFF2563EB) : const Color(0xFF64748B),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              item.label,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
                                color: isActive ? const Color(0xFF2563EB) : const Color(0xFF334155),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

          // Main Screen Content
          Expanded(child: child),
        ],
      ),
    );
  }
}

class NavItem {
  final String label;
  final String route;
  final IconData icon;

  const NavItem({
    required this.label,
    required this.route,
    required this.icon,
  });
}
