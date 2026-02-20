import 'package:flutter/material.dart';
import '../../../../core/di/injection_container.dart' as di;
import '../../../../core/network/service_api.dart';

class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key});

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> {
  final _api = di.sl<NotificationApi>();
  List<dynamic> _notifications = [];
  int _unreadCount = 0;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    try {
      final data = await _api.getAll();
      if (mounted) {
        setState(() {
          _notifications = data['notifications'] as List<dynamic>;
          _unreadCount = data['unreadCount'] as int;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _markAllRead() async {
    try {
      await _api.markAllAsRead();
      setState(() {
        for (var n in _notifications) { n['read'] = true; }
        _unreadCount = 0;
      });
    } catch (_) {}
  }

  Future<void> _markRead(String id) async {
    try {
      await _api.markAsRead(id);
      setState(() {
        final idx = _notifications.indexWhere((n) => n['id'] == id);
        if (idx >= 0 && _notifications[idx]['read'] != true) {
          _notifications[idx]['read'] = true;
          _unreadCount = (_unreadCount - 1).clamp(0, 999);
        }
      });
    } catch (_) {}
  }

  String _timeAgo(String dateStr) {
    try {
      final diff = DateTime.now().difference(DateTime.parse(dateStr));
      if (diff.inMinutes < 1) return 'Just now';
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      return '${diff.inDays}d ago';
    } catch (_) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          if (_unreadCount > 0)
            TextButton(
              onPressed: _markAllRead,
              child: const Text('Mark all read'),
            ),
        ],
      ),
      body: _notifications.isEmpty
          ? const Center(child: Text('No notifications'))
          : RefreshIndicator(
              onRefresh: _fetch,
              child: ListView.builder(
                itemCount: _notifications.length,
                itemBuilder: (ctx, i) {
                  final n = _notifications[i];
                  final isRead = n['read'] == true;
                  return ListTile(
                    tileColor: isRead ? null : Colors.orange.withOpacity(0.05),
                    leading: Icon(
                      Icons.notifications,
                      color: isRead ? Colors.grey : Colors.orange,
                    ),
                    title: Text(
                      n['title'] ?? '',
                      style: TextStyle(fontWeight: isRead ? FontWeight.normal : FontWeight.bold),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(n['message'] ?? '', maxLines: 2, overflow: TextOverflow.ellipsis),
                        const SizedBox(height: 2),
                        Text(_timeAgo(n['createdAt'] ?? ''), style: const TextStyle(fontSize: 11, color: Colors.grey)),
                      ],
                    ),
                    isThreeLine: true,
                    onTap: () => _markRead(n['id']),
                  );
                },
              ),
            ),
    );
  }
}
