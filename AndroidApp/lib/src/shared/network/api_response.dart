/// Đối tượng bọc phản hồi (Response Envelope) chuẩn từ API của Backend.
/// Cung cấp cờ trạng thái `success`, thông điệp `message` và dữ liệu thực tế `data`.
class ApiResponse<T> {
  final bool success;
  final String message;
  final T? data;

  ApiResponse({required this.success, required this.message, this.data});

  /// Chuyển đổi từ dữ liệu JSON thô nhận từ Backend.
  /// Nhận vào hàm `fromJsonT` để phân tích dữ liệu động `data`.
  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json)? fromJsonT,
  ) {
    return ApiResponse<T>(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: (json['data'] != null && fromJsonT != null)
          ? fromJsonT(json['data'])
          : null,
    );
  }

  /// Khởi tạo nhanh đối tượng phản hồi lỗi.
  factory ApiResponse.error(String message) {
    return ApiResponse<T>(success: false, message: message, data: null);
  }
}

/// Đối tượng bọc kết quả phân trang chuẩn từ API Backend.
class PagedResult<T> {
  final List<T> items;
  final int totalCount;
  final int pageNumber;
  final int pageSize;
  final int totalPages;
  final bool hasPreviousPage;
  final bool hasNextPage;

  PagedResult({
    required this.items,
    required this.totalCount,
    required this.pageNumber,
    required this.pageSize,
    required this.totalPages,
    required this.hasPreviousPage,
    required this.hasNextPage,
  });

  /// Chuyển đổi từ JSON thô nhận từ API Backend của đối tượng phân trang.
  factory PagedResult.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) fromJsonT,
  ) {
    final rawItems = json['items'] as List<dynamic>? ?? [];
    final itemsList = rawItems.map((item) => fromJsonT(item)).toList();

    return PagedResult<T>(
      items: itemsList,
      totalCount: json['totalCount'] as int? ?? 0,
      pageNumber: json['pageNumber'] as int? ?? 1,
      pageSize: json['pageSize'] as int? ?? 10,
      totalPages: json['totalPages'] as int? ?? 0,
      hasPreviousPage: json['hasPreviousPage'] as bool? ?? false,
      hasNextPage: json['hasNextPage'] as bool? ?? false,
    );
  }
}
