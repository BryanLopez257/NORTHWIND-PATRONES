import 'package:flutter_test/flutter_test.dart';
import 'package:northwind/1. Enterprise Business Rules/enterprise_business_rules.dart';
import 'package:northwind/4. Frameworks And Drivers/utils/invoice_pdf_service.dart';

void main() {
  group('InvoicePdfService Tests', () {
    final sampleInvoice = InvoiceResponseDto(
      id: 10248,
      invoiceNumber: 'FAC-10248',
      createdDate: DateTime(2026, 10, 26, 14, 30),
      customerId: 'ALFKI',
      customerName: 'Alfreds Futterkiste',
      customerDocument: '1790011674001',
      customerAddress: 'Av. Amazonas N24-196 y Colon',
      customerPhone: '0991234567',
      customerEmail: 'alfreds@northwind.com',
      sellerFullName: 'Carlos Vendedor',
      subTotal: 100.0,
      tax: 15.0,
      total: 115.0,
      details: [
        InvoiceDetailDto(
          id: 1,
          invoiceId: 10248,
          productId: 1,
          productName: 'Chai Tea',
          unitPrice: 10.0,
          quantity: 5,
        ),
        InvoiceDetailDto(
          id: 2,
          invoiceId: 10248,
          productId: 2,
          productName: 'Chang Beer',
          unitPrice: 25.0,
          quantity: 2,
        ),
      ],
    );

    test('generates valid non-empty PDF bytes', () async {
      final pdfBytes = await InvoicePdfService.generateInvoicePdf(sampleInvoice);
      expect(pdfBytes, isNotNull);
      expect(pdfBytes.isNotEmpty, isTrue);
      // Valid PDF headers always start with "%PDF-"
      final header = String.fromCharCodes(pdfBytes.sublist(0, 5));
      expect(header, equals('%PDF-'));
    });
  });
}
