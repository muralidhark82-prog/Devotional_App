import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';

class CompleteProfilePage extends StatefulWidget {
  const CompleteProfilePage({super.key});

  @override
  State<CompleteProfilePage> createState() => _CompleteProfilePageState();
}

class _CompleteProfilePageState extends State<CompleteProfilePage> {
  final _formKey = GlobalKey<FormState>();
  final _gotraController = TextEditingController();
  final _placeOfBirthController = TextEditingController();
  TimeOfDay? _timeOfBirth;
  String? _selectedNakshatra;
  String? _selectedRashi;
  DateTime? _dateOfBirth;
  String _languagePreference = 'en';

  final List<String> _nakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
  ];

  final List<String> _rashis = [
    'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)',
    'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)',
    'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)',
  ];

  @override
  void dispose() {
    _gotraController.dispose();
    _placeOfBirthController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Complete Profile'),
        actions: [
          TextButton(
            onPressed: () => context.go('/home'),
            child: const Text('Skip'),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Progress indicator
                Row(
                  children: [
                    Expanded(
                      child: LinearProgressIndicator(
                        value: 0.7,
                        backgroundColor: Colors.grey.shade200,
                        valueColor: const AlwaysStoppedAnimation(AppTheme.primaryColor),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text('70%', style: TextStyle(fontWeight: FontWeight.w600)),
                  ],
                ),
                const SizedBox(height: 24),
                
                Text('Spiritual Details', style: Theme.of(context).textTheme.displaySmall),
                const SizedBox(height: 8),
                Text(
                  'This helps us personalize poojas and auspicious timings for you',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 24),
                
                // Date of Birth
                InkWell(
                  onTap: _selectDateOfBirth,
                  child: InputDecorator(
                    decoration: const InputDecoration(
                      labelText: 'Date of Birth',
                      prefixIcon: Icon(Icons.calendar_today),
                    ),
                    child: Text(
                      _dateOfBirth != null
                          ? '${_dateOfBirth!.day}/${_dateOfBirth!.month}/${_dateOfBirth!.year}'
                          : 'Select date',
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Place of Birth
                TextFormField(
                  controller: _placeOfBirthController,
                  decoration: const InputDecoration(
                    labelText: 'Place of Birth',
                    prefixIcon: Icon(Icons.location_on_outlined),
                    hintText: 'e.g., Hyderabad, Varanasi',
                  ),
                  textCapitalization: TextCapitalization.words,
                ),
                const SizedBox(height: 16),

                // Time of Birth
                InkWell(
                  onTap: _selectTimeOfBirth,
                  child: InputDecorator(
                    decoration: const InputDecoration(
                      labelText: 'Time of Birth',
                      prefixIcon: Icon(Icons.access_time),
                    ),
                    child: Text(
                      _timeOfBirth != null
                          ? _timeOfBirth!.format(context)
                          : 'Select time',
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                
                // Gotra
                TextFormField(
                  controller: _gotraController,
                  decoration: const InputDecoration(
                    labelText: 'Gotra',
                    prefixIcon: Icon(Icons.family_restroom),
                    hintText: 'e.g., Bharadwaj, Kashyap',
                  ),
                  textCapitalization: TextCapitalization.words,
                ),
                const SizedBox(height: 16),
                
                // Nakshatra
                DropdownButtonFormField<String>(
                  value: _selectedNakshatra,
                  decoration: const InputDecoration(
                    labelText: 'Birth Nakshatra',
                    prefixIcon: Icon(Icons.star_outline),
                  ),
                  items: _nakshatras.map((n) => DropdownMenuItem(value: n, child: Text(n))).toList(),
                  onChanged: (v) => setState(() => _selectedNakshatra = v),
                ),
                const SizedBox(height: 16),
                
                // Rashi
                DropdownButtonFormField<String>(
                  value: _selectedRashi,
                  decoration: const InputDecoration(
                    labelText: 'Rashi (Moon Sign)',
                    prefixIcon: Icon(Icons.circle_outlined),
                  ),
                  items: _rashis.map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
                  onChanged: (v) => setState(() => _selectedRashi = v),
                ),
                const SizedBox(height: 16),
                
                // Language
                DropdownButtonFormField<String>(
                  value: _languagePreference,
                  decoration: const InputDecoration(
                    labelText: 'Preferred Language',
                    prefixIcon: Icon(Icons.language),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'en', child: Text('English')),
                    DropdownMenuItem(value: 'hi', child: Text('हिन्दी (Hindi)')),
                    DropdownMenuItem(value: 'te', child: Text('తెలుగు (Telugu)')),
                    DropdownMenuItem(value: 'ta', child: Text('தமிழ் (Tamil)')),
                    DropdownMenuItem(value: 'kn', child: Text('ಕನ್ನಡ (Kannada)')),
                    DropdownMenuItem(value: 'ml', child: Text('മലയാളം (Malayalam)')),
                  ],
                  onChanged: (v) => setState(() => _languagePreference = v ?? 'en'),
                ),
                const SizedBox(height: 32),
                
                // Complete button
                ElevatedButton(
                  onPressed: _handleComplete,
                  child: const Text('Complete Profile'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _selectDateOfBirth() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime(2000, 1, 1),
      firstDate: DateTime(1920),
      lastDate: DateTime.now(),
    );
    if (date != null) {
      setState(() => _dateOfBirth = date);
    }
  }

  Future<void> _selectTimeOfBirth() async {
    final time = await showTimePicker(
      context: context,
      initialTime: _timeOfBirth ?? const TimeOfDay(hour: 6, minute: 0),
    );
    if (time != null) {
      setState(() => _timeOfBirth = time);
    }
  }

  void _handleComplete() {
    // TODO: Save profile to backend
    context.go('/home');
  }
}
