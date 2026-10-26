class Endpoints {
  // Auth
  static const String login = '/user/Login';
  static const String register = '/user/Register';
  static const String refreshToken = '/user/refreshtoken';

  // Orders
  static const String createOrder = '/CreateOrder';

  // Customers
  static const String customers = '/customers';
  static const String createCustomer = '/customers';
  static const String updateCustomer = '/customers';
  static const String deleteCustomer = '/customers';
  static String customerById(String id) => '/customers/$id';

  // Products
  static const String products = '/products';
  static const String createProduct = '/products';
  static const String updateProduct = '/products';
  static const String deleteProduct = '/products';
  static String productById(int id) => '/products/$id';

  // Invoices
  static const String invoices = '/invoices';
  static String invoiceById(int id) => '/invoices/$id';
}
