import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/di/injection_container.dart' as di;
import '../../../../core/network/service_api.dart';
import '../../../../core/theme/app_theme.dart';

class BookServicePage extends StatefulWidget {
  const BookServicePage({super.key});

  @override
  State<BookServicePage> createState() => _BookServicePageState();
}

class _BookServicePageState extends State<BookServicePage> {
  final _api = di.sl<ServiceRequestApi>();
  final _formKey = GlobalKey<FormState>();
  String _serviceType = 'HomamYagam';
  DateTime? _date;
  TimeOfDay? _time;
  final _locationController = TextEditingController();
  final _notesController = TextEditingController();
  bool _submitting = false;
  bool _success = false;
  String? _error;

  @override
  void dispose() {
    _locationController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_date == null || _time == null) {
      setState(() => _error = 'Please select date and time');
      return;
    }
    setState(() { _submitting = true; _error = null; });
    try {
      final dateStr = '${_date!.year}-${_date!.month.toString().padLeft(2, '0')}-${_date!.day.toString().padLeft(2, '0')}';
      final timeStr = '${_time!.hour.toString().padLeft(2, '0')}:${_time!.minute.toString().padLeft(2, '0')}';
      await _api.create(
        serviceType: _serviceType,
        date: dateStr,
        time: timeStr,
        location: _locationController.text.isNotEmpty ? _locationController.text : null,
        notes: _notesController.text.isNotEmpty ? _notesController.text : null,
      );
      setState(() => _success = true);
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) context.go('/home');
    } catch (e) {
      setState(() => _error = 'Failed to submit: $e');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Schedule a Service')),
      body: _success
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.check_circle, size: 64, color: Colors.green.shade400),
                  const SizedBox(height: 16),
                  const Text('Booking Confirmed!', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  const Text('Redirecting...'),
                ],
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Service Type
                    DropdownButtonFormField<String>(
                      value: _serviceType,
                      decoration: const InputDecoration(
                        labelText: 'Select Service',
                        prefixIcon: Icon(Icons.temple_hindu),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'HomamYagam', child: Text('Homam & Yagam')),
                        DropdownMenuItem(value: 'HomePooja', child: Text('Home Pooja')),
                        DropdownMenuItem(value: 'PoojaSamagri', child: Text('Pooja Samagri')),
                        DropdownMenuItem(value: 'FamilyConnect', child: Text('Family Connect')),
                      ],
                      onChanged: (v) => setState(() => _serviceType = v!),
                    ),
                    const SizedBox(height: 16),

                    // Date
                    InkWell(
                      onTap: () async {
                        final d = await showDatePicker(
                          context: context,
                          initialDate: DateTime.now().add(const Duration(days: 1)),
                          firstDate: DateTime.now(),
                          lastDate: DateTime.now().add(const Duration(days: 365)),
                        );
                        if (d != null) setState(() => _date = d);
                      },
                      child: InputDecorator(
                        decoration: const InputDecoration(
                          labelText: 'Date',
                          prefixIcon: Icon(Icons.calendar_today),
                        ),
                        child: Text(
                          _date != null ? '${_date!.day}/${_date!.month}/${_date!.year}' : 'Select date',
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Time
                    InkWell(
                      onTap: () async {
                        final t = await showTimePicker(
                          context: context,
                          initialTime: const TimeOfDay(hour: 9, minute: 0),
                        );
                        if (t != null) setState(() => _time = t);
                      },
                      child: InputDecorator(
                        decoration: const InputDecoration(
                          labelText: 'Time',
                          prefixIcon: Icon(Icons.access_time),
                        ),
                        child: Text(
                          _time != null ? _time!.format(context) : 'Select time',
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Location
                    TextFormField(
                      controller: _locationController,
                      decoration: const InputDecoration(
                        labelText: 'Location',
                        prefixIcon: Icon(Icons.location_on_outlined),
                        hintText: 'e.g., Hyderabad, Telangana',
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Notes
                    TextFormField(
                      controller: _notesController,
                      decoration: const InputDecoration(
                        labelText: 'Notes (optional)',
                        hintText: 'Any special requirements...',
                      ),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 16),

                    if (_error != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Text(_error!, style: const TextStyle(color: AppTheme.errorColor)),
                      ),

                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _submitting ? null : _submit,
                        child: Text(_submitting ? 'Submitting...' : 'Schedule Service'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
