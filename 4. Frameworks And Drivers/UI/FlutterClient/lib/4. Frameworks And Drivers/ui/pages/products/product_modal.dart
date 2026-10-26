import 'package:flutter/material.dart';
import '../../../../1. Enterprise Business Rules/enterprise_business_rules.dart';
import '../../../utils/input_filters.dart';

class ProductModal extends StatefulWidget {
  final ProductDto? productToEdit;

  const ProductModal({super.key, this.productToEdit});

  @override
  State<ProductModal> createState() => _ProductModalState();
}

class _ProductModalState extends State<ProductModal> {
  final _formKey = GlobalKey<FormState>();

  final _nameController = TextEditingController();
  final _unitPriceController = TextEditingController();
  final _unitsInStockController = TextEditingController();

  bool get isEdit => widget.productToEdit != null;

  @override
  void initState() {
    super.initState();
    final p = widget.productToEdit;
    if (p != null) {
      _nameController.text = p.name;
      _unitPriceController.text = p.unitPrice.toStringAsFixed(2);
      _unitsInStockController.text = p.unitsInStock.toString();
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _unitPriceController.dispose();
    _unitsInStockController.dispose();
    super.dispose();
  }

  void _handleSubmit() {
    if (!_formKey.currentState!.validate()) return;

    final name = _nameController.text.trim();
    final unitPrice = double.parse(_unitPriceController.text.trim());
    final unitsInStock = int.parse(_unitsInStockController.text.trim());

    if (isEdit) {
      final updateDto = UpdateProductDto(
        id: widget.productToEdit!.id,
        name: name,
        unitPrice: unitPrice,
        unitsInStock: unitsInStock,
      );
      Navigator.pop(context, updateDto);
    } else {
      final createDto = CreateProductDto(
        name: name,
        unitPrice: unitPrice,
        unitsInStock: unitsInStock,
      );
      Navigator.pop(context, createDto);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      backgroundColor: Colors.white,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEFF6FF),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(
                            isEdit ? Icons.edit_rounded : Icons.add_box_rounded,
                            color: const Color(0xFF2563EB),
                            size: 22,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              isEdit ? 'Editar Producto' : 'Nuevo Producto',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                            Text(
                              isEdit ? 'Actualiza precio y existencia' : 'Registra un producto en el catálogo',
                              style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                            ),
                          ],
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, size: 20),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Nombre
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Nombre del Producto *',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _nameController,
                      maxLength: 40,
                      inputFormatters: [
                        InputFilters.rejectEmojis,
                      ],
                      decoration: const InputDecoration(
                        counterText: '',
                        hintText: 'Ej: Chai Tea',
                        prefixIcon: Icon(Icons.inventory_2_outlined, size: 18, color: Color(0xFF94A3B8)),
                      ),
                      validator: (val) {
                        final clean = val?.trim() ?? '';
                        if (clean.isEmpty) return 'El nombre del producto es obligatorio.';
                        if (clean.length < 2) return 'Mínimo 2 caracteres.';
                        if (clean.length > 40) return 'Máximo 40 caracteres.';
                        return null;
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Precio Unitario & Unidades en Stock
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Precio Unitario (\$) *',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
                          ),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: _unitPriceController,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            decoration: const InputDecoration(
                              hintText: '0.00',
                              prefixIcon: Icon(Icons.attach_money_rounded, size: 18, color: Color(0xFF94A3B8)),
                            ),
                            validator: (val) {
                              final clean = val?.trim() ?? '';
                              if (clean.isEmpty) return 'Obligatorio';
                              final price = double.tryParse(clean);
                              if (price == null || price <= 0) return 'Precio inválido';
                              return null;
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Stock en Almacén *',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
                          ),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: _unitsInStockController,
                            keyboardType: TextInputType.number,
                            inputFormatters: [InputFilters.digitsOnly],
                            decoration: const InputDecoration(
                              hintText: '0',
                              prefixIcon: Icon(Icons.numbers_rounded, size: 18, color: Color(0xFF94A3B8)),
                            ),
                            validator: (val) {
                              final clean = val?.trim() ?? '';
                              if (clean.isEmpty) return 'Obligatorio';
                              final stock = int.tryParse(clean);
                              if (stock == null || stock < 0) return 'Stock inválido';
                              if (stock > 32767) return 'Máximo 32767';
                              return null;
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Action Buttons
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFFCBD5E1)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancelar', style: TextStyle(color: Color(0xFF334155))),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        elevation: 0,
                      ),
                      onPressed: _handleSubmit,
                      child: Text(isEdit ? 'Guardar Cambios' : 'Registrar Producto'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
