import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/scan_result.dart';

class ScanService {
  ScanService._();
  static final ScanService instance = ScanService._();

  final _client = Supabase.instance.client;

  Future<ScanResult> saveClassification(Map<String, dynamic> result) async {
    final user = _client.auth.currentUser;
    if (user == null) throw StateError('Sign in to save scans.');

    final dt = result['dt'] as Map<String, dynamic>;
    final rf = result['rf'] as Map<String, dynamic>;
    final row = await _client.from('scans').insert({
      'user_id': user.id,
      'image_filename': result['image_filename'],
      'dt_prediction': dt['prediction'],
      'dt_confidence': dt['confidence'],
      'dt_probabilities': dt['probabilities'],
      'dt_latency_ms': dt['latency_ms'],
      'rf_prediction': rf['prediction'],
      'rf_confidence': rf['confidence'],
      'rf_probabilities': rf['probabilities'],
      'rf_latency_ms': rf['latency_ms'],
    }).select().single();

    return ScanResult.fromJson({
      'id': row['id'],
      'created_at': row['created_at'],
      'dt': {
        'prediction': row['dt_prediction'],
        'confidence': row['dt_confidence'],
        'probabilities': row['dt_probabilities'],
        'latency_ms': row['dt_latency_ms'],
      },
      'rf': {
        'prediction': row['rf_prediction'],
        'confidence': row['rf_confidence'],
        'probabilities': row['rf_probabilities'],
        'latency_ms': row['rf_latency_ms'],
      },
    });
  }

  Future<List<dynamic>> getHistory({int skip = 0, int limit = 20}) async {
    return _client
        .from('scans')
        .select(
          'id, image_filename, dt_prediction, dt_confidence, '
          'rf_prediction, rf_confidence, created_at',
        )
        .order('created_at', ascending: false)
        .range(skip, skip + limit - 1);
  }
}