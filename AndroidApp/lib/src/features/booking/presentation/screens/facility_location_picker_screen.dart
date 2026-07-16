import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import '../../../../shared/theme/app_theme.dart';

class FacilityLocationPickerScreen extends StatefulWidget {
  final double initialLat;
  final double initialLng;

  const FacilityLocationPickerScreen({
    super.key,
    this.initialLat = 16.047079,
    this.initialLng = 108.206230,
  });

  @override
  State<FacilityLocationPickerScreen> createState() =>
      _FacilityLocationPickerScreenState();
}

class _FacilityLocationPickerScreenState
    extends State<FacilityLocationPickerScreen> {
  late final MapController _mapController;
  LatLng? _selectedLocation;
  LatLng? _currentUserLocation;
  bool _showLocationProposal = false;
  bool _isLocating = false;

  // Giới hạn bản đồ ở khu vực Việt Nam
  final LatLngBounds _vietnamBounds = LatLngBounds(
    const LatLng(8.0, 102.0),
    const LatLng(24.0, 115.0),
  );

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _determineAndProposeLocation();
    });
  }

  Future<void> _determineAndProposeLocation() async {
    setState(() {
      _isLocating = true;
    });

    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() => _isLocating = false);
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        // Prominent Disclosure before requesting permission
        if (mounted) {
          final shouldRequest = await showDialog<bool>(
            context: context,
            builder: (ctx) => AlertDialog(
              title: const Text("Cấp quyền vị trí"),
              content: const Text(
                "SmashHub cần quyền truy cập vị trí của bạn để tìm kiếm và đề xuất các sân cầu lông, cũng như các đối thủ ở gần bạn trên bản đồ.",
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(ctx).pop(false),
                  child: const Text("Từ chối"),
                ),
                ElevatedButton(
                  onPressed: () => Navigator.of(ctx).pop(true),
                  child: const Text("Đồng ý"),
                ),
              ],
            ),
          );
          if (shouldRequest != true) {
            setState(() => _isLocating = false);
            return;
          }
        }
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() => _isLocating = false);
          return;
        }
      }
      if (permission == LocationPermission.deniedForever) {
        setState(() => _isLocating = false);
        return;
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );

      if (mounted) {
        final loc = LatLng(position.latitude, position.longitude);
        setState(() {
          _currentUserLocation = loc;
          _selectedLocation = loc;
          _showLocationProposal = true;
          _isLocating = false;
        });
        _mapController.move(loc, 15.0);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLocating = false);
      }
    }
  }

  void _handleTap(TapPosition tapPosition, LatLng latlng) {
    setState(() {
      _selectedLocation = latlng;
      _showLocationProposal = false;
    });

    _showConfirmationDialog(latlng);
  }

  void _showConfirmationDialog(LatLng location) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: const Text(
            'Xác nhận vị trí',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          content: Text(
            'Bạn có chắc chắn muốn chọn vị trí này?\n\nVĩ độ: ${location.latitude.toStringAsFixed(6)}\nKinh độ: ${location.longitude.toStringAsFixed(6)}',
            style: const TextStyle(height: 1.5),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(); // Close dialog
                setState(() {
                  _selectedLocation = null; // Reset marker if cancelled
                });
              },
              child: const Text('Hủy', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop(); // Close dialog
                Navigator.of(
                  context,
                ).pop(location); // Return to previous screen with location
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryColor,
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text('Đồng ý'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Chọn vị trí cơ sở'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 1,
      ),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: LatLng(widget.initialLat, widget.initialLng),
              initialZoom: 13.0,
              minZoom: 5.0,
              maxZoom: 18.0,
              cameraConstraint: CameraConstraint.containCenter(
                bounds: _vietnamBounds,
              ),
              onTap: _handleTap,
            ),
            children: [
              // Lớp nền bản đồ (Google Maps)
              TileLayer(
                urlTemplate:
                    'https://mt1.google.com/vt/lyrs=m&hl=vi&gl=VN&x={x}&y={y}&z={z}',
                userAgentPackageName: 'com.smashclub.app',
                tileBuilder: isDark
                    ? (context, tileWidget, tile) {
                        // Tạo hiệu ứng màu tối cho bản đồ
                        return ColorFiltered(
                          colorFilter: const ColorFilter.matrix([
                            -0.213,
                            -0.715,
                            -0.072,
                            0,
                            255,
                            -0.213,
                            -0.715,
                            -0.072,
                            0,
                            255,
                            -0.213,
                            -0.715,
                            -0.072,
                            0,
                            255,
                            0,
                            0,
                            0,
                            1,
                            0,
                          ]),
                          child: tileWidget,
                        );
                      }
                    : null,
              ),
              // Lớp hiển thị Chủ quyền Biển Đảo (Hoàng Sa - Trường Sa - Biển Đông)
              MarkerLayer(
                markers: [
                  // Quần đảo Hoàng Sa
                  Marker(
                    point: const LatLng(16.5400, 112.1200),
                    width: 320,
                    height: 50,
                    child: Center(
                      child: Text(
                        'Quần Đảo Hoàng Sa (Việt Nam)',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: isDark ? Colors.red[300] : Colors.red[800],
                          shadows: const [
                            Shadow(
                              color: Colors.white,
                              offset: Offset(-1, -1),
                              blurRadius: 2,
                            ),
                            Shadow(
                              color: Colors.white,
                              offset: Offset(1, -1),
                              blurRadius: 2,
                            ),
                            Shadow(
                              color: Colors.white,
                              offset: Offset(1, 1),
                              blurRadius: 2,
                            ),
                            Shadow(
                              color: Colors.white,
                              offset: Offset(-1, 1),
                              blurRadius: 2,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  // Biển Đông
                  Marker(
                    point: const LatLng(13.5000, 112.5000),
                    width: 320,
                    height: 50,
                    child: Center(
                      child: Text(
                        'Biển Đông (South Sea)',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          fontStyle: FontStyle.italic,
                          color: isDark ? Colors.blue[300] : Colors.blue[800],
                          shadows: const [
                            Shadow(
                              color: Colors.white,
                              offset: Offset(-1, -1),
                              blurRadius: 2,
                            ),
                            Shadow(
                              color: Colors.white,
                              offset: Offset(1, -1),
                              blurRadius: 2,
                            ),
                            Shadow(
                              color: Colors.white,
                              offset: Offset(1, 1),
                              blurRadius: 2,
                            ),
                            Shadow(
                              color: Colors.white,
                              offset: Offset(-1, 1),
                              blurRadius: 2,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  // Quần đảo Trường Sa
                  Marker(
                    point: const LatLng(8.6480, 111.9190),
                    width: 320,
                    height: 50,
                    child: Center(
                      child: Text(
                        'Quần Đảo Trường Sa (Việt Nam)',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: isDark ? Colors.red[300] : Colors.red[800],
                          shadows: const [
                            Shadow(
                              color: Colors.white,
                              offset: Offset(-1, -1),
                              blurRadius: 2,
                            ),
                            Shadow(
                              color: Colors.white,
                              offset: Offset(1, -1),
                              blurRadius: 2,
                            ),
                            Shadow(
                              color: Colors.white,
                              offset: Offset(1, 1),
                              blurRadius: 2,
                            ),
                            Shadow(
                              color: Colors.white,
                              offset: Offset(-1, 1),
                              blurRadius: 2,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              if (_selectedLocation != null)
                MarkerLayer(
                  markers: [
                    Marker(
                      point: _selectedLocation!,
                      width: 40,
                      height: 40,
                      child: const Icon(
                        Icons.location_on,
                        color: Colors.red,
                        size: 40,
                      ),
                    ),
                  ],
                ),
            ],
          ),
          if (_showLocationProposal && _currentUserLocation != null)
            Positioned(
              left: 16,
              right: 16,
              bottom: 80,
              child: Card(
                elevation: 6,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                color: isDark ? AppTheme.darkSurfaceColor : Colors.white,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.my_location, color: AppTheme.primaryColor),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Định vị vị trí hiện tại',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 15,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Bạn có muốn chọn địa điểm hiện tại làm vị trí cơ sở không?',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: isDark ? Colors.grey[300] : Colors.grey[700],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          TextButton(
                            onPressed: () {
                              setState(() {
                                _showLocationProposal = false;
                                _selectedLocation = null;
                              });
                            },
                            child: const Text(
                              'Chọn vị trí khác',
                              style: TextStyle(color: Colors.grey),
                            ),
                          ),
                          const SizedBox(width: 12),
                          ElevatedButton(
                            onPressed: () {
                              Navigator.of(context).pop(_currentUserLocation);
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.primaryColor,
                              foregroundColor: Colors.black,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            child: const Text('Đồng ý'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          if (_isLocating)
            Positioned.fill(
              child: Container(
                color: Colors.black.withValues(alpha: 0.3),
                child: const Center(
                  child: Card(
                    child: Padding(
                      padding: EdgeInsets.all(24.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircularProgressIndicator(
                            valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
                          ),
                          SizedBox(height: 16),
                          Text(
                            'Đang định vị vị trí...',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          _mapController.move(
            LatLng(widget.initialLat, widget.initialLng),
            13.0,
          );
        },
        backgroundColor: AppTheme.primaryColor,
        child: const Icon(Icons.my_location),
      ),
    );
  }
}
