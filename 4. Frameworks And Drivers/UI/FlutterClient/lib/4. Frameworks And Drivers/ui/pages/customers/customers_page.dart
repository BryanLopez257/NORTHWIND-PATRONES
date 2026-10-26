import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../1. Enterprise Business Rules/enterprise_business_rules.dart';
import '../../../../3. Interface Adapters/state_providers/customers_provider.dart';
import '../../components/badge_widget.dart';
import '../../components/pagination_widget.dart';
import 'customer_modal.dart';

class CustomersPage extends StatefulWidget {
  const CustomersPage({super.key});

  @override
  State<CustomersPage> createState() => _CustomersPageState();
}

class _CustomersPageState extends State<CustomersPage> {
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounceTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CustomersProvider>().loadCustomers();
    });
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String value) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 350), () {
      if (mounted) {
        context.read<CustomersProvider>().setSearchTerm(value);
      }
    });
  }

  void _openCreateModal() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const CustomerModal(),
    );
  }

  void _openEditModal(CustomerDto customer) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => CustomerModal(customer: customer),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<CustomersProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Row(
                        children: [
                          Icon(Icons.people_outline, color: Color(0xFF2563EB), size: 28),
                          SizedBox(width: 8),
                          Text(
                            'Catálogo de Clientes',
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Directorio corporativo de cuentas comerciales, razón social y estado de crédito.',
                        style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                      ),
                    ],
                  ),
                ),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    ElevatedButton.icon(
                      onPressed: _openCreateModal,
                      icon: const Icon(Icons.person_add_outlined, size: 18),
                      label: const Text('Nuevo Cliente'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                    OutlinedButton.icon(
                      onPressed: provider.isLoading ? null : () => provider.loadCustomers(),
                      icon: provider.isLoading
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.refresh, size: 18),
                      label: const Text('Actualizar'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF475569),
                        side: const BorderSide(color: Color(0xFFCBD5E1)),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Search Bar & Filter Controls
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
                side: const BorderSide(color: Color(0xFFE2E8F0)),
              ),
              color: Colors.white,
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Wrap(
                  spacing: 12,
                  runSpacing: 8,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  alignment: WrapAlignment.spaceBetween,
                  children: [
                    // Search text input
                    ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 400),
                      child: TextField(
                        controller: _searchController,
                        onChanged: _onSearchChanged,
                        decoration: InputDecoration(
                          hintText: 'Buscar por código, nombres o identificación...',
                          hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                          prefixIcon: const Icon(Icons.search, color: Color(0xFF94A3B8), size: 20),
                          suffixIcon: _searchController.text.isNotEmpty
                              ? IconButton(
                                  icon: const Icon(Icons.clear, size: 18, color: Color(0xFF94A3B8)),
                                  onPressed: () {
                                    _searchController.clear();
                                    provider.setSearchTerm('');
                                  },
                                )
                              : null,
                          isDense: true,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                          ),
                          contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                        ),
                      ),
                    ),

                    // Filter dropdowns
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Customer Type
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8),
                          decoration: BoxDecoration(
                            border: Border.all(color: const Color(0xFFCBD5E1)),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<int?>(
                              value: provider.filter.customerType,
                              hint: const Text('Todos los Tipos', style: TextStyle(fontSize: 12)),
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF334155)),
                              items: const [
                                DropdownMenuItem(value: null, child: Text('Todos los Tipos')),
                                DropdownMenuItem(value: 1, child: Text('👤 Persona Natural')),
                                DropdownMenuItem(value: 2, child: Text('🏢 Empresa')),
                              ],
                              onChanged: (val) => provider.setCustomerType(val),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),

                        // Balance Filter
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8),
                          decoration: BoxDecoration(
                            border: Border.all(color: const Color(0xFFCBD5E1)),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<int>(
                              value: provider.filter.balanceFilter ?? 0,
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF334155)),
                              items: const [
                                DropdownMenuItem(value: 0, child: Text('Todos los Saldos')),
                                DropdownMenuItem(value: 1, child: Text('🟢 Al Día (\$0.00)')),
                                DropdownMenuItem(value: 2, child: Text('🔴 Con Deuda (Bloqueados)')),
                              ],
                              onChanged: (val) => provider.setBalanceFilter(val),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Error display
            if (provider.errorMessage != null)
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF1F2),
                  border: Border.all(color: const Color(0xFFFECDD3)),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: Color(0xFFE11D48)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        provider.errorMessage!,
                        style: const TextStyle(color: Color(0xFF9F1239), fontSize: 13),
                      ),
                    ),
                  ],
                ),
              ),

            // Table Card
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
                side: const BorderSide(color: Color(0xFFE2E8F0)),
              ),
              color: Colors.white,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.badge_outlined, color: Color(0xFF2563EB), size: 20),
                            const SizedBox(width: 8),
                            Text(
                              'Clientes Registrados (${provider.pagedResult.totalCount})',
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                          ],
                        ),
                        if (provider.isLoading)
                          const Text(
                            'Sincronizando...',
                            style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                          ),
                      ],
                    ),
                  ),
                  const Divider(height: 1, color: Color(0xFFF1F5F9)),

                  // Content
                  if (provider.isLoading && provider.customers.isEmpty)
                    const Padding(
                      padding: EdgeInsets.all(48.0),
                      child: Center(
                        child: Column(
                          children: [
                            CircularProgressIndicator(),
                            SizedBox(height: 12),
                            Text('Cargando catálogo de clientes...', style: TextStyle(color: Color(0xFF64748B))),
                          ],
                        ),
                      ),
                    )
                  else if (provider.customers.isEmpty)
                    Padding(
                      padding: const EdgeInsets.all(48.0),
                      child: Center(
                        child: Column(
                          children: [
                            const Icon(Icons.people_outline, size: 48, color: Color(0xFFCBD5E1)),
                            const SizedBox(height: 12),
                            const Text(
                              'No se encontraron clientes registrados',
                              style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Presione "Nuevo Cliente" para agregar el primero al catálogo.',
                              style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: _openCreateModal,
                              icon: const Icon(Icons.add, size: 16),
                              label: const Text('Nuevo Cliente'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF2563EB),
                                foregroundColor: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: DataTable(
                        headingRowColor: WidgetStateProperty.all(const Color(0xFFF8FAFC)),
                        headingTextStyle: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF475569),
                        ),
                        dataRowMinHeight: 52,
                        dataRowMaxHeight: 56,
                        columns: const [
                          DataColumn(label: Text('ID')),
                          DataColumn(label: Text('Nombre / Razón Social')),
                          DataColumn(label: Text('Identificación')),
                          DataColumn(label: Text('Tipo')),
                          DataColumn(label: Text('Saldo Actual'), numeric: true),
                          DataColumn(label: Center(child: Text('Acción'))),
                        ],
                        rows: provider.customers.map((c) {
                          final isBlocked = c.currentBalance > 0;
                          final isLegal = c.customerType == 2;

                          return DataRow(
                            cells: [
                              DataCell(
                                Text(
                                  c.id,
                                  style: const TextStyle(
                                    fontFamily: 'monospace',
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF1D4ED8),
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                              DataCell(
                                Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      c.name,
                                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF0F172A)),
                                    ),
                                    if (c.tradeName != null && c.tradeName!.isNotEmpty)
                                      Text(
                                        '🏪 ${c.tradeName}',
                                        style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                                      ),
                                  ],
                                ),
                              ),
                              DataCell(
                                Text(
                                  c.identification.isNotEmpty ? c.identification : '—',
                                  style: const TextStyle(fontFamily: 'monospace', fontSize: 12, color: Color(0xFF475569)),
                                ),
                              ),
                              DataCell(
                                BadgeWidget(
                                  label: isLegal ? 'Empresa' : 'Persona Natural',
                                  variant: isLegal ? BadgeVariant.info : BadgeVariant.defaultVariant,
                                ),
                              ),
                              DataCell(
                                BadgeWidget(
                                  label: '\$${c.currentBalance.toStringAsFixed(2)}',
                                  variant: isBlocked ? BadgeVariant.danger : BadgeVariant.success,
                                ),
                              ),
                              DataCell(
                                Center(
                                  child: OutlinedButton.icon(
                                    onPressed: () => _openEditModal(c),
                                    icon: const Icon(Icons.edit_outlined, size: 14),
                                    label: const Text('Editar'),
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: const Color(0xFF2563EB),
                                      side: const BorderSide(color: Color(0xFFBFDBFE)),
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      minimumSize: const Size(60, 32),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          );
                        }).toList(),
                      ),
                    ),

                  // Pagination footer
                  PaginationWidget(
                    pageNumber: provider.pagedResult.pageNumber,
                    totalPages: provider.pagedResult.totalPages,
                    totalCount: provider.pagedResult.totalCount,
                    pageSize: provider.pagedResult.pageSize,
                    onPageChanged: (newPage) => provider.setPage(newPage),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
