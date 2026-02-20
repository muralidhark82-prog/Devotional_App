import 'package:dio/dio.dart';

class ApiClient {
  final Dio _dio;
  String? _accessToken;

  ApiClient(this._dio);

  void setAccessToken(String? token) {
    _accessToken = token;
  }

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_accessToken != null) 'Authorization': 'Bearer $_accessToken',
  };

  /// Safely handle any DioException — never rethrow, always return a Map
  Map<String, dynamic> _handleDioError(DioException e) {
    if (e.response?.data is Map<String, dynamic>) {
      return e.response!.data as Map<String, dynamic>;
    }
    // Build a consistent error response for any other case
    final statusCode = e.response?.statusCode ?? 0;
    String message;
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout ||
        e.type == DioExceptionType.sendTimeout) {
      message = 'Connection timed out. Please try again.';
    } else if (e.type == DioExceptionType.connectionError) {
      message = 'Cannot connect to server. Check your internet.';
    } else if (statusCode == 401) {
      message = 'Invalid credentials';
    } else if (statusCode == 403) {
      message = 'Access denied';
    } else if (statusCode == 404) {
      message = 'Service not found';
    } else if (statusCode >= 500) {
      message = 'Server error. Please try again later.';
    } else {
      message = e.message ?? 'Something went wrong';
    }
    return {
      'success': false,
      'error': {'code': 'NETWORK_ERROR', 'message': message},
    };
  }

  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> data) async {
    try {
      final response = await _dio.post(
        path,
        data: data,
        options: Options(headers: _headers),
      );
      return response.data;
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  Future<Map<String, dynamic>> get(String path) async {
    try {
      final response = await _dio.get(
        path,
        options: Options(headers: _headers),
      );
      return response.data;
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  Future<Map<String, dynamic>> patch(String path, Map<String, dynamic> data) async {
    try {
      final response = await _dio.patch(
        path,
        data: data,
        options: Options(headers: _headers),
      );
      return response.data;
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  Future<Map<String, dynamic>> delete(String path) async {
    try {
      final response = await _dio.delete(
        path,
        options: Options(headers: _headers),
      );
      return response.data;
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }
}
