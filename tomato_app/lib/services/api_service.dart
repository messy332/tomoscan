import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

/// Change this to your Railway backend URL after deploying.
/// For local dev use: http://10.0.2.2:8000/api/v1  (Android emulator)
const String kBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://10.0.2.2:8000/api/v1',
);

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  ApiException(this.message, [this.statusCode]);
  @override
  String toString() => message;
}

class ApiService {
  ApiService._();
  static final ApiService instance = ApiService._();

  Future<Map<String, String>> _headers({bool auth = true}) async {
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (auth) {
      final token = await AuthService.instance.getAccessToken();
      if (token != null) headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  Map<String, dynamic> _parse(http.Response res) {
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode >= 400) {
      throw ApiException(body['detail']?.toString() ?? 'Request failed', res.statusCode);
    }
    return body;
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('$kBaseUrl/auth/login'),
      headers: await _headers(auth: false),
      body: jsonEncode({'email': email, 'password': password}),
    );
    return _parse(res);
  }

  Future<Map<String, dynamic>> register(
      String fullName, String email, String password) async {
    final res = await http.post(
      Uri.parse('$kBaseUrl/auth/register'),
      headers: await _headers(auth: false),
      body: jsonEncode({'full_name': fullName, 'email': email, 'password': password}),
    );
    return _parse(res);
  }

  // ── Scans ─────────────────────────────────────────────────────────────────

  /// Upload image to backend — returns full comparison result.
  Future<Map<String, dynamic>> classifyImage(File imageFile) async {
    final token = await AuthService.instance.getAccessToken();
    final uri = Uri.parse('$kBaseUrl/scans/classify');

    final request = http.MultipartRequest('POST', uri)
      ..headers['Authorization'] = 'Bearer $token'
      ..files.add(await http.MultipartFile.fromPath('file', imageFile.path));

    final streamed = await request.send();
    final res = await http.Response.fromStream(streamed);

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode >= 400) {
      throw ApiException(body['detail']?.toString() ?? 'Classification failed', res.statusCode);
    }
    return body;
  }

  Future<List<dynamic>> getHistory({int skip = 0, int limit = 20}) async {
    final res = await http.get(
      Uri.parse('$kBaseUrl/scans/history?skip=$skip&limit=$limit'),
      headers: await _headers(),
    );
    if (res.statusCode >= 400) throw ApiException('Failed to load history', res.statusCode);
    return jsonDecode(res.body) as List<dynamic>;
  }
}
