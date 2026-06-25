import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:math' as math;
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/network/api_client.dart';
import '../../data/data_sources/booking_remote_data_source.dart';
import '../../data/repositories/booking_repository_impl.dart';
import '../../domain/repositories/booking_repository.dart';
import '../../data/models/booking_models.dart';
import 'booking_screen.dart';
import 'facility_detail_screen.dart';

class FacilityMapScreen extends StatefulWidget {
  const FacilityMapScreen({super.key});

  @override
  State<FacilityMapScreen> createState() => _FacilityMapScreenState();
}

class _FacilityMapScreenState extends State<FacilityMapScreen> {
  late final BookingRepository _repository;
  final MapController _mapController = MapController();

  List<FacilityResponse> _facilities = [];
  List<FacilityResponse> _displayedFacilities = [];
  bool _isLoading = false;
  bool _isSearching = false;
  String? _errorMessage;
  FacilityResponse? _selectedFacility;

  // User location
  LatLng? _userLocation;
  bool _locationLoading = true;

  // Search filters
  DateTime? _searchDate;
  TimeOfDay? _searchStartTime;
  TimeOfDay? _searchEndTime;
  String? _searchSportName;
  bool _hasActiveSearch = false;

  // Vietnam bounds
  final LatLngBounds _vietnamBounds = LatLngBounds(
    const LatLng(8.0, 102.0),
    const LatLng(24.0, 115.0),
  );

  @override
  void initState() {
    super.initState();
    final apiClient = ApiClient();
    final dataSource = BookingRemoteDataSource(apiClient);
    _repository = BookingRepositoryImpl(dataSource);
    _loadFacilities();
    _getUserLocation();
  }

  Future<void> _getUserLocation() async {
    setState(() => _locationLoading = true);
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() => _locationLoading = false);
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() => _locationLoading = false);
          return;
        }
      }
      if (permission == LocationPermission.deniedForever) {
        setState(() => _locationLoading = false);
        return;
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );
      if (mounted) {
        setState(() {
          _userLocation = LatLng(position.latitude, position.longitude);
          _locationLoading = false;
        });
        _mapController.move(_userLocation!, 13.0);
      }
    } catch (e) {
      if (mounted) setState(() => _locationLoading = false);
    }
  }

  Future<void> _loadFacilities() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await _repository.getAllFacilities();
      if (response.success && response.data != null) {
        setState(() {
          _facilities = response.data!;
          _displayedFacilities = _facilities;
        });
      } else {
        setState(() => _errorMessage = response.message);
      }
    } catch (e) {
      setState(() => _errorMessage = 'Lỗi kết nối máy chủ');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  double _haversineDistance(LatLng a, LatLng b) {
    const R = 6371.0; // Earth radius in km
    final dLat = _toRadians(b.latitude - a.latitude);
    final dLon = _toRadians(b.longitude - a.longitude);
    final la = _toRadians(a.latitude);
    final lb = _toRadians(b.latitude);
    final h = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(la) * math.cos(lb) * math.sin(dLon / 2) * math.sin(dLon / 2);
    return R * 2 * math.atan2(math.sqrt(h), math.sqrt(1 - h));
  }

  double _toRadians(double deg) => deg * math.pi / 180;

  void _showSearchBottomSheet() {
    // Collect all sport names from facilities
    final allSports = <String>{};
    for (final f in _facilities) {
      for (final sp in f.sportPrices) {
        allSports.add(sp.sportName);
      }
    }

    DateTime selectedDate = _searchDate ?? DateTime.now();
    TimeOfDay startTime = _searchStartTime ?? const TimeOfDay(hour: 8, minute: 0);
    TimeOfDay endTime = _searchEndTime ?? const TimeOfDay(hour: 10, minute: 0);
    String? selectedSport = _searchSportName;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            final isDark = Theme.of(ctx).brightness == Brightness.dark;
            return Padding(
              padding: EdgeInsets.fromLTRB(
                24, 16, 24, MediaQuery.of(ctx).viewInsets.bottom + 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40, height: 4,
                      margin: const EdgeInsets.only(bottom: 20),
                      decoration: BoxDecoration(
                        color: Colors.grey[400],
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const Text(
                    'TÌM SÂN NHANH',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Hệ thống sẽ tìm sân trống gần bạn nhất',
                    style: TextStyle(
                      fontSize: 13,
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Date picker
                  _buildSearchField(
                    isDark: isDark,
                    icon: Icons.calendar_today_rounded,
                    label: 'Ngày',
                    value: '${selectedDate.day.toString().padLeft(2, '0')}/${selectedDate.month.toString().padLeft(2, '0')}/${selectedDate.year}',
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: ctx,
                        initialDate: selectedDate,
                        firstDate: DateTime.now(),
                        lastDate: DateTime.now().add(const Duration(days: 60)),
                      );
                      if (picked != null) {
                        setSheetState(() => selectedDate = picked);
                      }
                    },
                  ),
                  const SizedBox(height: 12),

                  // Time pickers row
                  Row(
                    children: [
                      Expanded(
                        child: _buildSearchField(
                          isDark: isDark,
                          icon: Icons.access_time_rounded,
                          label: 'Bắt đầu',
                          value: '${startTime.hour.toString().padLeft(2, '0')}:${startTime.minute.toString().padLeft(2, '0')}',
                          onTap: () async {
                            final picked = await showTimePicker(
                              context: ctx,
                              initialTime: startTime,
                            );
                            if (picked != null) {
                              setSheetState(() => startTime = picked);
                            }
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildSearchField(
                          isDark: isDark,
                          icon: Icons.access_time_filled_rounded,
                          label: 'Kết thúc',
                          value: '${endTime.hour.toString().padLeft(2, '0')}:${endTime.minute.toString().padLeft(2, '0')}',
                          onTap: () async {
                            final picked = await showTimePicker(
                              context: ctx,
                              initialTime: endTime,
                            );
                            if (picked != null) {
                              setSheetState(() => endTime = picked);
                            }
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Sport dropdown
                  _buildSearchField(
                    isDark: isDark,
                    icon: Icons.sports_tennis_rounded,
                    label: 'Môn thể thao',
                    value: selectedSport ?? 'Tất cả',
                    onTap: () {
                      showModalBottomSheet(
                        context: ctx,
                        shape: const RoundedRectangleBorder(
                          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                        ),
                        builder: (_) {
                          return ListView(
                            shrinkWrap: true,
                            children: [
                              ListTile(
                                title: const Text('Tất cả'),
                                leading: const Icon(Icons.sports_rounded),
                                onTap: () {
                                  setSheetState(() => selectedSport = null);
                                  Navigator.pop(ctx);
                                },
                              ),
                              ...allSports.map((s) => ListTile(
                                title: Text(s),
                                leading: const Icon(Icons.sports_tennis_rounded),
                                onTap: () {
                                  setSheetState(() => selectedSport = s);
                                  Navigator.pop(ctx);
                                },
                              )),
                            ],
                          );
                        },
                      );
                    },
                  ),
                  const SizedBox(height: 24),

                  // Search button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(ctx);
                        _performAdvancedSearch(
                          selectedDate,
                          startTime,
                          endTime,
                          selectedSport,
                        );
                      },
                      icon: const Icon(Icons.search_rounded, size: 20),
                      label: const Text(
                        'TÌM KIẾM',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 14,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                        elevation: 0,
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildSearchField({
    required bool isDark,
    required IconData icon,
    required String label,
    required String value,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: isDark
              ? Colors.white.withValues(alpha: 0.06)
              : Colors.grey[100],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isDark
                ? Colors.white.withValues(alpha: 0.1)
                : Colors.grey[300]!,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, size: 18, color: AppTheme.primaryColor),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.grey[500] : Colors.grey[500],
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    value,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right_rounded,
              size: 18,
              color: isDark ? Colors.grey[500] : Colors.grey[400],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _performAdvancedSearch(
    DateTime date,
    TimeOfDay startTime,
    TimeOfDay endTime,
    String? sportName,
  ) async {
    setState(() {
      _isSearching = true;
      _searchDate = date;
      _searchStartTime = startTime;
      _searchEndTime = endTime;
      _searchSportName = sportName;
      _hasActiveSearch = true;
      _selectedFacility = null;
    });

    final searchStart = DateTime(
      date.year, date.month, date.day, startTime.hour, startTime.minute,
    );
    final searchEnd = DateTime(
      date.year, date.month, date.day, endTime.hour, endTime.minute,
    );

    // Filter by sport first
    List<FacilityResponse> candidates = _facilities;
    if (sportName != null) {
      candidates = candidates.where((f) {
        return f.sportPrices.any(
          (sp) => sp.sportName.toLowerCase() == sportName.toLowerCase(),
        );
      }).toList();
    }

    // Check availability for each candidate
    final List<_ScoredFacility> scoredResults = [];

    for (final facility in candidates) {
      try {
        final availResponse = await _repository.getCourtAvailabilities(
          facility.facilityId,
          date,
        );
        if (availResponse.success && availResponse.data != null) {
          // Filter courts by sport if specified
          var courts = availResponse.data!;
          if (sportName != null) {
            courts = courts.where((c) =>
              c.sportName.toLowerCase() == sportName.toLowerCase()
            ).toList();
          }

          // Check if any court has available slots in the time range
          bool hasAvailableSlot = false;
          for (final court in courts) {
            if (!court.isActive) continue;
            for (final slot in court.timeSlots) {
              if (slot.status.toLowerCase() != 'available') continue;
              final slotStart = DateTime.parse(slot.startTime);
              final slotEnd = DateTime.parse(slot.endTime);
              // Check if slot overlaps with search range
              if (slotStart.isBefore(searchEnd) && slotEnd.isAfter(searchStart)) {
                hasAvailableSlot = true;
                break;
              }
            }
            if (hasAvailableSlot) break;
          }

          if (hasAvailableSlot) {
            double distance = 0;
            if (_userLocation != null &&
                facility.latitude != null &&
                facility.longitude != null) {
              distance = _haversineDistance(
                _userLocation!,
                LatLng(facility.latitude!, facility.longitude!),
              );
            }
            scoredResults.add(_ScoredFacility(facility: facility, distance: distance));
          }
        }
      } catch (_) {
        // Skip facilities that fail to load
      }
    }

    // Sort: by distance (nearest first)
    scoredResults.sort((a, b) => a.distance.compareTo(b.distance));

    if (mounted) {
      setState(() {
        _displayedFacilities = scoredResults.map((s) => s.facility).toList();
        _isSearching = false;
      });

      // Zoom to show results
      if (scoredResults.isNotEmpty && scoredResults.first.facility.latitude != null) {
        _mapController.move(
          LatLng(
            scoredResults.first.facility.latitude!,
            scoredResults.first.facility.longitude!,
          ),
          13.0,
        );
      }
    }
  }

  void _clearSearch() {
    setState(() {
      _hasActiveSearch = false;
      _displayedFacilities = _facilities;
      _searchDate = null;
      _searchStartTime = null;
      _searchEndTime = null;
      _searchSportName = null;
      _selectedFacility = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'BẢN ĐỒ ĐẶT SÂN',
          style: TextStyle(fontWeight: FontWeight.w900),
        ),
        actions: [
          IconButton(
            tooltip: 'Lịch sử đặt sân',
            icon: const Icon(
              Icons.history_rounded,
              color: AppTheme.primaryColor,
            ),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const BookingScreen()),
              );
            },
          ),
          IconButton(
            tooltip: 'Làm mới',
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () {
              _clearSearch();
              _loadFacilities();
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          // Map
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _userLocation ?? const LatLng(16.047079, 108.206230),
              initialZoom: _userLocation != null ? 13.0 : 6.0,
              minZoom: 5.0,
              maxZoom: 18.0,
              cameraConstraint: CameraConstraint.containCenter(
                bounds: _vietnamBounds,
              ),
              onTap: (pos, point) {
                setState(() => _selectedFacility = null);
              },
            ),
            children: [
              // Tile layer
              TileLayer(
                urlTemplate:
                    'https://mt1.google.com/vt/lyrs=m&hl=vi&gl=VN&x={x}&y={y}&z={z}',
                userAgentPackageName: 'com.smashhub.app.smashhub',
                tileBuilder: isDark
                    ? (context, tileWidget, tile) {
                        return ColorFiltered(
                          colorFilter: const ColorFilter.matrix([
                            -0.213, -0.715, -0.072, 0, 255,
                            -0.213, -0.715, -0.072, 0, 255,
                            -0.213, -0.715, -0.072, 0, 255,
                            0, 0, 0, 1, 0,
                          ]),
                          child: tileWidget,
                        );
                      }
                    : null,
              ),

              // Sovereignty markers
              MarkerLayer(
                markers: [
                  Marker(
                    point: const LatLng(16.5400, 112.1200),
                    width: 320, height: 50,
                    child: Center(
                      child: Text(
                        'Quần Đảo Hoàng Sa (Việt Nam)',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 16, fontWeight: FontWeight.w900,
                          color: isDark ? Colors.red[300] : Colors.red[800],
                          shadows: const [
                            Shadow(color: Colors.white, offset: Offset(-1, -1), blurRadius: 2),
                            Shadow(color: Colors.white, offset: Offset(1, -1), blurRadius: 2),
                            Shadow(color: Colors.white, offset: Offset(1, 1), blurRadius: 2),
                            Shadow(color: Colors.white, offset: Offset(-1, 1), blurRadius: 2),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Marker(
                    point: const LatLng(13.5000, 112.5000),
                    width: 320, height: 50,
                    child: Center(
                      child: Text(
                        'Biển Đông (South Sea)',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 16, fontWeight: FontWeight.w900,
                          fontStyle: FontStyle.italic,
                          color: isDark ? Colors.blue[300] : Colors.blue[800],
                          shadows: const [
                            Shadow(color: Colors.white, offset: Offset(-1, -1), blurRadius: 2),
                            Shadow(color: Colors.white, offset: Offset(1, -1), blurRadius: 2),
                            Shadow(color: Colors.white, offset: Offset(1, 1), blurRadius: 2),
                            Shadow(color: Colors.white, offset: Offset(-1, 1), blurRadius: 2),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Marker(
                    point: const LatLng(8.6480, 111.9190),
                    width: 320, height: 50,
                    child: Center(
                      child: Text(
                        'Quần Đảo Trường Sa (Việt Nam)',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 16, fontWeight: FontWeight.w900,
                          color: isDark ? Colors.red[300] : Colors.red[800],
                          shadows: const [
                            Shadow(color: Colors.white, offset: Offset(-1, -1), blurRadius: 2),
                            Shadow(color: Colors.white, offset: Offset(1, -1), blurRadius: 2),
                            Shadow(color: Colors.white, offset: Offset(1, 1), blurRadius: 2),
                            Shadow(color: Colors.white, offset: Offset(-1, 1), blurRadius: 2),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              // User location marker
              if (_userLocation != null)
                MarkerLayer(
                  markers: [
                    Marker(
                      point: _userLocation!,
                      width: 40, height: 40,
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.blue,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.blue.withValues(alpha: 0.4),
                              blurRadius: 12,
                              spreadRadius: 4,
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.my_location_rounded,
                          color: Colors.white,
                          size: 18,
                        ),
                      ),
                    ),
                  ],
                ),

              // Facility markers
              MarkerLayer(
                markers: _displayedFacilities
                    .where((f) => f.latitude != null && f.longitude != null)
                    .map((f) {
                  final isSelected =
                      _selectedFacility?.facilityId == f.facilityId;
                  return Marker(
                    point: LatLng(f.latitude!, f.longitude!),
                    width: 50, height: 50,
                    child: GestureDetector(
                      onTap: () {
                        setState(() => _selectedFacility = f);
                        _mapController.move(
                          LatLng(f.latitude!, f.longitude!),
                          14.0,
                        );
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppTheme.primaryColor
                              : isDark
                                  ? AppTheme.darkSurfaceColor
                                      .withValues(alpha: 0.8)
                                  : Colors.white.withValues(alpha: 0.8),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isSelected
                                ? Colors.white
                                : AppTheme.primaryColor,
                            width: 2,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: AppTheme.primaryColor
                                  .withValues(alpha: 0.4),
                              blurRadius: 8,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: Icon(
                          Icons.sports_tennis_rounded,
                          color: isSelected
                              ? Colors.black
                              : AppTheme.primaryColor,
                          size: 24,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),

          // Loading overlay
          if (_isLoading || _isSearching)
            Positioned.fill(
              child: Container(
                color: Colors.black.withValues(alpha: 0.3),
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(
                          AppTheme.primaryColor,
                        ),
                      ),
                      if (_isSearching) ...[
                        const SizedBox(height: 12),
                        const Text(
                          'Đang tìm sân trống...',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),

          // Error banner
          if (_errorMessage != null)
            Positioned(
              top: 16, left: 16, right: 16,
              child: Card(
                color: Colors.red[800],
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, color: Colors.white),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white),
                        onPressed: () => setState(() => _errorMessage = null),
                      ),
                    ],
                  ),
                ),
              ),
            ),

          // Search bar floating at top
          Positioned(
            top: 12, left: 16, right: 16,
            child: Column(
              children: [
                Material(
                  elevation: 4,
                  borderRadius: BorderRadius.circular(14),
                  color: isDark ? AppTheme.darkSurfaceColor : Colors.white,
                  child: InkWell(
                    borderRadius: BorderRadius.circular(14),
                    onTap: _showSearchBottomSheet,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 14,
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.search_rounded,
                            color: AppTheme.primaryColor,
                            size: 22,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              _hasActiveSearch
                                  ? 'Tìm thấy ${_displayedFacilities.length} sân phù hợp'
                                  : 'Tìm sân nhanh theo thời gian...',
                              style: TextStyle(
                                fontSize: 14,
                                color: _hasActiveSearch
                                    ? (isDark ? Colors.white : Colors.black87)
                                    : (isDark ? Colors.grey[500] : Colors.grey[400]),
                                fontWeight: _hasActiveSearch
                                    ? FontWeight.w700
                                    : FontWeight.normal,
                              ),
                            ),
                          ),
                          if (_hasActiveSearch)
                            GestureDetector(
                              onTap: _clearSearch,
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  color: Colors.red.withValues(alpha: 0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.close_rounded,
                                  size: 16,
                                  color: Colors.red,
                                ),
                              ),
                            )
                          else
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: AppTheme.primaryColor
                                    .withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text(
                                'Tìm nâng cao',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.primaryColor,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // My location button
          Positioned(
            right: 16,
            bottom: _selectedFacility != null ? 220 : 24,
            child: Column(
              children: [
                FloatingActionButton.small(
                  heroTag: 'my_location',
                  backgroundColor:
                      isDark ? AppTheme.darkSurfaceColor : Colors.white,
                  onPressed: () {
                    if (_userLocation != null) {
                      _mapController.move(_userLocation!, 15.0);
                    } else {
                      _getUserLocation();
                    }
                  },
                  child: Icon(
                    _locationLoading
                        ? Icons.gps_not_fixed_rounded
                        : Icons.my_location_rounded,
                    color: AppTheme.primaryColor,
                    size: 20,
                  ),
                ),
              ],
            ),
          ),

          // Bottom card for selected facility
          if (_selectedFacility != null)
            Positioned(
              bottom: 16, left: 16, right: 16,
              child: Card(
                elevation: 10,
                color: isDark ? AppTheme.darkSurfaceColor : Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              _selectedFacility!.name ?? 'Cơ sở không tên',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w900,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryColor
                                  .withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '${_selectedFacility!.courtCount} Sân',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.primaryColor,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          const Icon(
                            Icons.location_on_rounded,
                            size: 16, color: Colors.grey,
                          ),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              _selectedFacility!.address ?? 'Chưa cập nhật địa chỉ',
                              style: const TextStyle(
                                color: Colors.grey, fontSize: 13,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      if (_selectedFacility!.sportPrices.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        const Divider(),
                        const SizedBox(height: 4),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Giá dao động:',
                                  style: TextStyle(
                                    color: Colors.grey, fontSize: 12,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '${_selectedFacility!.sportPrices.first.minPrice.toStringAsFixed(0)} - ${_selectedFacility!.sportPrices.first.maxPrice.toStringAsFixed(0)} VND/h',
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.primaryColor,
                                  ),
                                ),
                              ],
                            ),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primaryColor,
                                foregroundColor: Colors.black,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 24, vertical: 12,
                                ),
                              ),
                              onPressed: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => FacilityDetailScreen(
                                      facilityId:
                                          _selectedFacility!.facilityId,
                                    ),
                                  ),
                                );
                              },
                              child: const Text(
                                'ĐẶT SÂN',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _ScoredFacility {
  final FacilityResponse facility;
  final double distance;
  _ScoredFacility({required this.facility, required this.distance});
}
