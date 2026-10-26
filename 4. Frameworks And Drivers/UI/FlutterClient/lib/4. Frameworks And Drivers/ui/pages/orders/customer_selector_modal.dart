import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../1. Enterprise Business Rules/enterprise_business_rules.dart';
import '../../../../3. Interface Adapters/repositories/customers_repository.dart';
import '../../components/badge_widget.dart';
import '../../components/pagination_widget.dart';

class CustomerSelectorModal extends StatefulWidget {
  final String? selectedCustomerId;
  final ValueChanged<CustomerDto> onSelectCustomer;

  const CustomerSelectorModal({
    super.key,
    this.selectedCustomerId,
    required this.onSelectCustomer,
  });

  @override
  State<CustomerSelectorModal> createState() => _CustomerSelectorModalState();
}

class _CustomerSelectorModalState extends State<CustomerSelectorModal> {
  final CustomersRepository _repository = CustomersRepository();
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounceTimer;

  String _searchCriteria = 'all';
  String _typeFilter = 'Todos'; // 'Todos', 'Persona Natural', 'Empresa'
  int _pageNumber = 1;
  static const int _pageSize = 10;

  bool _isLoading = false;
  String? _errorMessage;
  String? _blockedWarning;
  List<CustomerDto> _customers = [];
  int _totalCount = 0;
  int _totalPages = 1;

  @override
  void initState() {
    super.initState();
    _loadCustomers();
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadCustomers() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final filter = CustomerFilterDto(
        searchTerm: _searchController.text.trim().isNotEmpty ? _searchController.text.trim() : null,
        criteria: _searchCriteria != 'all' ? _searchCriteria : null,
        customerType: _typeFilter == 'Persona Natural' ? 1 : (_typeFilter == 'Empresa' ? 2 : null),
        pageNumber: _pageNumber,
        pageSize: _pageSize,
      );

      final result = await _repository.getCustomers(filter);
      if (mounted) {
        setState(() {
          _customers = result.items;
          _totalCount = result.totalCount;
          _totalPages = result.totalPages > 0 ? result.totalPages : 1;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceFirst('Exception: ', '');
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _onSearchChanged(String value) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 350), () {
      if (mounted) {
        setState(() {
          _pageNumber = 1;
        });
        _loadCustomers();
      }
    });
  }

  void _handleSelect(CustomerDto customer) {
    if (customer.currentBalance > 0) {
      setState(() {
        _blockedWarning =
            "No se puede seleccionar al cliente '${customer.name}' (${customer.id}) porque posee un saldo deudor pendiente de \$${customer.currentBalance.toStringAsFixed(2)}. Los clientes con saldo pendiente no están autorizados para emitir nuevas órdenes.";
      });
      return;
    }
    setState(() {
      _blockedWarning = null;
    });
    widget.onSelectCustomer(customer);
    Navigator.of(context).pop();
  }

  String _getPlaceholder() {
    switch (_searchCriteria) {
      case 'id':
        return 'Buscar por código (ej: ALFKI)...';
      case 'identification':
        return 'Buscar por cédula (10 dígitos) o RUC (13 dígitos)...';
      case 'name':
        return 'Buscar por nombres y apellidos...';
      case 'lastname':
        return 'Buscar por primer apellido...';
      case 'businessname':
        return 'Buscar por razón social de la empresa...';
      case 'tradename':
        return 'Buscar por nombre comercial (ej. Taquería El Paso)...';
      case 'all':
      default:
        return 'Buscar cliente por ID, nombres, razón social o identificación...';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      backgroundColor: Colors.white,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 950, maxHeight: 720),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'Seleccionar Cliente para la Orden',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Seleccione un cliente con saldo al día para autorizar la emisión del pedido.',
                        style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Color(0xFF64748B)),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Banner de Condición de Crédito
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFFBEB),
                  border: Border.all(color: const Color(0xFFFCD34D)),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: const [
                    Icon(Icons.shield_outlined, color: Color(0xFFD97706), size: 18),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text.rich(
                        TextSpan(
                          children: [
                            TextSpan(
                              text: 'Condición de Crédito: ',
                              style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF78350F), fontSize: 12),
                            ),
                            TextSpan(
                              text: 'Solo se permite crear órdenes a clientes con saldo \$0.00. Clientes con saldo pendiente están bloqueados.',
                              style: TextStyle(color: Color(0xFF92400E), fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Blocked Warning Alert
              if (_blockedWarning != null) ...[
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF1F2),
                    border: Border.all(color: const Color(0xFFFECDD3)),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.error_outline, color: Color(0xFFE11D48), size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _blockedWarning!,
                          style: const TextStyle(color: Color(0xFF9F1239), fontSize: 12, fontWeight: FontWeight.w500),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, size: 16, color: Color(0xFF9F1239)),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        onPressed: () => setState(() => _blockedWarning = null),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 12),

              // Filters & Search
              Wrap(
                spacing: 12,
                runSpacing: 8,
                crossAxisAlignment: WrapCrossAlignment.center,
                alignment: WrapAlignment.spaceBetween,
                children: [
                  // Type filter buttons
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    padding: const EdgeInsets.all(3),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _buildFilterButton('Todos', Icons.group_outlined),
                        _buildFilterButton('Persona Natural', Icons.person_outline),
                        _buildFilterButton('Empresa', Icons.business_outlined),
                      ],
                    ),
                  ),

                  // Search input + criteria
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 480),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8),
                          decoration: BoxDecoration(
                            border: Border.all(color: const Color(0xFFCBD5E1)),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: _searchCriteria,
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF334155)),
                              items: const [
                                DropdownMenuItem(value: 'all', child: Text('🔍 Todos')),
                                DropdownMenuItem(value: 'tradename', child: Text('🏪 Comercial')),
                                DropdownMenuItem(value: 'identification', child: Text('💳 Cédula/RUC')),
                                DropdownMenuItem(value: 'id', child: Text('🏷️ Código')),
                                DropdownMenuItem(value: 'name', child: Text('👤 Nombres y apellidos')),
                                DropdownMenuItem(value: 'lastname', child: Text('👤 Primer Apellido')),
                                DropdownMenuItem(value: 'businessname', child: Text('🏢 Razón Social')),
                              ],
                              onChanged: (val) {
                                if (val != null) {
                                  setState(() {
                                    _searchCriteria = val;
                                    _pageNumber = 1;
                                  });
                                  _loadCustomers();
                                }
                              },
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            controller: _searchController,
                            onChanged: _onSearchChanged,
                            decoration: InputDecoration(
                              hintText: _getPlaceholder(),
                              hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                              prefixIcon: const Icon(Icons.search, size: 18, color: Color(0xFF94A3B8)),
                              suffixIcon: _searchController.text.isNotEmpty
                                  ? IconButton(
                                      icon: const Icon(Icons.clear, size: 16, color: Color(0xFF94A3B8)),
                                      onPressed: () {
                                        _searchController.clear();
                                        _onSearchChanged('');
                                      },
                                    )
                                  : null,
                              isDense: true,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                                borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                              ),
                              contentPadding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Table Content
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: _isLoading
                      ? const Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              CircularProgressIndicator(),
                              SizedBox(height: 10),
                              Text('Cargando catálogo de clientes...', style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
                            ],
                          ),
                        )
                      : _errorMessage != null
                          ? Center(
                              child: Text(_errorMessage!, style: const TextStyle(color: Color(0xFFE11D48), fontSize: 13)),
                            )
                          : _customers.isEmpty
                              ? const Center(
                                  child: Text('No se encontraron clientes coincidentes.', style: TextStyle(color: Color(0xFF94A3B8))),
                                )
                              : SingleChildScrollView(
                                  scrollDirection: Axis.vertical,
                                  child: SingleChildScrollView(
                                    scrollDirection: Axis.horizontal,
                                    child: DataTable(
                                      headingRowColor: WidgetStateProperty.all(const Color(0xFFF8FAFC)),
                                      headingTextStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF475569)),
                                      dataRowMinHeight: 48,
                                      dataRowMaxHeight: 52,
                                      columns: const [
                                        DataColumn(label: Text('ID')),
                                        DataColumn(label: Text('Nombre / Razón Social')),
                                        DataColumn(label: Text('Identificación')),
                                        DataColumn(label: Text('Tipo')),
                                        DataColumn(label: Text('Saldo Actual'), numeric: true),
                                        DataColumn(label: Center(child: Text('Acción'))),
                                      ],
                                      rows: _customers.map((c) {
                                        final isBlocked = c.currentBalance > 0;
                                        final isSelected = widget.selectedCustomerId?.toUpperCase() == c.id.toUpperCase();
                                        final isLegal = c.customerType == 2;

                                        return DataRow(
                                          color: WidgetStateProperty.resolveWith<Color?>((states) {
                                            if (isSelected) return const Color(0xFFEFF6FF);
                                            if (isBlocked) return const Color(0xFFFFF1F2).withValues(alpha: 0.4);
                                            return null;
                                          }),
                                          cells: [
                                            DataCell(
                                              Text(
                                                c.id,
                                                style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, color: Color(0xFF1D4ED8), fontSize: 12),
                                              ),
                                            ),
                                            DataCell(
                                              Column(
                                                mainAxisAlignment: MainAxisAlignment.center,
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(c.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: Color(0xFF0F172A))),
                                                  if (c.tradeName != null && c.tradeName!.isNotEmpty)
                                                    Text('🏪 ${c.tradeName}', style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                                                  if (isBlocked)
                                                    const Text('Bloqueado por saldo pendiente', style: TextStyle(fontSize: 10, color: Color(0xFFE11D48), fontWeight: FontWeight.w600))
                                                  else
                                                    const Text('Habilitado para compra', style: TextStyle(fontSize: 10, color: Color(0xFF059669), fontWeight: FontWeight.w600)),
                                                ],
                                              ),
                                            ),
                                            DataCell(
                                              Text(c.identification.isNotEmpty ? c.identification : '—', style: const TextStyle(fontFamily: 'monospace', fontSize: 11, color: Color(0xFF475569))),
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
                                              isBlocked
                                                  ? ElevatedButton.icon(
                                                      onPressed: () => _handleSelect(c),
                                                      icon: const Icon(Icons.lock_outline, size: 14),
                                                      label: const Text('Bloqueado'),
                                                      style: ElevatedButton.styleFrom(
                                                        backgroundColor: const Color(0xFFFFF1F2),
                                                        foregroundColor: const Color(0xFFBE123C),
                                                        side: const BorderSide(color: Color(0xFFFECDD3)),
                                                        elevation: 0,
                                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                        textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                                                      ),
                                                    )
                                                  : ElevatedButton.icon(
                                                      onPressed: () => _handleSelect(c),
                                                      icon: Icon(isSelected ? Icons.check_circle : Icons.check, size: 14),
                                                      label: Text(isSelected ? 'Seleccionado' : 'Seleccionar'),
                                                      style: ElevatedButton.styleFrom(
                                                        backgroundColor: isSelected ? const Color(0xFF334155) : const Color(0xFF2563EB),
                                                        foregroundColor: Colors.white,
                                                        elevation: 0,
                                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                                        textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                                                      ),
                                                    ),
                                            ),
                                          ],
                                        );
                                      }).toList(),
                                    ),
                                  ),
                                ),
                ),
              ),

              // Pagination & Footer
              Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Total de clientes: $_totalCount',
                      style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                    ),
                    OutlinedButton(
                      onPressed: () => Navigator.of(context).pop(),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      ),
                      child: const Text('Cerrar', style: TextStyle(fontSize: 12)),
                    ),
                  ],
                ),
              ),
              PaginationWidget(
                pageNumber: _pageNumber,
                totalPages: _totalPages,
                totalCount: _totalCount,
                pageSize: _pageSize,
                onPageChanged: (page) {
                  setState(() => _pageNumber = page);
                  _loadCustomers();
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFilterButton(String type, IconData icon) {
    final isSelected = _typeFilter == type;
    return InkWell(
      onTap: () {
        setState(() {
          _typeFilter = type;
          _pageNumber = 1;
        });
        _loadCustomers();
      },
      borderRadius: BorderRadius.circular(6),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
          boxShadow: isSelected ? [const BoxShadow(color: Colors.black12, blurRadius: 2, offset: Offset(0, 1))] : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: isSelected ? const Color(0xFF1D4ED8) : const Color(0xFF64748B)),
            const SizedBox(width: 4),
            Text(
              type,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected ? const Color(0xFF1D4ED8) : const Color(0xFF64748B),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
