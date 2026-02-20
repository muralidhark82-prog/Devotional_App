import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/di/injection_container.dart' as di;
import '../../../../core/network/service_api.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../service_requests/presentation/pages/service_requests_page.dart';
import '../../../book_service/presentation/pages/book_service_page.dart';
import '../../../bookings/presentation/pages/bookings_page.dart';
import '../../../profile/presentation/pages/profile_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _currentIndex = 0;
  int _unreadCount = 0;
  Timer? _notifTimer;

  String get _userRole {
    final state = context.read<AuthBloc>().state;
    if (state is AuthSuccess) return state.role;
    return 'MEMBER';
  }

  String get _userName {
    final state = context.read<AuthBloc>().state;
    if (state is AuthSuccess) return state.fullName;
    return 'User';
  }

  @override
  void initState() {
    super.initState();
    _fetchUnread();
    _notifTimer = Timer.periodic(const Duration(seconds: 15), (_) => _fetchUnread());
  }

  @override
  void dispose() {
    _notifTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchUnread() async {
    try {
      final api = di.sl<NotificationApi>();
      final data = await api.getAll();
      if (mounted) setState(() => _unreadCount = data['unreadCount'] as int);
    } catch (_) {}
  }

  List<Widget> get _pages {
    if (_userRole == 'PROVIDER') {
      return [
        _HomeContent(userName: _userName, role: _userRole),
        const ServiceRequestsPage(),
        const ProfilePage(),
      ];
    }
    return [
      _HomeContent(userName: _userName, role: _userRole),
      const BookServicePage(),
      const BookingsPage(),
      const ProfilePage(),
    ];
  }

  List<NavigationDestination> get _destinations {
    if (_userRole == 'PROVIDER') {
      return const [
        NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
        NavigationDestination(icon: Icon(Icons.assignment_outlined), selectedIcon: Icon(Icons.assignment), label: 'Requests'),
        NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
      ];
    }
    return const [
      NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
      NavigationDestination(icon: Icon(Icons.temple_hindu_outlined), selectedIcon: Icon(Icons.temple_hindu), label: 'Services'),
      NavigationDestination(icon: Icon(Icons.calendar_today_outlined), selectedIcon: Icon(Icons.calendar_today), label: 'Bookings'),
      NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _currentIndex == 0
          ? AppBar(
              title: Row(
                children: [
                  Container(
                    width: 36, height: 36,
                    decoration: BoxDecoration(
                      color: AppTheme.lightSurface,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Center(
                      child: Icon(Icons.local_fire_department, size: 22, color: AppTheme.primaryColor),
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text('Swadhrama'),
                ],
              ),
              actions: [
                Stack(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.notifications_outlined),
                      onPressed: () => context.push('/notifications'),
                    ),
                    if (_unreadCount > 0)
                      Positioned(
                        right: 6, top: 6,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                          child: Text(
                            _unreadCount > 9 ? '9+' : '$_unreadCount',
                            style: const TextStyle(color: Colors.white, fontSize: 10),
                          ),
                        ),
                      ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.family_restroom),
                  onPressed: () => context.push('/household'),
                ),
              ],
            )
          : null,
      body: IndexedStack(index: _currentIndex, children: _pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (i) => setState(() => _currentIndex = i),
        destinations: _destinations,
      ),
    );
  }
}

class _HomeContent extends StatelessWidget {
  final String userName;
  final String role;
  const _HomeContent({required this.userName, required this.role});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome Banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [AppTheme.primaryColor, AppTheme.secondaryColor]),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Welcome, ${userName.split(' ').first}! 🙏',
                  style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  role == 'PROVIDER'
                      ? 'Check your service requests today'
                      : 'What devotional service do you need today?',
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.85)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Quick Services (Member only)
          if (role == 'MEMBER') ...[
            Text('Quick Services', style: Theme.of(context).textTheme.displaySmall),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: const [
                _ServiceTile(icon: Icons.local_fire_department, label: 'Homam &\nYagam', color: AppTheme.primaryColor),
                _ServiceTile(icon: Icons.temple_hindu, label: 'Home\nPooja', color: AppTheme.secondaryColor),
                _ServiceTile(icon: Icons.shopping_bag, label: 'Pooja\nSamagri', color: Colors.green),
                _ServiceTile(icon: Icons.family_restroom, label: 'Family\nConnect', color: Colors.purple),
              ],
            ),
            const SizedBox(height: 24),

            // Upcoming Events
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Upcoming Events', style: Theme.of(context).textTheme.displaySmall),
                TextButton(onPressed: () {}, child: const Text('See All')),
              ],
            ),
            const SizedBox(height: 8),
            Card(
              child: ListTile(
                leading: Container(
                  width: 48, height: 48,
                  decoration: BoxDecoration(
                    color: AppTheme.goldColor.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Center(child: Text('🎉', style: TextStyle(fontSize: 24))),
                ),
                title: const Text('Ganesh Chaturthi'),
                subtitle: const Text('Sep 7, 2024 • Home Pooja'),
                trailing: const Icon(Icons.chevron_right),
              ),
            ),
            const SizedBox(height: 24),
          ],

          // Provider stats
          if (role == 'PROVIDER') ...[
            Row(
              children: [
                Expanded(child: _StatCard(icon: Icons.access_time, label: 'Pending', value: '—', color: AppTheme.primaryColor)),
                const SizedBox(width: 12),
                Expanded(child: _StatCard(icon: Icons.check_circle_outline, label: 'Scheduled', value: '—', color: Colors.green)),
                const SizedBox(width: 12),
                Expanded(child: _StatCard(icon: Icons.calendar_today, label: 'Completed', value: '—', color: Colors.purple)),
              ],
            ),
            const SizedBox(height: 24),
          ],

          // Top Poojaris
          Text('Top Poojaris', style: Theme.of(context).textTheme.displaySmall),
          const SizedBox(height: 12),
          SizedBox(
            height: 170,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: const [
                _ProviderCard(name: 'Pandit Sharma', specialty: 'Vedic Rituals', rating: 4.9),
                _ProviderCard(name: 'Acharya Joshi', specialty: 'Homam & Yagam', rating: 4.8),
                _ProviderCard(name: 'Shastri Kumar', specialty: 'Home Pooja', rating: 4.7),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Recent Activity (Member only)
          if (role == 'MEMBER') ...[
            Text('Recent Activity', style: Theme.of(context).textTheme.displaySmall),
            const SizedBox(height: 12),
            _ActivityItem(text: 'Booked Satyanarayan Pooja', time: '2 days ago'),
            _ActivityItem(text: 'Joined Sharma Household', time: '1 week ago'),
          ],
        ],
      ),
    );
  }
}

class _ServiceTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  const _ServiceTile({required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 52, height: 52,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Icon(icon, color: color, size: 26),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 10, height: 1.2),
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }
}

class _ProviderCard extends StatelessWidget {
  final String name;
  final String specialty;
  final double rating;
  const _ProviderCard({required this.name, required this.specialty, required this.rating});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 140,
      margin: const EdgeInsets.only(right: 12),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: AppTheme.lightSurface,
                child: const Icon(Icons.person, size: 32, color: AppTheme.primaryColor),
              ),
              const SizedBox(height: 8),
              Text(name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
              Text(specialty, style: const TextStyle(fontSize: 11, color: Colors.grey), maxLines: 1, overflow: TextOverflow.ellipsis),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.star, size: 14, color: AppTheme.goldColor),
                  const SizedBox(width: 2),
                  Text('$rating', style: const TextStyle(fontSize: 12)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;
  const _StatCard({required this.icon, required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(height: 8),
            Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}

class _ActivityItem extends StatelessWidget {
  final String text;
  final String time;
  const _ActivityItem({required this.text, required this.time});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(
            width: 8, height: 8,
            decoration: const BoxDecoration(color: AppTheme.primaryColor, shape: BoxShape.circle),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(text, style: const TextStyle(fontSize: 14)),
                Text(time, style: const TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
