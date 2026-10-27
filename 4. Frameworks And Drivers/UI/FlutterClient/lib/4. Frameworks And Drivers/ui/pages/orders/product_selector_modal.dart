import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../1. Enterprise Business Rules/enterprise_business_rules.dart';
import '../../../../3. Interface Adapters/repositories/products_repository.dart';
import '../../components/badge_widget.dart';
import '../../components/pagination_widget.dart';

class ProductSelectorModal extends StatefulWidget {
  final List<int> selectedProductIds;
  final ValueChanged<ProductDto> onSelectProduct;
  final int? replacingProductId;
  final String? replacingProductName;

  const ProductSelectorModal({
    super.key,
    required this.selectedProductIds,
    required this.onSelectProduct,
    this.replacingProductId,
    this.replacingProductName,
  });

  @override
  State<ProductSelectorModal> createState() => _ProductSelectorModalState();
}

class _ProductSelectorModalState extends State<ProductSelectorModal> {
  final ProductsRepository _repository = ProductsRepository();
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounceTimer;

  String _searchCriteria = 'all'; // 'all', 'name', 'id'
  bool _onlyInStock = true;
  int _pageNumber = 1;
  static const int _pageSize = 10;

  bool _isLoading = false;
  String? _errorMessage;
  List<ProductDto> _products = [];
  int _totalCount = 0;
  int _totalPages = 1;

  bool get _isReplaceMode => widget.replacingProductId != null;

  List<ProductDto> get _filteredProducts {
    return _products.where((p) {
      if (_onlyInStock && p.unitsInStock <= 0) {
        return false;
      }

      final term = _searchController.text.trim().toLowerCase();
      if (term.isNotEmpty) {
        final idStr = p.id.toString();
        final nameStr = p.name.toLowerCase();

        if (_searchCriteria == 'id') {
          return idStr.startsWith(term) || idStr == term;
        }
        if (_searchCriteria == 'name') {
          return nameStr.contains(term);
        }
        return nameStr.contains(term) || idStr.startsWith(term) || idStr == term;
      }

      return true;
    }).toList();
  }

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadProducts() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final term = _searchController.text.trim();
      final filter = ProductFilterDto(
        searchTerm: term.isNotEmpty ? term : null,
        stockFilter: _onlyInStock ? 1 : null,
        pageNumber: _pageNumber,
        pageSize: _pageSize,
      );

      final result = await _repository.getProducts(filter);
      if (mounted) {
        setState(() {
          _products = result.items;
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
    setState(() {});
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 350), () {
      if (mounted) {
        setState(() => _pageNumber = 1);
        _loadProducts();
      }
    });
  }

  void _handleSelect(ProductDto product) {
    if (product.unitsInStock <= 0) return;

    if (!_isReplaceMode && widget.selectedProductIds.contains(product.id)) {
      return;
    }

    if (_isReplaceMode && product.id == widget.replacingProductId) {
      return;
    }

    widget.onSelectProduct(product);
    Navigator.of(context).pop();
  }

  String _getPlaceholder() {
    if (_searchCriteria == 'id') return 'Buscar específicamente por ID (ej: 1, 2)...';
    if (_searchCriteria == 'name') return 'Buscar específicamente por nombre de producto...';
    return 'Buscar por nombre o ID de producto...';
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      backgroundColor: Colors.white,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 900, maxHeight: 720),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _isReplaceMode
                              ? 'Reemplazar Producto: ${widget.replacingProductName ?? "#${widget.replacingProductId}"}'
                              : 'Catálogo de Productos para la Orden',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          _isReplaceMode
                              ? 'Seleccione el producto por el cual desea reemplazar este ítem. Si selecciona un producto ya existente, se incrementará su cantidad en 1.'
                              : 'Seleccione los productos disponibles en inventario para agregar al carrito de compra.',
                          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Color(0xFF64748B)),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Modo Reemplazo Banner
              if (_isReplaceMode) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFF6FF),
                    border: Border.all(color: const Color(0xFFBFDBFE)),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: const [
                      Icon(Icons.swap_horiz, color: Color(0xFF2563EB), size: 18),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Modo Reemplazo: El producto actual a reemplazar está deshabilitado. Puede elegir cualquier otro producto del catálogo o uno ya incluido en la orden (se le sumará +1 unidad).',
                          style: TextStyle(fontSize: 12, color: Color(0xFF1E40AF)),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
              ],

              // Controls: Search + Stock Filter Checkbox
              Wrap(
                spacing: 12,
                runSpacing: 8,
                crossAxisAlignment: WrapCrossAlignment.center,
                alignment: WrapAlignment.spaceBetween,
                children: [
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 450),
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
                                DropdownMenuItem(value: 'name', child: Text('📦 Nombre')),
                                DropdownMenuItem(value: 'id', child: Text('#️⃣ ID')),
                              ],
                              onChanged: (val) {
                                if (val != null) {
                                  setState(() {
                                    _searchCriteria = val;
                                    _pageNumber = 1;
                                  });
                                  _loadProducts();
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

                  // Stock checkbox
                  InkWell(
                    onTap: () {
                      setState(() {
                        _onlyInStock = !_onlyInStock;
                        _pageNumber = 1;
                      });
                      _loadProducts();
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Checkbox(
                            value: _onlyInStock,
                            activeColor: const Color(0xFF2563EB),
                            onChanged: (val) {
                              setState(() {
                                _onlyInStock = val ?? false;
                                _pageNumber = 1;
                              });
                              _loadProducts();
                            },
                            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            visualDensity: VisualDensity.compact,
                          ),
                          const SizedBox(width: 4),
                          const Text(
                            'Solo productos con existencias disponibles',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF334155)),
                          ),
                        ],
                      ),
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
                              Text('Cargando catálogo de productos...', style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
                            ],
                          ),
                        )
                      : _errorMessage != null
                          ? Center(
                              child: Text(_errorMessage!, style: const TextStyle(color: Color(0xFFE11D48), fontSize: 13)),
                            )
                          : _filteredProducts.isEmpty
                              ? const Center(
                                  child: Text('No se encontraron productos coincidentes.', style: TextStyle(color: Color(0xFF94A3B8))),
                                )
                              : LayoutBuilder(
                                  builder: (context, constraints) => SingleChildScrollView(
                                  scrollDirection: Axis.vertical,
                                  child: SingleChildScrollView(
                                    scrollDirection: Axis.horizontal,
                                    child: DataTable(
                                      headingRowColor: WidgetStateProperty.all(const Color(0xFFF8FAFC)),
                                      headingTextStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF475569)),
                                      dataRowMinHeight: 48,
                                      dataRowMaxHeight: 52,
                                      columns: [
                                        const DataColumn(label: Text('ID')),
                                        DataColumn(
                                          label: ConstrainedBox(
                                            constraints: BoxConstraints(
                                              minWidth: (constraints.maxWidth - 600).clamp(160.0, double.infinity),
                                            ),
                                            child: const Text('Producto'),
                                          ),
                                        ),
                                        const DataColumn(label: Text('Precio Unitario'), numeric: true),
                                        const DataColumn(label: Center(child: Text('Stock Disp.'))),
                                        const DataColumn(label: Center(child: Text('Acción'))),
                                      ],
                                      rows: _filteredProducts.map((p) {
                                        final isCurrentReplacing = _isReplaceMode && p.id == widget.replacingProductId;
                                        final isAlreadyInCart = widget.selectedProductIds.contains(p.id);
                                        final isOutOfStock = p.unitsInStock <= 0;

                                        return DataRow(
                                          color: WidgetStateProperty.resolveWith<Color?>((states) {
                                            if (isCurrentReplacing) return const Color(0xFFF1F5F9);
                                            if (isAlreadyInCart && !_isReplaceMode) return const Color(0xFFFEF3C7).withValues(alpha: 0.4);
                                            return null;
                                          }),
                                          cells: [
                                            DataCell(
                                              Text(
                                                '#${p.id}',
                                                style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, color: Color(0xFF64748B), fontSize: 12),
                                              ),
                                            ),
                                            DataCell(
                                              Column(
                                                mainAxisAlignment: MainAxisAlignment.center,
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(p.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: Color(0xFF0F172A))),
                                                  if (isCurrentReplacing)
                                                    const Text('Producto seleccionado para reemplazo', style: TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.bold))
                                                  else if (isAlreadyInCart && _isReplaceMode)
                                                    const Text('Ya en la orden (al seleccionar se sumará +1)', style: TextStyle(fontSize: 10, color: Color(0xFF1D4ED8), fontWeight: FontWeight.bold))
                                                  else if (isAlreadyInCart)
                                                    const Text('Ya incluido en la orden', style: TextStyle(fontSize: 10, color: Color(0xFFD97706), fontWeight: FontWeight.bold)),
                                                ],
                                              ),
                                            ),
                                            DataCell(
                                              Text(
                                                '\$${p.unitPrice.toStringAsFixed(2)}',
                                                style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, color: Color(0xFF1D4ED8), fontSize: 12),
                                              ),
                                            ),
                                            DataCell(
                                              Center(
                                                child: BadgeWidget(
                                                  label: isOutOfStock
                                                      ? 'Agotado'
                                                      : '${p.unitsInStock} uds.',
                                                  variant: isOutOfStock
                                                      ? BadgeVariant.danger
                                                      : p.unitsInStock <= 5
                                                          ? BadgeVariant.warning
                                                          : BadgeVariant.success,
                                                ),
                                              ),
                                            ),
                                            DataCell(
                                              Center(
                                                child: isCurrentReplacing
                                                    ? OutlinedButton(
                                                        onPressed: null,
                                                        style: OutlinedButton.styleFrom(
                                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                          minimumSize: const Size(90, 30),
                                                        ),
                                                        child: const Text('Producto actual', style: TextStyle(fontSize: 11)),
                                                      )
                                                    : _isReplaceMode && isAlreadyInCart
                                                        ? ElevatedButton.icon(
                                                            onPressed: isOutOfStock ? null : () => _handleSelect(p),
                                                            icon: const Icon(Icons.add, size: 14),
                                                            label: const Text('Sumar +1'),
                                                            style: ElevatedButton.styleFrom(
                                                              backgroundColor: const Color(0xFFD97706),
                                                              foregroundColor: Colors.white,
                                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                              minimumSize: const Size(90, 30),
                                                              textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                                            ),
                                                          )
                                                        : _isReplaceMode
                                                            ? ElevatedButton.icon(
                                                                onPressed: isOutOfStock ? null : () => _handleSelect(p),
                                                                icon: const Icon(Icons.swap_horiz, size: 14),
                                                                label: const Text('Reemplazar'),
                                                                style: ElevatedButton.styleFrom(
                                                                  backgroundColor: const Color(0xFF2563EB),
                                                                  foregroundColor: Colors.white,
                                                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                                  minimumSize: const Size(90, 30),
                                                                  textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                                                ),
                                                              )
                                                            : isAlreadyInCart
                                                                ? Container(
                                                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                                    decoration: BoxDecoration(
                                                                      color: const Color(0xFFFEF3C7),
                                                                      borderRadius: BorderRadius.circular(6),
                                                                    ),
                                                                    child: Row(
                                                                      mainAxisSize: MainAxisSize.min,
                                                                      children: const [
                                                                        Icon(Icons.check, size: 13, color: Color(0xFFD97706)),
                                                                        SizedBox(width: 4),
                                                                        Text(
                                                                          'Agregado',
                                                                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFB45309)),
                                                                        ),
                                                                      ],
                                                                    ),
                                                                  )
                                                                : ElevatedButton.icon(
                                                                    onPressed: isOutOfStock ? null : () => _handleSelect(p),
                                                                    icon: const Icon(Icons.add, size: 14),
                                                                    label: const Text('Agregar'),
                                                                    style: ElevatedButton.styleFrom(
                                                                      backgroundColor: const Color(0xFF2563EB),
                                                                      foregroundColor: Colors.white,
                                                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                                      minimumSize: const Size(80, 30),
                                                                      textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                                                    ),
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
              ),

              // Pagination & Footer
              Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Mostrando ${_filteredProducts.length} de $_totalCount productos',
                      style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                    ),
                    OutlinedButton(
                      onPressed: () => Navigator.of(context).pop(),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      ),
                      child: const Text('Cerrar Catálogo', style: TextStyle(fontSize: 12)),
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
                  _loadProducts();
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
