import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../../../1. Enterprise Business Rules/enterprise_business_rules.dart';
import '../../../../3. Interface Adapters/state_providers/auth_provider.dart';
import '../../../utils/input_filters.dart';
import '../../components/password_strength_indicator.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();

  final _firstNameController = TextEditingController();
  final _secondNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _secondLastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _isLoading = false;
  String? _serverError;

  @override
  void dispose() {
    _firstNameController.dispose();
    _secondNameController.dispose();
    _lastNameController.dispose();
    _secondLastNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    setState(() => _serverError = null);

    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() => _isLoading = true);

    final dto = UserRegistrationDto(
      firstName: _firstNameController.text.trim(),
      secondName: _secondNameController.text.trim().isNotEmpty ? _secondNameController.text.trim() : null,
      lastName: _lastNameController.text.trim(),
      secondLastName: _secondLastNameController.text.trim().isNotEmpty ? _secondLastNameController.text.trim() : null,
      email: _emailController.text.trim().toLowerCase(),
      password: _passwordController.text,
    );

    final auth = context.read<AuthProvider>();
    final success = await auth.register(dto);

    if (!mounted) return;

    if (success) {
      Navigator.pushReplacementNamed(
        context,
        '/login',
        arguments: {'registered': true},
      );
    } else {
      setState(() {
        _isLoading = false;
        _serverError = auth.errorMessage ?? 'No fue posible registrar la cuenta. Por favor intente nuevamente.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFFF1F5F9), // slate-100
              Color(0xFFEFF6FF), // blue-50
              Color(0xFFE2E8F0), // slate-200
            ],
          ),
        ),
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: constraints.maxHeight,
                  minWidth: constraints.maxWidth,
                ),
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 480),
                      child: Card(
                elevation: 4,
                shadowColor: Colors.black.withValues(alpha: 0.08),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                color: Colors.white,
                child: Padding(
                  padding: const EdgeInsets.all(32.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Header
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF2563EB),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF2563EB).withValues(alpha: 0.3),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.person_add_rounded,
                          color: Colors.white,
                          size: 32,
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Crear cuenta nueva',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0F172A),
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Ingrese sus datos para registrarse en el sistema',
                        style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 24),

                      // Server Error Alert Banner
                      if (_serverError != null) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF2F2),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFFFECACA)),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.error_outline_rounded, color: Color(0xFFDC2626), size: 18),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _serverError!,
                                  style: const TextStyle(fontSize: 13, color: Color(0xFF991B1B)),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Form
                      Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Nombres (First & Second Name)
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  child: _buildTextField(
                                    label: 'Primer nombre *',
                                    controller: _firstNameController,
                                    hintText: 'Ej. Juan',
                                    maxLength: 30,
                                    formatters: [InputFilters.lettersAndSpaces],
                                    validator: (val) {
                                      final clean = val?.trim() ?? '';
                                      if (clean.isEmpty) return 'Requerido';
                                      if (clean.length < 2) return 'Mín 2 letras';
                                      if (clean.length > 30) return 'Máx 30 letras';
                                      return null;
                                    },
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: _buildTextField(
                                    label: 'Segundo nombre',
                                    controller: _secondNameController,
                                    hintText: 'Ej. Carlos',
                                    maxLength: 30,
                                    formatters: [InputFilters.lettersAndSpaces],
                                    validator: (val) {
                                      final clean = val?.trim() ?? '';
                                      if (clean.isNotEmpty && clean.length < 2) {
                                        return 'Mín 2 letras';
                                      }
                                      if (clean.isNotEmpty && clean.length > 30) {
                                        return 'Máx 30 letras';
                                      }
                                      return null;
                                    },
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 14),

                            // Apellidos (Last & Second Last Name)
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  child: _buildTextField(
                                    label: 'Primer apellido *',
                                    controller: _lastNameController,
                                    hintText: 'Ej. Pérez',
                                    maxLength: 30,
                                    formatters: [InputFilters.lettersAndSpaces],
                                    validator: (val) {
                                      final clean = val?.trim() ?? '';
                                      if (clean.isEmpty) return 'Requerido';
                                      if (clean.length < 2) return 'Mín 2 letras';
                                      if (clean.length > 30) return 'Máx 30 letras';
                                      return null;
                                    },
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: _buildTextField(
                                    label: 'Segundo apellido',
                                    controller: _secondLastNameController,
                                    hintText: 'Ej. Gómez',
                                    maxLength: 30,
                                    formatters: [InputFilters.lettersAndSpaces],
                                    validator: (val) {
                                      final clean = val?.trim() ?? '';
                                      if (clean.isNotEmpty && clean.length < 2) {
                                        return 'Mín 2 letras';
                                      }
                                      if (clean.isNotEmpty && clean.length > 30) {
                                        return 'Máx 30 letras';
                                      }
                                      return null;
                                    },
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 14),

                            // Email
                            _buildTextField(
                              label: 'Correo electrónico *',
                              controller: _emailController,
                              hintText: 'tu@email.com',
                              keyboardType: TextInputType.emailAddress,
                              maxLength: 254,
                              formatters: [
                                InputFilters.noWhitespace,
                                InputFilters.email,
                              ],
                              validator: (val) {
                                final clean = val?.trim() ?? '';
                                if (clean.isEmpty) return 'El correo es requerido.';
                                if (clean.length > 254) return 'Máximo 254 caracteres.';
                                final emailRegex = RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
                                if (!emailRegex.hasMatch(clean)) {
                                  return 'Ingrese un formato de correo válido.';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 14),

                            // Password
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Contraseña *',
                                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
                                ),
                                const SizedBox(height: 6),
                                TextFormField(
                                  controller: _passwordController,
                                  obscureText: _obscurePassword,
                                  maxLength: 100,
                                  inputFormatters: [
                                    InputFilters.noWhitespace,
                                    InputFilters.rejectEmojis,
                                  ],
                                  onChanged: (_) => setState(() {}),
                                  decoration: InputDecoration(
                                    counterText: '',
                                    hintText: '••••••••',
                                    prefixIcon: const Icon(Icons.lock_outline_rounded, size: 18, color: Color(0xFF94A3B8)),
                                    suffixIcon: IconButton(
                                      icon: Icon(
                                        _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                                        size: 18,
                                        color: const Color(0xFF94A3B8),
                                      ),
                                      onPressed: () {
                                        setState(() => _obscurePassword = !_obscurePassword);
                                      },
                                    ),
                                  ),
                                  validator: (val) {
                                    if (val == null || val.isEmpty) {
                                      return 'La contraseña es requerida.';
                                    }
                                    if (val.length < 6) {
                                      return 'Se requiere al menos 6 caracteres.';
                                    }
                                    if (val.length > 100) {
                                      return 'Máximo 100 caracteres.';
                                    }
                                    if (val.contains(' ')) {
                                      return 'No se permiten espacios.';
                                    }
                                    if (!RegExp(r'[A-Z]').hasMatch(val)) {
                                      return 'Requiere al menos una mayúscula.';
                                    }
                                    if (!RegExp(r'[0-9]').hasMatch(val)) {
                                      return 'Requiere al menos un número.';
                                    }
                                    if (!RegExp(r'[^a-zA-Z0-9\s]').hasMatch(val)) {
                                      return 'Requiere al menos un símbolo especial (!@#\$).';
                                    }
                                    return null;
                                  },
                                ),
                                PasswordStrengthIndicator(password: _passwordController.text),
                              ],
                            ),
                            const SizedBox(height: 14),

                            // Confirmar Contraseña
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Confirmar contraseña *',
                                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
                                ),
                                const SizedBox(height: 6),
                                TextFormField(
                                  controller: _confirmPasswordController,
                                  obscureText: _obscureConfirmPassword,
                                  maxLength: 100,
                                  inputFormatters: [
                                    InputFilters.noWhitespace,
                                    InputFilters.rejectEmojis,
                                  ],
                                  decoration: InputDecoration(
                                    counterText: '',
                                    hintText: 'Repite la contraseña',
                                    prefixIcon: const Icon(Icons.lock_outline_rounded, size: 18, color: Color(0xFF94A3B8)),
                                    suffixIcon: IconButton(
                                      icon: Icon(
                                        _obscureConfirmPassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                                        size: 18,
                                        color: const Color(0xFF94A3B8),
                                      ),
                                      onPressed: () {
                                        setState(() => _obscureConfirmPassword = !_obscureConfirmPassword);
                                      },
                                    ),
                                  ),
                                  validator: (val) {
                                    if (val == null || val.isEmpty) {
                                      return 'La confirmación de contraseña es requerida.';
                                    }
                                    if (val != _passwordController.text) {
                                      return 'Las contraseñas no coinciden.';
                                    }
                                    return null;
                                  },
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),

                            // Submit Button
                            ElevatedButton(
                              onPressed: _isLoading ? null : _handleSubmit,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF2563EB),
                                disabledBackgroundColor: const Color(0xFF93C5FD),
                                foregroundColor: Colors.white,
                                minimumSize: const Size.fromHeight(44),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                elevation: 0,
                              ),
                              child: _isLoading
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                    )
                                  : const Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Icon(Icons.person_add_rounded, size: 18),
                                        SizedBox(width: 8),
                                        Text(
                                          'Registrar Usuario',
                                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                                        ),
                                      ],
                                    ),
                            ),
                            const SizedBox(height: 20),

                            // Login Redirection
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Text(
                                  '¿Ya tienes una cuenta? ',
                                  style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                                ),
                                GestureDetector(
                                  onTap: () {
                                    Navigator.pushReplacementNamed(context, '/login');
                                  },
                                  child: const Text(
                                    'Inicia sesión aquí',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF2563EB),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  },
),
),
);
}

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    String? hintText,
    int? maxLength,
    TextInputType? keyboardType,
    List<TextInputFormatter>? formatters,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          maxLength: maxLength,
          keyboardType: keyboardType,
          inputFormatters: formatters,
          decoration: InputDecoration(
            counterText: '',
            hintText: hintText,
          ),
          validator: validator,
        ),
      ],
    );
  }
}
