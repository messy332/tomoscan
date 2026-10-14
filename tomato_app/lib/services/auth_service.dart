import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_service.dart';

class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  final _storage = const FlutterSecureStorage();

  static const _kAccess  = 'access_token';
  static const _kRefresh = 'refresh_token';
  static const _kName    = 'user_name';
  static const _kEmail   = 'user_email';

  Future<String?> getAccessToken()  => _storage.read(key: _kAccess);
  Future<String?> getRefreshToken() => _storage.read(key: _kRefresh);
  Future<String?> getUserName()     => _storage.read(key: _kName);
  Future<String?> getUserEmail()    => _storage.read(key: _kEmail);

  Future<bool> isLoggedIn() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
    String? fullName,
    String? email,
  }) async {
    await _storage.write(key: _kAccess,  value: accessToken);
    await _storage.write(key: _kRefresh, value: refreshToken);
    if (fullName != null) await _storage.write(key: _kName,  value: fullName);
    if (email != null)    await _storage.write(key: _kEmail, value: email);
  }

  Future<void> logout() async => _storage.deleteAll();

  /// Login helper — saves tokens and returns user info map.
  Future<Map<String, dynamic>> login(String email, String password) async {
    final data = await ApiService.instance.login(email, password);
    await saveTokens(
      accessToken:  data['access_token'],
      refreshToken: data['refresh_token'],
      email: email,
    );
    return data;
  }

  /// Register helper — saves tokens and returns user info map.
  Future<Map<String, dynamic>> register(
      String fullName, String email, String password) async {
    final data = await ApiService.instance.register(fullName, email, password);
    await saveTokens(
      accessToken:  data['access_token'],
      refreshToken: data['refresh_token'],
      fullName: fullName,
      email: email,
    );
    return data;
  }
}
