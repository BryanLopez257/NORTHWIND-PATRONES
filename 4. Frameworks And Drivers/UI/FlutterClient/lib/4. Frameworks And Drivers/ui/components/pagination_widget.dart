import 'package:flutter/material.dart';

class PaginationWidget extends StatelessWidget {
  final int pageNumber;
  final int totalPages;
  final int totalCount;
  final int pageSize;
  final ValueChanged<int> onPageChanged;
  final ValueChanged<int>? onPageSizeChanged;
  final List<int> pageSizeOptions;

  const PaginationWidget({
    super.key,
    int? pageNumber,
    int? currentPage,
    required this.totalPages,
    required this.totalCount,
    required this.pageSize,
    required this.onPageChanged,
    this.onPageSizeChanged,
    this.pageSizeOptions = const [5, 10, 20, 50],
  }) : pageNumber = currentPage ?? pageNumber ?? 1;

  @override
  Widget build(BuildContext context) {
    if (totalCount == 0) return const SizedBox.shrink();

    final startItem = ((pageNumber - 1) * pageSize) + 1;
    final endItem = (pageNumber * pageSize).clamp(0, totalCount);

    return LayoutBuilder(
      builder: (context, constraints) {
        final isMobile = constraints.maxWidth < 640;

        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
          ),
          child: isMobile
              ? Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildPageSizeSelector(),
                        Text(
                          '$startItem-$endItem de $totalCount',
                          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    _buildPaginationButtons(),
                  ],
                )
              : Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Text(
                          'Mostrando $startItem a $endItem de $totalCount registros',
                          style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                        ),
                        if (onPageSizeChanged != null) ...[
                          const SizedBox(width: 16),
                          _buildPageSizeSelector(),
                        ],
                      ],
                    ),
                    _buildPaginationButtons(),
                  ],
                ),
        );
      },
    );
  }

  Widget _buildPageSizeSelector() {
    if (onPageSizeChanged == null) return const SizedBox.shrink();

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Text(
          'Mostrar: ',
          style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6),
          decoration: BoxDecoration(
            border: Border.all(color: const Color(0xFFCBD5E1)),
            borderRadius: BorderRadius.circular(6),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<int>(
              value: pageSize,
              isDense: true,
              style: const TextStyle(fontSize: 12, color: Color(0xFF0F172A), fontWeight: FontWeight.w500),
              items: pageSizeOptions.map((size) {
                return DropdownMenuItem<int>(
                  value: size,
                  child: Text('$size'),
                );
              }).toList(),
              onChanged: (val) {
                if (val != null) onPageSizeChanged!(val);
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPaginationButtons() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Botón Anterior
        OutlinedButton.icon(
          onPressed: pageNumber > 1 ? () => onPageChanged(pageNumber - 1) : null,
          icon: const Icon(Icons.chevron_left, size: 16),
          label: const Text('Anterior'),
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            minimumSize: const Size(0, 32),
            textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
            side: const BorderSide(color: Color(0xFFE2E8F0)),
            foregroundColor: const Color(0xFF334155),
          ),
        ),
        const SizedBox(width: 6),

        // Páginas numeradas
        ..._buildPageNumbers(),

        const SizedBox(width: 6),
        // Botón Siguiente
        OutlinedButton(
          onPressed: pageNumber < totalPages ? () => onPageChanged(pageNumber + 1) : null,
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            minimumSize: const Size(0, 32),
            textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
            side: const BorderSide(color: Color(0xFFE2E8F0)),
            foregroundColor: const Color(0xFF334155),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: const [
              Text('Siguiente'),
              SizedBox(width: 2),
              Icon(Icons.chevron_right, size: 16),
            ],
          ),
        ),
      ],
    );
  }

  List<Widget> _buildPageNumbers() {
    final widgets = <Widget>[];
    final pages = _calculateVisiblePages();

    for (int i = 0; i < pages.length; i++) {
      final p = pages[i];
      if (p == -1) {
        widgets.add(
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 4),
            child: Text('...', style: TextStyle(color: Color(0xFF94A3B8))),
          ),
        );
      } else {
        final isSelected = p == pageNumber;
        widgets.add(
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 2),
            child: InkWell(
              onTap: () => onPageChanged(p),
              borderRadius: BorderRadius.circular(6),
              child: Container(
                width: 32,
                height: 32,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFF2563EB) : Colors.transparent,
                  borderRadius: BorderRadius.circular(6),
                  border: isSelected ? null : Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Text(
                  '$p',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    color: isSelected ? Colors.white : const Color(0xFF334155),
                  ),
                ),
              ),
            ),
          ),
        );
      }
    }

    return widgets;
  }

  List<int> _calculateVisiblePages() {
    if (totalPages <= 7) {
      return List.generate(totalPages, (i) => i + 1);
    }

    if (pageNumber <= 4) {
      return [1, 2, 3, 4, 5, -1, totalPages];
    }

    if (pageNumber >= totalPages - 3) {
      return [1, -1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, -1, pageNumber - 1, pageNumber, pageNumber + 1, -1, totalPages];
  }
}
