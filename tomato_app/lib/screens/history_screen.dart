import 'package:flutter/material.dart';
import '../services/scan_service.dart';
import '../models/scan_result.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});
  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  List<HistoryItem> _items = [];
  bool _loading = true;
  String? _error;

  static const _red = Color(0xFFE8441A);

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final raw = await ScanService.instance.getHistory();
      setState(() {
        _items = raw.map((e) => HistoryItem.fromJson(e as Map<String, dynamic>)).toList();
      });
    } catch (_) {
      setState(() => _error = 'Could not load history. Are you connected?');
    } finally {
      setState(() => _loading = false);
    }
  }

  Color _colorFor(String label) {
    switch (label) {
      case 'ripe':     return _red;
      case 'unripe':   return Colors.green;
      case 'overripe': return Colors.brown;
      default:         return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9F9F9),
      appBar: AppBar(
        title: const Text('History'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 0,
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _load),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: _red))
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.cloud_off, size: 48, color: Colors.grey),
                        const SizedBox(height: 12),
                        Text(_error!, textAlign: TextAlign.center,
                            style: const TextStyle(color: Colors.grey)),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _load,
                          style: ElevatedButton.styleFrom(backgroundColor: _red),
                          child: const Text('Retry', style: TextStyle(color: Colors.white)),
                        ),
                      ],
                    ),
                  ),
                )
              : _items.isEmpty
                  ? const Center(
                      child: Text('No scans yet.\nClassify your first tomato!',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey)),
                    )
                  : RefreshIndicator(
                      onRefresh: _load,
                      color: _red,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _items.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 10),
                        itemBuilder: (_, i) {
                          final item = _items[i];
                          return Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: Colors.grey.shade100),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        _formatDate(item.createdAt),
                                        style: const TextStyle(
                                            fontSize: 12, color: Colors.grey),
                                      ),
                                      const SizedBox(height: 6),
                                      Row(
                                        children: [
                                          Text('🌲 DT: ',
                                              style: TextStyle(
                                                  fontSize: 12,
                                                  color: Colors.grey.shade600)),
                                          Text(item.dtPrediction.toUpperCase(),
                                              style: TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.bold,
                                                  color: _colorFor(item.dtPrediction))),
                                          Text(
                                              '  ${(item.dtConfidence * 100).toStringAsFixed(0)}%',
                                              style: TextStyle(
                                                  fontSize: 12,
                                                  color: Colors.grey.shade500)),
                                        ],
                                      ),
                                      const SizedBox(height: 2),
                                      Row(
                                        children: [
                                          Text('🌳 RF: ',
                                              style: TextStyle(
                                                  fontSize: 12,
                                                  color: Colors.grey.shade600)),
                                          Text(item.rfPrediction.toUpperCase(),
                                              style: TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.bold,
                                                  color: _colorFor(item.rfPrediction))),
                                          Text(
                                              '  ${(item.rfConfidence * 100).toStringAsFixed(0)}%',
                                              style: TextStyle(
                                                  fontSize: 12,
                                                  color: Colors.grey.shade500)),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                _badge(item.rfPrediction),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
    );
  }

  Widget _badge(String label) {
    final color = _colorFor(label);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(label,
          style: TextStyle(
              fontSize: 12, fontWeight: FontWeight.w600, color: color)),
    );
  }

  String _formatDate(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inHours < 24) {
      return 'Today, ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    }
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}
