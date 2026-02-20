import 'package:flutter/material.dart';
import '../../../../core/di/injection_container.dart' as di;
import '../../../../core/network/service_api.dart';

const _serviceLabels = {
  'HomamYagam': 'Homam & Yagam',
  'HomePooja': 'Home Pooja',
  'PoojaSamagri': 'Pooja Samagri',
  'FamilyConnect': 'Family Connect',
};

class BookingsPage extends StatefulWidget {
  const BookingsPage({super.key});

  @override
  State<BookingsPage> createState() => _BookingsPageState();
}

class _BookingsPageState extends State<BookingsPage> {
  final _api = di.sl<ServiceRequestApi>();
  List<dynamic> _requests = [];
  bool _loading = true;
  String _filter = 'all';

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    try {
      final data = await _api.getAll();
      if (mounted) setState(() { _requests = data; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  List<dynamic> get _filtered {
    if (_filter == 'all') return _requests;
    return _requests.where((r) => r['status'] == _filter).toList();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    return Scaffold(
      appBar: AppBar(title: const Text('My Bookings')),
      body: Column(
        children: [
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.all(12),
            child: Row(children: [
              _tab('all', 'All'),
              _tab('PENDING', 'Pending'),
              _tab('ACCEPTED', 'Accepted'),
              _tab('COMPLETED', 'Completed'),
            ]),
          ),
          Expanded(
            child: _filtered.isEmpty
                ? const Center(child: Text('No bookings found'))
                : RefreshIndicator(
                    onRefresh: _fetch,
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      itemCount: _filtered.length,
                      itemBuilder: (ctx, i) => _card(_filtered[i]),
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _tab(String key, String label) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        selected: _filter == key,
        label: Text(label),
        onSelected: (_) => setState(() => _filter = key),
      ),
    );
  }

  Widget _card(Map<String, dynamic> req) {
    final status = req['status'] as String;
    final serviceType = req['serviceType'] as String;
    final providerName = req['provider']?['profile']?['fullName'];

    Color statusColor;
    switch (status) {
      case 'ACCEPTED': statusColor = Colors.blue; break;
      case 'COMPLETED': statusColor = Colors.green; break;
      default: statusColor = Colors.orange;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(_serviceLabels[serviceType] ?? serviceType,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(status, style: TextStyle(fontSize: 12, color: statusColor, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
            const SizedBox(height: 10),
            _row(Icons.calendar_today, _formatDate(req['date'] ?? '')),
            _row(Icons.access_time, req['time'] ?? ''),
            if (req['location'] != null) _row(Icons.location_on_outlined, req['location']),
            if (providerName != null) _row(Icons.person_outline, providerName),
            if (req['notes'] != null) ...[
              const SizedBox(height: 6),
              Text(req['notes'], style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
            ],
          ],
        ),
      ),
    );
  }

  Widget _row(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(children: [
        Icon(icon, size: 16, color: Colors.grey),
        const SizedBox(width: 8),
        Expanded(child: Text(text, style: const TextStyle(fontSize: 14))),
      ]),
    );
  }

  String _formatDate(String dateStr) {
    try {
      final d = DateTime.parse(dateStr);
      return '${d.day}/${d.month}/${d.year}';
    } catch (_) {
      return dateStr;
    }
  }
}
