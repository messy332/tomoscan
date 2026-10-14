import 'dart:io';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../classifier/classifier_service.dart';
import '../models/scan_result.dart';
import '../services/auth_service.dart';
import 'history_screen.dart';
import 'auth/landing_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  File? _image;
  ScanResult? _result;
  bool _loading = false;
  String? _userName;

  static const _red      = Color(0xFFE8441A);
  static const _labels   = ['unripe', 'ripe', 'overripe'];
  static const _colors   = [Color(0xFF22c55e), _red, Color(0xFF92400e)];
  static const _emojis   = ['🟢', '🍅', '🟤'];

  @override
  void initState() {
    super.initState();
    AuthService.instance.getUserName().then((n) {
      if (mounted) setState(() => _userName = n);
    });
  }

  Future<void> _pick(ImageSource source) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: source, imageQuality: 90);
    if (picked == null) return;

    setState(() { _image = File(picked.path); _result = null; _loading = true; });

    try {
      final res = await ClassifierService.instance.classify(_image!);
      setState(() { _result = res; _loading = false; });
    } catch (e) {
      setState(() => _loading = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red.shade700));
    }
  }

  void _reset() => setState(() { _image = null; _result = null; });

  Future<void> _logout() async {
    await AuthService.instance.logout();
    if (!mounted) return;
    Navigator.pushReplacement(
        context, MaterialPageRoute(builder: (_) => const LandingScreen()));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9F9F9),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('TomoScan',
                style: TextStyle(color: _red, fontWeight: FontWeight.bold, fontSize: 15)),
            if (_userName != null)
              Text('Hello, $_userName',
                  style: const TextStyle(color: Colors.black87, fontSize: 14,
                      fontWeight: FontWeight.w600)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.history, color: Colors.black54),
            tooltip: 'History',
            onPressed: () => Navigator.push(
                context, MaterialPageRoute(builder: (_) => const HistoryScreen())),
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.black54),
            tooltip: 'Sign out',
            onPressed: _logout,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image preview
            GestureDetector(
              onTap: () => _showPickSheet(),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                height: 260,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.grey.shade200),
                  boxShadow: [
                    BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 12, offset: const Offset(0, 4)),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: _image != null
                      ? Image.file(_image!, fit: BoxFit.cover)
                      : Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text('🍅', style: TextStyle(fontSize: 56)),
                            const SizedBox(height: 10),
                            Text('Tap to scan a tomato',
                                style: TextStyle(
                                    color: Colors.grey.shade400, fontSize: 15)),
                          ],
                        ),
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Pick buttons
            Row(
              children: [
                Expanded(child: _pickBtn(Icons.camera_alt, 'Camera', ImageSource.camera)),
                const SizedBox(width: 12),
                Expanded(child: _pickBtn(Icons.photo_library, 'Gallery', ImageSource.gallery)),
              ],
            ),

            // Loading
            if (_loading)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Column(
                  children: [
                    CircularProgressIndicator(color: _red),
                    SizedBox(height: 12),
                    Text('Classifying tomato…',
                        style: TextStyle(color: Colors.grey, fontSize: 13)),
                  ],
                ),
              ),

            // Result
            if (_result != null && !_loading) ...[
              const SizedBox(height: 20),
              _resultSection(_result!),
            ],
          ],
        ),
      ),
    );
  }

  Widget _pickBtn(IconData icon, String label, ImageSource src) =>
      ElevatedButton.icon(
        onPressed: () => _pick(src),
        icon: Icon(icon, size: 18),
        label: Text(label),
        style: ElevatedButton.styleFrom(
          backgroundColor: _red,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 13),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
      );

  void _showPickSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt, color: _red),
              title: const Text('Camera'),
              onTap: () { Navigator.pop(context); _pick(ImageSource.camera); },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library, color: _red),
              title: const Text('Gallery'),
              onTap: () { Navigator.pop(context); _pick(ImageSource.gallery); },
            ),
          ],
        ),
      ),
    );
  }

  Widget _resultSection(ScanResult result) {
    final agree = result.dt.prediction == result.rf.prediction;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Sync indicator
        if (result.isOffline)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: Colors.orange.shade50,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.orange.shade200),
            ),
            child: const Row(
              children: [
                Icon(Icons.cloud_off, size: 15, color: Colors.orange),
                SizedBox(width: 6),
                Text('Offline mode — result not synced',
                    style: TextStyle(fontSize: 12, color: Colors.orange)),
              ],
            ),
          ),

        // Agreement banner
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: agree ? Colors.green.shade50 : Colors.orange.shade50,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text(
            agree
                ? '✅ Both models agree: ${result.rf.prediction}'
                : '⚠️ Models disagree — check both results',
            style: TextStyle(
              fontSize: 13,
              color: agree ? Colors.green.shade700 : Colors.orange.shade700,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),

        // Model cards
        _modelCard('🌲 Decision Tree', result.dt),
        const SizedBox(height: 12),
        _modelCard('🌳 Random Forest', result.rf),
        const SizedBox(height: 16),

        OutlinedButton.icon(
          onPressed: _reset,
          icon: const Icon(Icons.camera_alt_outlined, size: 16),
          label: const Text('Scan Another Tomato'),
          style: OutlinedButton.styleFrom(
            foregroundColor: _red,
            side: const BorderSide(color: _red),
            padding: const EdgeInsets.symmetric(vertical: 13),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
        ),
      ],
    );
  }

  Widget _modelCard(String title, ModelResult r) {
    final idx   = _labels.indexOf(r.prediction);
    final color = idx >= 0 ? _colors[idx] : Colors.grey;
    final emoji = idx >= 0 ? _emojis[idx] : '❓';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.3)),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(children: [
            Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
            const Spacer(),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text('$emoji ${r.prediction}',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: color)),
            ),
          ]),
          const SizedBox(height: 14),

          // Probability bars
          ..._labels.asMap().entries.map((e) {
            final val = e.key == 0 ? r.probabilities.unripe
                      : e.key == 1 ? r.probabilities.ripe
                      : r.probabilities.overripe;
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: _bar(e.value, val, _colors[e.key]),
            );
          }),

          const Divider(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${(r.confidence * 100).toStringAsFixed(1)}% confidence',
                  style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.bold)),
              Text('${r.latencyMs.toStringAsFixed(2)} ms',
                  style: const TextStyle(fontSize: 12, color: Colors.grey)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _bar(String label, double value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
            Text('${(value * 100).toStringAsFixed(1)}%',
                style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w600)),
          ],
        ),
        const SizedBox(height: 3),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: value,
            minHeight: 5,
            backgroundColor: Colors.grey.shade100,
            valueColor: AlwaysStoppedAnimation(color),
          ),
        ),
      ],
    );
  }
}
