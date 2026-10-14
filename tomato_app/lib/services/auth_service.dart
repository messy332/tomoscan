import 'package:supabase_flutter/supabase_flutter.dart';

class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  final _client = Supabase.instance.client;

  Future<String?> getUserName() async =>
      _client.auth.currentUser?.userMetadata?['full_name']?.toString();

  Future<bool> isLoggedIn() async {
    return _client.auth.currentSession != null;
  }

  Future<void> logout() => _client.auth.signOut();

  Future<void> login(String email, String password) async =>
      _client.auth.signInWithPassword(email: email, password: password);

  Future<bool> register(String fullName, String email, String password) async {
    final response = await _client.auth.signUp(
      email: email,
      password: password,
      data: {'full_name': fullName},
    );
    return response.session != null;
  }
}
