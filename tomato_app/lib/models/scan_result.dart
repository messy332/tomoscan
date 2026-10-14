class ProbabilityMap {
  final double unripe;
  final double ripe;
  final double overripe;

  const ProbabilityMap({
    required this.unripe,
    required this.ripe,
    required this.overripe,
  });

  factory ProbabilityMap.fromJson(Map<String, dynamic> j) => ProbabilityMap(
        unripe:   (j['unripe']   as num).toDouble(),
        ripe:     (j['ripe']     as num).toDouble(),
        overripe: (j['overripe'] as num).toDouble(),
      );

  /// Build from raw score list [unripe, ripe, overripe]
  factory ProbabilityMap.fromScores(List<double> scores) {
    final total = scores.reduce((a, b) => a + b);
    return ProbabilityMap(
      unripe:   total > 0 ? scores[0] / total : 0,
      ripe:     total > 0 ? scores[1] / total : 0,
      overripe: total > 0 ? scores[2] / total : 0,
    );
  }
}

class ModelResult {
  final String prediction;
  final double confidence;
  final ProbabilityMap probabilities;
  final double latencyMs;

  const ModelResult({
    required this.prediction,
    required this.confidence,
    required this.probabilities,
    required this.latencyMs,
  });

  factory ModelResult.fromJson(Map<String, dynamic> j) => ModelResult(
        prediction:    j['prediction'] as String,
        confidence:    (j['confidence'] as num).toDouble(),
        probabilities: ProbabilityMap.fromJson(
            j['probabilities'] as Map<String, dynamic>),
        latencyMs:     (j['latency_ms'] as num).toDouble(),
      );
}

class ScanResult {
  final String? id;
  final ModelResult dt;
  final ModelResult rf;
  final DateTime createdAt;
  final bool isOffline; // true = ran locally without server

  const ScanResult({
    this.id,
    required this.dt,
    required this.rf,
    required this.createdAt,
    this.isOffline = false,
  });

  factory ScanResult.fromJson(Map<String, dynamic> j) => ScanResult(
        id:        j['id'] as String?,
        dt:        ModelResult.fromJson(j['dt'] as Map<String, dynamic>),
        rf:        ModelResult.fromJson(j['rf'] as Map<String, dynamic>),
        createdAt: DateTime.parse(j['created_at'] as String),
      );
}

class HistoryItem {
  final String id;
  final String rfPrediction;
  final double rfConfidence;
  final String dtPrediction;
  final double dtConfidence;
  final DateTime createdAt;

  const HistoryItem({
    required this.id,
    required this.rfPrediction,
    required this.rfConfidence,
    required this.dtPrediction,
    required this.dtConfidence,
    required this.createdAt,
  });

  factory HistoryItem.fromJson(Map<String, dynamic> j) => HistoryItem(
        id:            j['id'] as String,
        rfPrediction:  j['rf_prediction'] as String,
        rfConfidence:  (j['rf_confidence'] as num).toDouble(),
        dtPrediction:  j['dt_prediction'] as String,
        dtConfidence:  (j['dt_confidence'] as num).toDouble(),
        createdAt:     DateTime.parse(j['created_at'] as String),
      );
}
