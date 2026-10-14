import 'dart:io';
import 'dart:math';
import 'package:image/image.dart' as img;

/// Extracts the same 28 features used during Python training:
/// R/G/B mean+std (6), H/S/V mean+std (6), 16-bin Hue histogram (16)
Future<List<double>> extractFeatures(File imageFile) async {
  final bytes = await imageFile.readAsBytes();
  final original = img.decodeImage(bytes);
  if (original == null) throw Exception('Could not decode image');

  // Resize to 100x100 exactly as in Python
  final resized = img.copyResize(original, width: 100, height: 100);

  final int total = 100 * 100;
  final List<double> r = [], g = [], b = [];
  final List<double> h = [], s = [], v = [];

  for (int y = 0; y < 100; y++) {
    for (int x = 0; x < 100; x++) {
      final pixel = resized.getPixel(x, y);
      final rVal = pixel.r / 255.0;
      final gVal = pixel.g / 255.0;
      final bVal = pixel.b / 255.0;

      r.add(rVal);
      g.add(gVal);
      b.add(bVal);

      final hsv = _rgbToHsv(rVal, gVal, bVal);
      h.add(hsv[0]);
      s.add(hsv[1]);
      v.add(hsv[2]);
    }
  }

  final features = <double>[];

  // RGB mean + std
  for (final ch in [r, g, b]) {
    features.add(_mean(ch));
    features.add(_std(ch));
  }

  // HSV mean + std
  for (final ch in [h, s, v]) {
    features.add(_mean(ch));
    features.add(_std(ch));
  }

  // 16-bin Hue histogram (normalized)
  final hueHist = List<double>.filled(16, 0.0);
  for (final hVal in h) {
    final bin = min((hVal * 16).floor(), 15);
    hueHist[bin]++;
  }
  for (int i = 0; i < 16; i++) {
    hueHist[i] /= total;
  }
  features.addAll(hueHist);

  return features; // 28 values
}

double _mean(List<double> vals) {
  if (vals.isEmpty) return 0.0;
  return vals.reduce((a, b) => a + b) / vals.length;
}

double _std(List<double> vals) {
  if (vals.isEmpty) return 0.0;
  final m = _mean(vals);
  final variance = vals.map((v) => (v - m) * (v - m)).reduce((a, b) => a + b) / vals.length;
  return sqrt(variance);
}

/// Converts RGB (0-1) to HSV (0-1)
List<double> _rgbToHsv(double r, double g, double b) {
  final maxC = max(r, max(g, b));
  final minC = min(r, min(g, b));
  final delta = maxC - minC;

  double hVal = 0.0;
  if (delta != 0) {
    if (maxC == r) {
      hVal = ((g - b) / delta) % 6;
    } else if (maxC == g) {
      hVal = (b - r) / delta + 2;
    } else {
      hVal = (r - g) / delta + 4;
    }
    hVal /= 6.0;
    if (hVal < 0) hVal += 1.0;
  }

  final sVal = maxC == 0 ? 0.0 : delta / maxC;
  final vVal = maxC;

  return [hVal, sVal, vVal];
}
