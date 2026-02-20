import 'package:flutter/material.dart';
import '../../../../core/di/injection_container.dart' as di;
import '../../../../core/network/service_api.dart';
import '../../../../core/theme/app_theme.dart';

const _serviceLabels = {
  'HomamYagam': 'Homam & Yagam',
  'HomePooja': 'Home Pooja',
  'PoojaSamagri': 'Pooja Samagri',
  'FamilyConnect': 'Family Connect',
};

class ServiceRequestsPage extends StatefulWidget {
  const ServiceRequestsPage({super.key});

  @override
  State<ServiceRequestsPage> createState() => _ServiceRequestsPageState();
}

class _ServiceRequestsPageState extends State<ServiceRequestsPage> {
  final _api = di.sl<ServiceRequestApi>();
  List<dynamic> _requests = [];
  bool _loading = true;
  String _activeTab = 'all';
  String? _actionLoading;

  @override
  void initState() {
    super.initState();
    _fetchRequests();
  }

  Future<void> _fetchRequests() async {
    try {
      final data = await _api.getAll();
      if (mounted) setState(() { _requests = data; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _handleAccept(String id) async {
    setState(() => _actionLoading = id);
    try {
      await _api.accept(id);
      await _fetchRequests();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to accept: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _actionLoading = null);
    }
  }

  Future<void> _handleComplete(String id) async {
    setState(() => _actionLoading = id);
    try {
      await _api.complete(id);
      await _fetchRequests();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to complete: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _actionLoading = null);
    }
  }

  List<dynamic> get _filtered {
    if (_activeTab == 'all') return _requests;
    return _requests.where((r) => r['status'] == _activeTab).toList();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Service Requests')),
      body: Column(
        children: [
          // Tabs
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                _buildTab('all', 'All'),
                _buildTab('PENDING', 'Pending'),
                _buildTab('ACCEPTED', 'Accepted'),
                _buildTab('COMPLETED', 'Completed'),
              ],
            ),
          ),
          // List
          Expanded(
            child: _filtered.isEmpty
                ? const Center(child: Text('No service requests found'))
                : RefreshIndicator(
                    onRefresh: _fetchRequests,
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      itemCount: _filtered.length,
                      itemBuilder: (ctx, i) => _buildRequestCard(_filtered[i]),
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildTab(String key, String label) {
    final isActive = _activeTab == key;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        selected: isActive,
        label: Text(label),
        onSelected: (_) => setState(() => _activeTab = key),
        selectedColor: AppTheme.primaryColor.withOpacity(0.2),
      ),
    );
  }

  Widget _buildRequestCard(Map<String, dynamic> req) {
    final status = req['status'] as String;
    final serviceType = req['serviceType'] as String;
    final memberName = req['member']?['profile']?['fullName'] ?? 'Unknown';
    final date = req['date'] ?? '';
    final time = req['time'] ?? '';
    final location = req['location'];
    final notes = req['notes'];
    final id = req['id'] as String;

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
                Text(
                  _serviceLabels[serviceType] ?? serviceType,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
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
            const SizedBox(height: 12),
            _detailRow(Icons.person_outline, memberName),
            _detailRow(Icons.calendar_today, _formatDate(date)),
            _detailRow(Icons.access_time, time),
            if (location != null) _detailRow(Icons.location_on_outlined, location),
            if (notes != null) ...[
              const SizedBox(height: 8),
              Text(notes, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
            ],
            const SizedBox(height: 12),
            if (status == 'PENDING')
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _actionLoading == id ? null : () => _handleAccept(id),
                  icon: const Icon(Icons.check, size: 18),
                  label: Text(_actionLoading == id ? 'Accepting...' : 'Accept'),
                ),
              ),
            if (status == 'ACCEPTED')
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _actionLoading == id ? null : () => _handleComplete(id),
                  icon: const Icon(Icons.check_circle_outline, size: 18),
                  label: Text(_actionLoading == id ? 'Completing...' : 'Mark Completed'),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Icon(icon, size: 16, color: Colors.grey),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 14))),
        ],
      ),
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
