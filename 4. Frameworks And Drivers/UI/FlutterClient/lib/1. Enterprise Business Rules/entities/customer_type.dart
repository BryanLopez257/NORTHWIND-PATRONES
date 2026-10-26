enum CustomerType {
  personaNatural(1, 'Persona Natural'),
  empresa(2, 'Empresa');

  final int value;
  final String label;

  const CustomerType(this.value, this.label);

  static CustomerType fromValue(dynamic val) {
    if (val == 2 || val == '2' || val == 'Empresa') {
      return CustomerType.empresa;
    }
    return CustomerType.personaNatural;
  }
}
