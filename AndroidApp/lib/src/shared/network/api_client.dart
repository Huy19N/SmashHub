import 'dart:io';
import 'package:dio/dio.dart';
import 'package:dio/io.dart';

/// Client API dùng để gửi các yêu cầu HTTP đến Backend.
/// Được cấu hình với interceptor để xử lý Authentication, Cookie (Refresh Token) và xử lý lỗi tập trung.
class ApiClient {
  late final Dio _dio;
  
  // URL cấu hình mặc định (dùng 10.0.2.2 cho giả lập Android để trỏ về localhost của máy host với HTTPS)
  static const String _defaultBaseUrl = 'https://10.0.2.2:7020';
  
  // Lưu trữ Token & Cookie tạm thời trong bộ nhớ (Có thể tích hợp SharedPreferences / FlutterSecureStorage sau này)
  static String? _accessToken;
  static String? _refreshTokenCookie;

  ApiClient({String? baseUrl}) {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl ?? _defaultBaseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        sendTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Bỏ qua lỗi chứng chỉ SSL tự ký khi chạy qua HTTPS ở môi trường dev
    _dio.httpClientAdapter = IOHttpClientAdapter(
      createHttpClient: () {
        final client = HttpClient();
        client.badCertificateCallback = (X509Certificate cert, String host, int port) => true;
        return client;
      },
    );

    // Thêm các interceptor để tự động hóa công việc
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          // 1. Tự động thêm Access Token vào header Authorization dưới dạng Bearer Token
          if (_accessToken != null && _accessToken!.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $_accessToken';
          }

          // 2. Tự động thêm Cookie Refresh Token vào nếu có (Hỗ trợ cơ chế Cookie-based Auth của Backend)
          if (_refreshTokenCookie != null && _refreshTokenCookie!.isNotEmpty) {
            options.headers['Cookie'] = _refreshTokenCookie;
          }

          return handler.next(options);
        },
        onResponse: (response, handler) {
          // 3. Đọc và lưu trữ Refresh Token từ Set-Cookie trong response của Backend
          final setCookieHeaders = response.headers['set-cookie'];
          if (setCookieHeaders != null) {
            for (var header in setCookieHeaders) {
              if (header.contains('refreshToken=')) {
                // Tách lấy giá trị refreshToken cookie và lưu lại
                final parts = header.split(';');
                if (parts.isNotEmpty) {
                  _refreshTokenCookie = parts[0];
                }
              }
            }
          }
          return handler.next(response);
        },
        onError: (error, handler) async {
          // 4. Xử lý lỗi tự động làm mới Token (Refresh Token) khi gặp lỗi 401 Unauthorized
          if (error.response?.statusCode == 401) {
            final options = error.requestOptions;
            
            // Tránh lặp vô hạn nếu chính request refresh-token bị lỗi 401
            if (options.path.contains('api/auth/refresh-token')) {
              _accessToken = null;
              _refreshTokenCookie = null;
              return handler.next(error);
            }

            try {
              // Gọi API làm mới token sử dụng Refresh Token được lưu trong cookie
              final refreshResponse = await _dio.post('/api/auth/refresh-token');
              if (refreshResponse.statusCode == 200) {
                final data = refreshResponse.data;
                if (data != null && data['success'] == true) {
                  final tokenData = data['data'];
                  _accessToken = tokenData['accessToken'];

                  // Thực hiện gửi lại request ban đầu với Access Token mới
                  options.headers['Authorization'] = 'Bearer $_accessToken';
                  final retryResponse = await _dio.request(
                    options.path,
                    options: Options(
                      method: options.method,
                      headers: options.headers,
                    ),
                    data: options.data,
                    queryParameters: options.queryParameters,
                  );
                  return handler.resolve(retryResponse);
                }
              }
            } catch (e) {
              // Làm mới token thất bại -> Đăng xuất và xóa session
              _accessToken = null;
              _refreshTokenCookie = null;
            }
          }

          // 5. Xử lý lỗi tập trung và chuyển đổi thông tin lỗi thân thiện với người dùng
          return handler.next(_handleDioError(error));
        },
      ),
    );
  }

  Dio get dio => _dio;

  /// Thiết lập Access Token cho session hiện tại sau khi đăng nhập thành công.
  static void setAccessToken(String? token) {
    _accessToken = token;
  }

  /// Lấy Access Token hiện tại.
  static String? get accessToken => _accessToken;

  /// Đăng xuất - xóa toàn bộ Access Token và Cookie Refresh Token.
  static void clearSession() {
    _accessToken = null;
    _refreshTokenCookie = null;
  }

  /// Hàm tiện ích hỗ trợ gửi request GET
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.get<T>(
      path,
      queryParameters: queryParameters,
      options: options,
    );
  }

  /// Hàm tiện ích hỗ trợ gửi request POST
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.post<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  /// Hàm tiện ích hỗ trợ gửi request PUT
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.put<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  /// Hàm tiện ích hỗ trợ gửi request DELETE
  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.delete<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  /// Hàm nội bộ để dịch lỗi Dio sang lỗi mô tả dễ hiểu.
  DioException _handleDioError(DioException error) {
    String errorMessage = 'Đã xảy ra lỗi không xác định.';
    
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        errorMessage = 'Kết nối mạng quá hạn. Vui lòng thử lại sau.';
        break;
      case DioExceptionType.badResponse:
        final responseData = error.response?.data;
        if (responseData is Map && responseData.containsKey('message')) {
          errorMessage = responseData['message'];
        } else {
          errorMessage = 'Lỗi máy chủ (${error.response?.statusCode}).';
        }
        break;
      case DioExceptionType.cancel:
        errorMessage = 'Yêu cầu kết nối đã bị hủy.';
        break;
      case DioExceptionType.connectionError:
        errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.';
        break;
      default:
        errorMessage = 'Lỗi kết nối mạng hoặc máy chủ.';
        break;
    }
    
    // Trả về một đối tượng DioException mới với thông báo lỗi đã được xử lý
    return DioException(
      requestOptions: error.requestOptions,
      response: error.response,
      type: error.type,
      error: errorMessage,
      message: errorMessage,
    );
  }
}
