import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../3. Interface Adapters/state_providers/invoices_provider.dart';
import '../../components/pagination_widget.dart';
import 'invoice_voucher.dart';

class InvoicesPage extends StatefulWidget {
  const InvoicesPage({super.key});

  @override
  State<InvoicesPage> createState() => _InvoicesPageState();
}

class _InvoicesPageState extends State<InvoicesPage> {
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _tableHorizontalController = ScrollController();
  Timer? _debounceTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<InvoicesProvider>().loadInvoices();
    });
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchController.dispose();
    _tableHorizontalController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String value) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 350), () {
      if (mounted) {
        context.read<InvoicesProvider>().setSearchTerm(value);
      }
    });
  }

  String _formatDate(DateTime d) {
    return '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')} ${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
  }

  String _formatCurrency(double val) {
    return '\$${val.toStringAsFixed(2)}';
  }

  String _getPlaceholder(String criteria) {
    if (criteria == 'invoiceNumber') {
      return 'Buscar específicamente por N° de factura (ej: FAC-0001)...';
    }
    if (criteria == 'customer') {
      return 'Buscar específicamente por cliente (ej: ALFKI o Alfreds)...';
    }
    return 'Buscar por N° factura, código o nombre de cliente...';
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<InvoicesProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: const [
                          Icon(Icons.receipt_long, color: Color(0xFF2563EB), size: 28),
                          SizedBox(width: 8),
                          Text(
                            'Historial de Facturas y Comprobantes',
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Consulta, auditoría contable y reimpresión de comprobantes electrónicos oficiales emitidos.',
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
                      onPressed: () {
                        Navigator.pushNamed(context, '/create-order');
                      },
                      icon: const Icon(Icons.shopping_cart_outlined, size: 18),
                      label: const Text('Nueva Orden'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                    OutlinedButton.icon(
                      onPressed: provider.isLoading ? null : () => provider.loadInvoices(),
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

            // Search Bar with Criteria Selector
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
                side: const BorderSide(color: Color(0xFFE2E8F0)),
              ),
              color: Colors.white,
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      decoration: BoxDecoration(
                        border: Border.all(color: const Color(0xFFCBD5E1)),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: provider.criteria,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF334155),
                          ),
                          items: const [
                            DropdownMenuItem(value: 'all', child: Text('🔍 Todos')),
                            DropdownMenuItem(value: 'invoiceNumber', child: Text('🧾 N° Factura')),
                            DropdownMenuItem(value: 'customer', child: Text('👤 Cliente')),
                          ],
                          onChanged: (val) {
                            if (val != null) {
                              provider.setCriteria(val);
                            }
                          },
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        onChanged: _onSearchChanged,
                        decoration: InputDecoration(
                          hintText: _getPlaceholder(provider.criteria),
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
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(color: Color(0xFF2563EB), width: 1.5),
                          ),
                          contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                        ),
                      ),
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
                  // Table Header bar
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.description_outlined, color: Color(0xFF2563EB), size: 20),
                            const SizedBox(width: 8),
                            Text(
                              'Comprobantes Emitidos (${provider.pagedResult.totalCount})',
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
                  if (provider.isLoading && provider.invoices.isEmpty)
                    const Padding(
                      padding: EdgeInsets.all(48.0),
                      child: Center(
                        child: Column(
                          children: [
                            CircularProgressIndicator(),
                            SizedBox(height: 12),
                            Text('Cargando facturas...', style: TextStyle(color: Color(0xFF64748B))),
                          ],
                        ),
                      ),
                    )
                  else if (provider.invoices.isEmpty)
                    Padding(
                      padding: const EdgeInsets.all(48.0),
                      child: Center(
                        child: Column(
                          children: [
                            const Icon(Icons.receipt_long, size: 48, color: Color(0xFFCBD5E1)),
                            SizedBox(height: 12),
                            const Text(
                              'No se encontraron facturas registradas',
                              style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _searchController.text.isNotEmpty
                                  ? 'No hay comprobantes que coincidan con los criterios de búsqueda aplicados.'
                                  : 'Las órdenes de venta confirmadas se reflejarán automáticamente en esta vista.',
                              style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: () => Navigator.pushNamed(context, '/create-order'),
                              icon: const Icon(Icons.shopping_cart_outlined, size: 16),
                              label: const Text('Emitir Primera Orden'),
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
                    Scrollbar(
                      controller: _tableHorizontalController,
                      thumbVisibility: true,
                      trackVisibility: true,
                      child: SingleChildScrollView(
                        controller: _tableHorizontalController,
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
                            DataColumn(label: Text('N° Factura')),
                            DataColumn(label: Text('Fecha Emisión')),
                            DataColumn(label: Text('Cliente / Razón Social')),
                            DataColumn(label: Text('Doc. Tributario / ID')),
                            DataColumn(label: Text('Vendedor')),
                            DataColumn(label: Text('Subtotal'), numeric: true),
                            DataColumn(label: Text('IVA (15%)'), numeric: true),
                            DataColumn(label: Text('Total'), numeric: true),
                            DataColumn(label: Center(child: Text('Comprobante'))),
                          ],
                          rows: provider.invoices.map((inv) {
                            return DataRow(
                              cells: [
                                // N° Factura
                                DataCell(
                                  Text(
                                    inv.invoiceNumber.isNotEmpty ? inv.invoiceNumber : 'FAC-${inv.id}',
                                    style: const TextStyle(
                                      fontFamily: 'monospace',
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF1D4ED8),
                                    ),
                                  ),
                                ),
                                // Fecha Emisión
                                DataCell(
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.calendar_today, size: 13, color: Color(0xFF94A3B8)),
                                      const SizedBox(width: 4),
                                      Text(
                                        _formatDate(inv.createdDate),
                                        style: const TextStyle(fontSize: 12, color: Color(0xFF475569)),
                                      ),
                                    ],
                                  ),
                                ),
                                // Cliente / Razón Social
                                DataCell(
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.business, size: 14, color: Color(0xFF94A3B8)),
                                      const SizedBox(width: 4),
                                      ConstrainedBox(
                                        constraints: const BoxConstraints(maxWidth: 200),
                                        child: Text(
                                          inv.customerName?.isNotEmpty == true
                                              ? inv.customerName!
                                              : inv.customerId,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w500,
                                            color: Color(0xFF1E293B),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                // Doc. Tributario / ID
                                DataCell(
                                  Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        inv.customerDocument ?? 'S/D',
                                        style: const TextStyle(
                                          fontFamily: 'monospace',
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                          color: Color(0xFF334155),
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFEFF6FF),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          'ID: ${inv.customerId}',
                                          style: const TextStyle(
                                            fontFamily: 'monospace',
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF1D4ED8),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                // Vendedor
                                DataCell(
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.person_outline, size: 13, color: Color(0xFF94A3B8)),
                                      const SizedBox(width: 4),
                                      ConstrainedBox(
                                        constraints: const BoxConstraints(maxWidth: 120),
                                        child: Text(
                                          inv.sellerFullName?.isNotEmpty == true
                                              ? inv.sellerFullName!
                                              : 'Ventas NW',
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(fontSize: 12, color: Color(0xFF334155)),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                // Subtotal
                                DataCell(
                                  Text(
                                    _formatCurrency(inv.subTotal),
                                    style: const TextStyle(
                                      fontFamily: 'monospace',
                                      fontSize: 12,
                                      color: Color(0xFF334155),
                                    ),
                                  ),
                                ),
                                // IVA
                                DataCell(
                                  Text(
                                    _formatCurrency(inv.tax),
                                    style: const TextStyle(
                                      fontFamily: 'monospace',
                                      fontSize: 12,
                                      color: Color(0xFF334155),
                                    ),
                                  ),
                                ),
                                // Total
                                DataCell(
                                  Text(
                                    _formatCurrency(inv.total),
                                    style: const TextStyle(
                                      fontFamily: 'monospace',
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF047857),
                                    ),
                                  ),
                                ),
                                // Comprobante
                                DataCell(
                                  OutlinedButton.icon(
                                    onPressed: () {
                                      showDialog(
                                        context: context,
                                        barrierDismissible: false,
                                        builder: (_) => InvoiceVoucher(invoice: inv),
                                      );
                                    },
                                    icon: const Icon(Icons.visibility_outlined, size: 14),
                                    label: const Text('Ver'),
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: const Color(0xFF1D4ED8),
                                      side: const BorderSide(color: Color(0xFFBFDBFE)),
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      minimumSize: const Size(60, 32),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                                    ),
                                  ),
                                ),
                              ],
                            );
                          }).toList(),
                        ),
                      ),
                    ),

                  // Pagination footer
                  PaginationWidget(
                    pageNumber: provider.pagedResult.pageNumber,
                    totalPages: provider.pagedResult.totalPages,
                    totalCount: provider.pagedResult.totalCount,
                    pageSize: provider.pagedResult.pageSize,
                    onPageChanged: (newPage) => provider.setPage(newPage),
                    onPageSizeChanged: (newSize) => provider.setPageSize(newSize),
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
