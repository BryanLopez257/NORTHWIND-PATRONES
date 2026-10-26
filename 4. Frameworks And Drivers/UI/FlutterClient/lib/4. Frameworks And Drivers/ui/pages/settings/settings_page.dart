import 'package:flutter/material.dart';
import '../../../config/api_config.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  final TextEditingController _urlController = TextEditingController();
  String? _statusMessage;
  bool _isSuccess = false;

  @override
  void initState() {
    super.initState();
    _urlController.text = ApiConfig.baseUrl;
  }

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    final clean = _urlController.text.trim();
    if (clean.isEmpty) {
      setState(() {
        _statusMessage = 'La URL del servidor no puede estar vacía.';
        _isSuccess = false;
      });
      return;
    }

    final uri = Uri.tryParse(clean);
    if (uri == null || (!clean.startsWith('http://') && !clean.startsWith('https://'))) {
      setState(() {
        _statusMessage =
            'Por favor ingrese una URL válida (ej: http://localhost:5000 o https://api.midominio.com).';
        _isSuccess = false;
      });
      return;
    }

    await ApiConfig.setBaseUrl(clean);
    setState(() {
      _urlController.text = ApiConfig.baseUrl;
      _statusMessage = 'URL del servidor NorthWind WebApi guardada exitosamente: ${ApiConfig.baseUrl}';
      _isSuccess = true;
    });
  }

  Future<void> _handleReset() async {
    await ApiConfig.resetToDefault();
    setState(() {
      _urlController.text = ApiConfig.baseUrl;
      _statusMessage = 'Restablecido al valor por defecto: ${ApiConfig.baseUrl}';
      _isSuccess = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 680),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFDBEAFE),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.settings, color: Color(0xFF2563EB), size: 24),
                    ),
                    const SizedBox(width: 14),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'Configuración del Sistema',
                          style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Ajusta los parámetros de conexión y comportamiento de la aplicación cliente.',
                          style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Card
                Card(
                  elevation: 0,
                  color: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          children: const [
                            Icon(Icons.dns_outlined, color: Color(0xFF2563EB), size: 20),
                            SizedBox(width: 8),
                            Text(
                              'Conexión con NorthWind WebApi',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Permite cambiar la URL Base del backend ASP.NET Core y guardarla en almacenamiento persistente.',
                          style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                        ),
                        const Divider(height: 28, color: Color(0xFFF1F5F9)),

                        // Status message banner
                        if (_statusMessage != null) ...[
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: _isSuccess ? const Color(0xFFECFDF5) : const Color(0xFFFFF1F2),
                              border: Border.all(
                                color: _isSuccess ? const Color(0xFFA7F3D0) : const Color(0xFFFECDD3),
                              ),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  _isSuccess ? Icons.check_circle_outline : Icons.error_outline,
                                  color: _isSuccess ? const Color(0xFF059669) : const Color(0xFFE11D48),
                                  size: 18,
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    _statusMessage!,
                                    style: TextStyle(
                                      color: _isSuccess ? const Color(0xFF065F46) : const Color(0xFF9F1239),
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],

                        // Input field
                        const Text(
                          'URL BASE DE LA API (BACKEND)',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                        ),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _urlController,
                          decoration: InputDecoration(
                            hintText: 'http://localhost:5000',
                            hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                            isDense: true,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          style: const TextStyle(fontFamily: 'monospace', fontSize: 13),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Valor por defecto: ${ApiConfig.defaultBaseUrl}',
                          style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontFamily: 'monospace'),
                        ),
                        const SizedBox(height: 24),

                        // Action buttons
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            OutlinedButton.icon(
                              onPressed: _handleReset,
                              icon: const Icon(Icons.refresh, size: 16),
                              label: const Text('Restablecer por Defecto'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: const Color(0xFF475569),
                                side: const BorderSide(color: Color(0xFFCBD5E1)),
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                              ),
                            ),
                            ElevatedButton.icon(
                              onPressed: _handleSave,
                              icon: const Icon(Icons.save_outlined, size: 16),
                              label: const Text('Guardar Configuración'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF2563EB),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
