import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/di/injection_container.dart' as di;
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  final _api = di.sl<ApiClient>();
  Map<String, dynamic>? _profile;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    try {
      final response = await _api.get('/users/me');
      if (mounted) setState(() { _profile = response['data']; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final profile = _profile?['profile'] as Map<String, dynamic>?;
    final fullName = profile?['fullName'] ?? 'User';
    final email = _profile?['email'] ?? '';
    final phone = _profile?['phone'] ?? '';
    final role = _profile?['role'] ?? 'MEMBER';
    final placeOfBirth = profile?['placeOfBirth'] ?? '';
    final timeOfBirth = profile?['timeOfBirth'] ?? '';
    final gotra = profile?['gotra'] ?? '';
    final nakshatra = profile?['nakshatra'] ?? '';
    final rashi = profile?['rashi'] ?? '';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              context.read<AuthBloc>().add(LogoutRequested());
              context.go('/welcome');
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchProfile,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Center(
              child: CircleAvatar(
                radius: 48,
                backgroundColor: AppTheme.primaryColor.withOpacity(0.15),
                child: Text(
                  fullName.isNotEmpty ? fullName[0].toUpperCase() : 'U',
                  style: const TextStyle(fontSize: 36, color: AppTheme.primaryColor),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Center(child: Text(fullName, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold))),
            Center(
              child: Container(
                margin: const EdgeInsets.only(top: 4),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
                decoration: BoxDecoration(
                  color: role == 'PROVIDER' ? Colors.purple.withOpacity(0.15) : Colors.blue.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(role, style: TextStyle(fontSize: 12, color: role == 'PROVIDER' ? Colors.purple : Colors.blue)),
              ),
            ),
            const SizedBox(height: 24),
            _infoTile(Icons.email_outlined, 'Email', email),
            if (phone.isNotEmpty) _infoTile(Icons.phone_outlined, 'Phone', phone),
            if (placeOfBirth.isNotEmpty) _infoTile(Icons.location_on_outlined, 'Place of Birth', placeOfBirth),
            if (timeOfBirth.isNotEmpty) _infoTile(Icons.access_time, 'Time of Birth', timeOfBirth),
            if (gotra.isNotEmpty) _infoTile(Icons.family_restroom, 'Gotra', gotra),
            if (nakshatra.isNotEmpty) _infoTile(Icons.star_outline, 'Nakshatra', nakshatra),
            if (rashi.isNotEmpty) _infoTile(Icons.circle_outlined, 'Rashi', rashi),
          ],
        ),
      ),
    );
  }

  Widget _infoTile(IconData icon, String label, String value) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: AppTheme.primaryColor),
        title: Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
        subtitle: Text(value, style: const TextStyle(fontSize: 16)),
      ),
    );
  }
}
