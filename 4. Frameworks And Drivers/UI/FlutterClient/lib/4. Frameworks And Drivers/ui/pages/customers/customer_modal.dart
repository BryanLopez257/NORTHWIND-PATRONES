import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../../../1. Enterprise Business Rules/enterprise_business_rules.dart';
import '../../../../3. Interface Adapters/state_providers/customers_provider.dart';
import '../../../utils/input_filters.dart';

class CustomerModal extends StatefulWidget {
  final CustomerDto? customer; // If null -> Create mode, otherwise Update mode

  const CustomerModal({super.key, this.customer});

  @override
  State<CustomerModal> createState() => _CustomerModalState();
}

class _CustomerModalState extends State<CustomerModal> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _idController;
  late TextEditingController _docController;
  late TextEditingController _firstNameController;
  late TextEditingController _secondNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _secondLastNameController;
  late TextEditingController _businessNameController;
  late TextEditingController _tradeNameController;

  int _customerType = 1; // 1 = Persona Natural, 2 = Empresa
  bool _isSaving = false;
  String? _serverError;

  bool get _isEditMode => widget.customer != null;

  @override
  void initState() {
    super.initState();
    final c = widget.customer;
    _customerType = c != null ? c.customerType : 1;

    _idController = TextEditingController(text: c?.id ?? '');
    _docController = TextEditingController(text: c?.identification ?? '');
    _firstNameController = TextEditingController(text: c?.firstName ?? '');
    _secondNameController = TextEditingController(text: c?.secondName ?? '');
    _lastNameController = TextEditingController(text: c?.lastName ?? '');
    _secondLastNameController = TextEditingController(text: c?.secondLastName ?? '');
    _businessNameController = TextEditingController(text: c?.businessName ?? '');
    _tradeNameController = TextEditingController(text: c?.tradeName ?? '');
  }

  @override
  void dispose() {
    _idController.dispose();
    _docController.dispose();
    _firstNameController.dispose();
    _secondNameController.dispose();
    _lastNameController.dispose();
    _secondLastNameController.dispose();
    _businessNameController.dispose();
    _tradeNameController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    setState(() => _serverError = null);

    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() => _isSaving = true);

    final provider = context.read<CustomersProvider>();

    try {
      if (_isEditMode) {
        final dto = UpdateCustomerDto(
          id: _idController.text.trim().toUpperCase(),
          identification: _docController.text.trim(),
          customerType: _customerType,
          firstName: _customerType == 1 && _firstNameController.text.trim().isNotEmpty
              ? _firstNameController.text.trim()
              : null,
          secondName: _customerType == 1 && _secondNameController.text.trim().isNotEmpty
              ? _secondNameController.text.trim()
              : null,
          lastName: _customerType == 1 && _lastNameController.text.trim().isNotEmpty
              ? _lastNameController.text.trim()
              : null,
          secondLastName: _customerType == 1 && _secondLastNameController.text.trim().isNotEmpty
              ? _secondLastNameController.text.trim()
              : null,
          businessName: _customerType == 2 && _businessNameController.text.trim().isNotEmpty
              ? _businessNameController.text.trim()
              : null,
          tradeName: _tradeNameController.text.trim().isNotEmpty
              ? _tradeNameController.text.trim()
              : null,
        );

        await provider.updateCustomer(dto);
      } else {
        final dto = CreateCustomerDto(
          id: _idController.text.trim().toUpperCase(),
          identification: _docController.text.trim(),
          customerType: _customerType,
          firstName: _customerType == 1 && _firstNameController.text.trim().isNotEmpty
              ? _firstNameController.text.trim()
              : null,
          secondName: _customerType == 1 && _secondNameController.text.trim().isNotEmpty
              ? _secondNameController.text.trim()
              : null,
          lastName: _customerType == 1 && _lastNameController.text.trim().isNotEmpty
              ? _lastNameController.text.trim()
              : null,
          secondLastName: _customerType == 1 && _secondLastNameController.text.trim().isNotEmpty
              ? _secondLastNameController.text.trim()
              : null,
          businessName: _customerType == 2 && _businessNameController.text.trim().isNotEmpty
              ? _businessNameController.text.trim()
              : null,
          tradeName: _tradeNameController.text.trim().isNotEmpty
              ? _tradeNameController.text.trim()
              : null,
        );

        await provider.createCustomer(dto);
      }

      if (mounted) {
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      setState(() {
        _isSaving = false;
        _serverError = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isPersonaNatural = _customerType == 1;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      backgroundColor: Colors.white,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 600),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      _isEditMode ? 'Editar Cliente' : 'Nuevo Cliente',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Color(0xFF64748B)),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ],
                ),
                const Divider(height: 20, color: Color(0xFFE2E8F0)),

                // Server Error Banner
                if (_serverError != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
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
                            _serverError!,
                            style: const TextStyle(color: Color(0xFF9F1239), fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Customer Type Selector
                Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: () => setState(() => _customerType = 1),
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: isPersonaNatural ? const Color(0xFFEFF6FF) : const Color(0xFFF8FAFC),
                            border: Border.all(
                              color: isPersonaNatural ? const Color(0xFF2563EB) : const Color(0xFFE2E8F0),
                              width: isPersonaNatural ? 1.5 : 1,
                            ),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.person_outline,
                                size: 18,
                                color: isPersonaNatural ? const Color(0xFF2563EB) : const Color(0xFF64748B),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'Persona Natural',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: isPersonaNatural ? FontWeight.bold : FontWeight.w500,
                                  color: isPersonaNatural ? const Color(0xFF2563EB) : const Color(0xFF64748B),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: InkWell(
                        onTap: () => setState(() => _customerType = 2),
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: !isPersonaNatural ? const Color(0xFFEFF6FF) : const Color(0xFFF8FAFC),
                            border: Border.all(
                              color: !isPersonaNatural ? const Color(0xFF2563EB) : const Color(0xFFE2E8F0),
                              width: !isPersonaNatural ? 1.5 : 1,
                            ),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.business_outlined,
                                size: 18,
                                color: !isPersonaNatural ? const Color(0xFF2563EB) : const Color(0xFF64748B),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'Empresa / Jurídica',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: !isPersonaNatural ? FontWeight.bold : FontWeight.w500,
                                  color: !isPersonaNatural ? const Color(0xFF2563EB) : const Color(0xFF64748B),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // ID Code & Document
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: _buildField(
                        label: 'Código ID (5 Letras) *',
                        controller: _idController,
                        hint: 'Ej. ALFKI',
                        maxLength: 5,
                        readOnly: _isEditMode,
                        formatters: [InputFilters.alphaOnly, InputFilters.upperCase],
                        validator: (val) {
                          final clean = val?.trim() ?? '';
                          if (clean.length != 5) {
                            return 'Debe tener exactamente 5 letras mayúsculas.';
                          }
                          return null;
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildField(
                        label: isPersonaNatural ? 'Cédula o RUC (10/13 dígitos) *' : 'RUC Empresa (13 dígitos) *',
                        controller: _docController,
                        hint: isPersonaNatural ? 'Ej. 0102030400' : 'Ej. 1790011674001',
                        maxLength: 13,
                        formatters: [InputFilters.digitsOnly],
                        validator: (val) {
                          final clean = val?.trim() ?? '';
                          if (clean.isEmpty) return 'El documento es requerido.';
                          if (!isPersonaNatural && clean.length != 13) {
                            return 'Una Empresa exige RUC de 13 dígitos.';
                          }
                          final res = EcuadorianIdValidator.validateEcuadorianId(clean);
                          if (!res.isValid) {
                            return res.error ?? 'Identificación inválida.';
                          }
                          return null;
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Fields based on Type
                if (isPersonaNatural) ...[
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: _buildField(
                          label: 'Primer Nombre *',
                          controller: _firstNameController,
                          hint: 'Ej. María',
                          maxLength: 50,
                          formatters: [InputFilters.lettersAndSpaces],
                          validator: (val) {
                            final clean = val?.trim() ?? '';
                            if (clean.isEmpty) return 'Requerido';
                            if (clean.length < 3) return 'Mín 3 letras';
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildField(
                          label: 'Segundo Nombre',
                          controller: _secondNameController,
                          hint: 'Ej. Elena',
                          maxLength: 50,
                          formatters: [InputFilters.lettersAndSpaces],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: _buildField(
                          label: 'Primer Apellido *',
                          controller: _lastNameController,
                          hint: 'Ej. Anders',
                          maxLength: 50,
                          formatters: [InputFilters.lettersAndSpaces],
                          validator: (val) {
                            final clean = val?.trim() ?? '';
                            if (clean.isEmpty) return 'Requerido';
                            if (clean.length < 3) return 'Mín 3 letras';
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildField(
                          label: 'Segundo Apellido',
                          controller: _secondLastNameController,
                          hint: 'Ej. Schmidt',
                          maxLength: 50,
                          formatters: [InputFilters.lettersAndSpaces],
                        ),
                      ),
                    ],
                  ),
                ] else ...[
                  _buildField(
                    label: 'Razón Social de la Empresa *',
                    controller: _businessNameController,
                    hint: 'Ej. Alfreds Futterkiste S.A.',
                    maxLength: 150,
                    validator: (val) {
                      final clean = val?.trim() ?? '';
                      if (clean.isEmpty) return 'La razón social es requerida.';
                      if (clean.length < 3) return 'Mínimo 3 caracteres.';
                      return null;
                    },
                  ),
                ],
                const SizedBox(height: 14),

                // Trade Name (Nombre Comercial)
                _buildField(
                  label: 'Nombre Comercial (Opcional)',
                  controller: _tradeNameController,
                  hint: 'Ej. Taquería El Paso',
                  maxLength: 150,
                ),
                const SizedBox(height: 24),

                // Actions
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    OutlinedButton(
                      onPressed: _isSaving ? null : () => Navigator.of(context).pop(),
                      child: const Text('Cancelar'),
                    ),
                    const SizedBox(width: 10),
                    ElevatedButton.icon(
                      onPressed: _isSaving ? null : _handleSubmit,
                      icon: _isSaving
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.save_outlined, size: 16),
                      label: Text(_isSaving ? 'Guardando...' : (_isEditMode ? 'Actualizar' : 'Crear Cliente')),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        foregroundColor: Colors.white,
                      ),
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

  Widget _buildField({
    required String label,
    required TextEditingController controller,
    String? hint,
    int? maxLength,
    bool readOnly = false,
    List<TextInputFormatter>? formatters,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF475569)),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          maxLength: maxLength,
          readOnly: readOnly,
          inputFormatters: formatters,
          decoration: InputDecoration(
            counterText: '',
            hintText: hint,
            fillColor: readOnly ? const Color(0xFFF1F5F9) : Colors.white,
            filled: true,
          ),
          validator: validator,
        ),
      ],
    );
  }
}
