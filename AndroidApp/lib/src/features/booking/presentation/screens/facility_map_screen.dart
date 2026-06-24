import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
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
  bool _isLoading = false;
  String? _errorMessage;
  FacilityResponse? _selectedFacility;

  // Giới hạn bản đồ ở khu vực Việt Nam
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
        });
      } else {
        setState(() {
          _errorMessage = response.message;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Lỗi kết nối máy chủ';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
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
              Navigator.of(
                context,
              ).push(MaterialPageRoute(builder: (_) => const BookingScreen()));
            },
          ),
          IconButton(
            tooltip: 'Làm mới',
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _loadFacilities,
          ),
        ],
      ),
      body: Stack(
        children: [
          // Bản đồ chính
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: const LatLng(16.047079, 108.206230), // Đà Nẵng
              initialZoom: 6.0,
              minZoom: 5.0,
              maxZoom: 18.0,
              cameraConstraint: CameraConstraint.containCenter(
                bounds: _vietnamBounds,
              ),
              onTap: (pos, point) {
                setState(() {
                  _selectedFacility = null;
                });
              },
            ),
            children: [
              // Lớp nền bản đồ (Google Maps)
              TileLayer(
                urlTemplate:
                    'https://mt1.google.com/vt/lyrs=m&hl=vi&gl=VN&x={x}&y={y}&z={z}',
                userAgentPackageName: 'com.smashhub.app.smashhub',
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

              // Lớp Markers của các Cơ sở Thể Thao (Facilities)
              MarkerLayer(
                markers: _facilities
                    .where((f) => f.latitude != null && f.longitude != null)
                    .map((f) {
                      final isSelected =
                          _selectedFacility?.facilityId == f.facilityId;
                      return Marker(
                        point: LatLng(f.latitude!, f.longitude!),
                        width: 50,
                        height: 50,
                        child: GestureDetector(
                          onTap: () {
                            setState(() {
                              _selectedFacility = f;
                            });
                            // Centering camera to clicked facility
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
                                  ? AppTheme.darkSurfaceColor.withValues(
                                      alpha: 0.8,
                                    )
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
                                  color: AppTheme.primaryColor.withValues(
                                    alpha: 0.4,
                                  ),
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
                    })
                    .toList(),
              ),
            ],
          ),

          // Loading Indicator
          if (_isLoading)
            Positioned.fill(
              child: Container(
                color: Colors.black.withValues(alpha: 0.3),
                child: const Center(
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(
                      AppTheme.primaryColor,
                    ),
                  ),
                ),
              ),
            ),

          // Error Message Banner
          if (_errorMessage != null)
            Positioned(
              top: 16,
              left: 16,
              right: 16,
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
                        onPressed: () {
                          setState(() {
                            _errorMessage = null;
                          });
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ),

          // Bottom card showing selected facility information
          if (_selectedFacility != null)
            Positioned(
              bottom: 16,
              left: 16,
              right: 16,
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
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryColor.withValues(
                                alpha: 0.15,
                              ),
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
                            size: 16,
                            color: Colors.grey,
                          ),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              _selectedFacility!.address ??
                                  'Chưa cập nhật địa chỉ',
                              style: const TextStyle(
                                color: Colors.grey,
                                fontSize: 13,
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
                                    color: Colors.grey,
                                    fontSize: 12,
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
                                  horizontal: 24,
                                  vertical: 12,
                                ),
                              ),
                              onPressed: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => FacilityDetailScreen(
                                      facilityId: _selectedFacility!.facilityId,
                                    ),
                                  ),
                                );
                              },
                              child: const Text(
                                'XEM CHI TIẾT',
                                style: TextStyle(fontWeight: FontWeight.bold),
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
