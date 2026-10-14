import 'dart:io';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/scan_result.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/scan_service.dart';
import 'feature_extractor.dart';
import 'random_forest.dart' as rf_model;

/// Runs classification.
/// - If user is logged in → calls backend (saves to DB, gets DT+RF comparison).
/// - If offline or not logged in → runs RF locally using the Dart model.
class ClassifierService {
  ClassifierService._();
  static final ClassifierService instance = ClassifierService._();

  static const _labels = ['unripe', 'ripe', 'overripe'];

  Future<ScanResult> classify(File imageFile) async {
    final loggedIn = await AuthService.instance.isLoggedIn();

    if (loggedIn) {
      try {
        final token = Supabase.instance.client.auth.currentSession?.accessToken;
        if (token == null) throw StateError('Your session has expired.');
        final data = await ApiService.instance.classifyImage(imageFile, token);
        return await ScanService.instance.saveClassification(data);
      } catch (e) {
        // Network error → fall back to offline
        return _classifyOffline(imageFile);
      }
    }

    return _classifyOffline(imageFile);
  }

  Future<ScanResult> _classifyOffline(File imageFile) async {
    final features = await extractFeatures(imageFile);

    final t0 = DateTime.now();
    final scores = rf_model.score(features);
    final latency = DateTime.now().difference(t0).inMicroseconds / 1000.0;

    final probs = ProbabilityMap.fromScores(scores);
    final best  = _bestIndex(scores);

    // Use same result for both DT and RF when offline (we only have RF exported)
    final result = ModelResult(
      prediction:    _labels[best],
      confidence:    scores[best] / scores.reduce((a, b) => a + b),
      probabilities: probs,
      latencyMs:     latency,
    );

    return ScanResult(
      dt:        result,
      rf:        result,
      createdAt: DateTime.now(),
      isOffline: true,
    );
  }

  int _bestIndex(List<double> scores) {
    int best = 0;
    for (int i = 1; i < scores.length; i++) {
      if (scores[i] > scores[best]) best = i;
    }
    return best;
  }
}
