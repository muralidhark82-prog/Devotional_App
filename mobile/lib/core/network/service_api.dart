import 'api_client.dart';

class ServiceRequestApi {
  final ApiClient _client;
  ServiceRequestApi(this._client);

  Future<List<dynamic>> getAll() async {
    final response = await _client.get('/service-requests');
    return response['data'] as List<dynamic>;
  }

  Future<Map<String, dynamic>> create({
    required String serviceType,
    required String date,
    required String time,
    String? location,
    String? notes,
  }) async {
    return await _client.post('/service-requests', {
      'serviceType': serviceType,
      'date': date,
      'time': time,
      if (location != null) 'location': location,
      if (notes != null) 'notes': notes,
    });
  }

  Future<Map<String, dynamic>> accept(String id) async {
    return await _client.post('/service-requests/$id/accept', {});
  }

  Future<Map<String, dynamic>> complete(String id) async {
    return await _client.post('/service-requests/$id/complete', {});
  }
}

class NotificationApi {
  final ApiClient _client;
  NotificationApi(this._client);

  Future<Map<String, dynamic>> getAll() async {
    final response = await _client.get('/notifications');
    return response['data'] as Map<String, dynamic>;
  }

  Future<void> markAsRead(String id) async {
    await _client.post('/notifications/$id/read', {});
  }

  Future<void> markAllAsRead() async {
    await _client.post('/notifications/read-all', {});
  }
}
