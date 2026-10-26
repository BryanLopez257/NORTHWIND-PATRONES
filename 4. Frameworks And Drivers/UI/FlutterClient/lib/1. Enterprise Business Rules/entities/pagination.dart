class PagedResult<T> {
  final List<T> items;
  final int totalCount;
  final int pageNumber;
  final int pageSize;
  final int totalPages;
  final bool hasPreviousPage;
  final bool hasNextPage;

  const PagedResult({
    required this.items,
    required this.totalCount,
    required this.pageNumber,
    required this.pageSize,
    required this.totalPages,
    required this.hasPreviousPage,
    required this.hasNextPage,
  });

  factory PagedResult.empty({int pageNumber = 1, int pageSize = 10}) {
    return PagedResult<T>(
      items: const [],
      totalCount: 0,
      pageNumber: pageNumber,
      pageSize: pageSize,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    );
  }

  factory PagedResult.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic item) fromJsonT,
  ) {
    final rawItems = json['items'] ?? json['data'] ?? [];
    final itemsList = (rawItems as List).map(fromJsonT).toList();
    final totalCount = (json['totalCount'] ?? json['total'] ?? itemsList.length) as int;
    final pageNumber = (json['pageNumber'] ?? json['page'] ?? 1) as int;
    final pageSize = (json['pageSize'] ?? 10) as int;
    final totalPages = (json['totalPages'] ?? ((totalCount / (pageSize > 0 ? pageSize : 1)).ceil())) as int;

    return PagedResult<T>(
      items: itemsList,
      totalCount: totalCount,
      pageNumber: pageNumber,
      pageSize: pageSize,
      totalPages: totalPages > 0 ? totalPages : 1,
      hasPreviousPage: (json['hasPreviousPage'] ?? (pageNumber > 1)) as bool,
      hasNextPage: (json['hasNextPage'] ?? (pageNumber < totalPages)) as bool,
    );
  }
}
