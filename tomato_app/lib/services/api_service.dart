import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

const String _classifierApiUrl = String.fromEnvironment('CLASSIFIER_API_URL');

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

  Future<Map<String, dynamic>> classifyImage(File imageFile, String accessToken) async {
    if (_classifierApiUrl.isEmpty) {
      throw ApiException('Classifier API is not configured.');
    }
    final uri = Uri.parse(
      '${_classifierApiUrl.replaceFirst(RegExp(r'/+$'), '')}/api/v1/scans/classify',
    );

    final request = http.MultipartRequest('POST', uri)
      ..headers['Authorization'] = 'Bearer $accessToken'
      ..files.add(await http.MultipartFile.fromPath('file', imageFile.path));

    final streamed = await request.send();
    final res = await http.Response.fromStream(streamed);

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode >= 400) {
      throw ApiException(body['detail']?.toString() ?? 'Classification failed', res.statusCode);
    }
    return body;
  }
}
