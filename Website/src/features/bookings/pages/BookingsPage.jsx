import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Filter, CalendarDays, Plus, Grid, List, Activity, Circle, Users, Flame, MapPin, Search, Navigation, ChevronRight, ArrowLeft, Clock } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import CourtCard from '../components/CourtCard';
import Button from '../../../components/ui/Button';

import BookingModal from '../components/BookingModal';
import { useFacility } from '../hooks/useBookings';
import { getAllSportsAPI } from '../api/bookings.api';

// React Leaflet imports
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';

// Fix Leaflet marker icons issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Facility Pins
const facilityMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-emerald.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// User live pulsing pin
const userMarkerIcon = L.divIcon({
  className: 'user-live-marker',
  html: `
    <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: #3b82f6; opacity: 0.4; transform: scale(1); animation: pulse 2s infinite;"></div>
      <div style="position: absolute; width: 12px; height: 12px; border-radius: 50%; background-color: #1d4ed8; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.4);"></div>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: scale(0.9); opacity: 0.6; }
        50% { transform: scale(1.8); opacity: 0; }
        100% { transform: scale(0.9); opacity: 0; }
      }
    </style>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

// Island Markers for sovereignty requirements
const hoangSaIcon = L.divIcon({
  className: 'custom-island-label',
  html: '<div style="font-weight: 900; color: #b91c1c; text-shadow: 2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff; font-size: 14px; white-space: nowrap;">Hoàng Sa (Việt Nam)</div>',
  iconSize: [150, 20],
  iconAnchor: [75, 10]
});

const truongSaIcon = L.divIcon({
  className: 'custom-island-label',
  html: '<div style="font-weight: 900; color: #b91c1c; text-shadow: 2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff; font-size: 14px; white-space: nowrap;">Trường Sa (Việt Nam)</div>',
  iconSize: [150, 20],
  iconAnchor: [75, 10]
});

const southSeaIcon = L.divIcon({
  className: 'custom-sea-label',
  html: '<div style="font-weight: bold; color: #1d4ed8; text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff; font-size: 16px; font-style: italic; white-space: nowrap;">Biển Đông (South Sea)</div>',
  iconSize: [200, 20],
  iconAnchor: [100, 10]
});

// Map helper to center dynamically
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
}

export default function BookingsPage() {
  const [viewMode, setViewMode] = useState('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);

  const { facilities, fetchFacilities, fetchFilteredFacilities, loading } = useFacility();

  // General States for Map / Geolocation
  const [isMapView, setIsMapView] = useState(false);
  const [selectedMapFacility, setSelectedMapFacility] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [watchId, setWatchId] = useState(null);

  // Dynamic Sports State
  const [sports, setSports] = useState([]);

  // Normal List View Filter State
  const [filterSportId, setFilterSportId] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');

  // Map View Filter State (Bottom Bar)
  const [mapFilterDate, setMapFilterDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [mapFilterStartTime, setMapFilterStartTime] = useState('');
  const [mapFilterEndTime, setMapFilterEndTime] = useState('');
  const [mapFilterSportId, setMapFilterSportId] = useState('');

  // Load facilities and sports on mount
  useEffect(() => {
    fetchFacilities();

    const loadSports = async () => {
      try {
        const res = await getAllSportsAPI();
        setSports(res.data || res || []);
      } catch (err) {
        console.error("Lỗi khi tải môn thể thao:", err);
      }
    };
    loadSports();
  }, [fetchFacilities]);

  // Clean up position watcher on unmount
  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Live geolocation watcher
  const startTrackingLocation = (initialLat, initialLng) => {
    if (!navigator.geolocation) return;

    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });
      },
      (err) => {
        console.warn("Lỗi cập nhật định vị real-time:", err);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );
    setWatchId(id);
  };

  const handleFindNearest = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt của bạn không hỗ trợ định vị (Geolocation).");
      return;
    }

    setIsMapView(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });

        // Build proximity queries
        const params = {
          latitude: lat,
          longitude: lng,
        };
        if (mapFilterSportId) params.sportId = parseInt(mapFilterSportId);
        if (mapFilterDate) params.date = mapFilterDate;
        if (mapFilterStartTime) params.startTime = mapFilterStartTime;
        if (mapFilterEndTime) params.endTime = mapFilterEndTime;

        fetchFilteredFacilities(params);

        // Turn on real-time tracking
        startTrackingLocation(lat, lng);
      },
      (err) => {
        toast.error("Vui lòng cho phép quyền truy cập vị trí để chuyển sang bản đồ.");

        // Load default facilities without coords
        const params = {};
        if (mapFilterSportId) params.sportId = parseInt(mapFilterSportId);
        if (mapFilterDate) params.date = mapFilterDate;
        if (mapFilterStartTime) params.startTime = mapFilterStartTime;
        if (mapFilterEndTime) params.endTime = mapFilterEndTime;
        fetchFilteredFacilities(params);
      }
    );
  };

  // Trigger search on normal list view
  const handleListSearch = () => {
    const params = {};
    if (filterSportId) params.sportId = parseInt(filterSportId);
    if (filterCity) params.city = filterCity;
    if (filterDistrict) params.district = filterDistrict;

    fetchFilteredFacilities(params);
  };

  // Trigger search on bottom bar of Map View
  const handleMapSearch = () => {
    const params = {};
    if (userLocation) {
      params.latitude = userLocation.lat;
      params.longitude = userLocation.lng;
    }
    if (mapFilterSportId) params.sportId = parseInt(mapFilterSportId);
    if (mapFilterDate) params.date = mapFilterDate;
    if (mapFilterStartTime) params.startTime = mapFilterStartTime;
    if (mapFilterEndTime) params.endTime = mapFilterEndTime;

    fetchFilteredFacilities(params);
  };

  const handleBookNow = (facility) => {
    setSelectedFacility(facility);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-[#0a0d14] transition-colors duration-300">
      <Sidebar activeMenu="Bookings" />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-10">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-[40px] font-bold font-display text-[#1e293b] dark:text-white mb-3 tracking-tight">
                Đặt sân
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                Theo dõi trạng thái và điều phối lịch đặt sân cho các thành viên trong thời gian thực.
              </p>
            </div>

            {isMapView ? (
              <Button
                onClick={() => {
                  setIsMapView(false);
                  setSelectedMapFacility(null);
                  if (watchId) {
                    navigator.geolocation.clearWatch(watchId);
                    setWatchId(null);
                  }
                  fetchFacilities();
                }}
                variant="outline"
                className="shrink-0 flex items-center gap-2 px-8 py-3.5 rounded-full text-base border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
              >
                <List size={20} />
                <span>Xem dạng danh sách</span>
              </Button>
            ) : (
              <Button
                onClick={handleFindNearest}
                className="shrink-0 flex items-center gap-2 px-8 py-3.5 rounded-full text-base shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-shadow"
              >
                <MapPin size={20} />
                <span>Tìm sân gần tôi</span>
              </Button>
            )}
          </div>

          {isMapView ? (
            /* ------------------- MAP VIEW VIEWPORT ------------------- */
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-280px)] min-h-[500px]">

              {/* Left: Map Container & Bottom filter bar */}
              <div className="flex-1 flex flex-col gap-4 h-full min-h-[300px]">

                {/* Map Area */}
                <div className="flex-1 bg-white dark:bg-card-dark border border-gray-100 dark:border-border-dark rounded-2xl overflow-hidden shadow-sm relative z-0 h-full">
                  <MapContainer
                    center={userLocation ? [userLocation.lat, userLocation.lng] : [10.762622, 106.660172]}
                    zoom={userLocation ? 13 : 11}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; Google Maps'
                      url="https://mt1.google.com/vt/lyrs=m&hl=vi&gl=VN&x={x}&y={y}&z={z}"
                    />

                    {/* Sovereignty Markers */}
                    <Marker position={[16.5, 112.0]} icon={hoangSaIcon} interactive={false} />
                    <Marker position={[10.0, 114.0]} icon={truongSaIcon} interactive={false} />
                    <Marker position={[14.0, 113.0]} icon={southSeaIcon} interactive={false} />

                    {/* Change view component */}
                    {userLocation && <ChangeView center={[userLocation.lat, userLocation.lng]} />}

                    {/* Pulsing blue dot representing user position */}
                    {userLocation && (
                      <Marker position={[userLocation.lat, userLocation.lng]} icon={userMarkerIcon}>
                        <Popup>Vị trí của bạn</Popup>
                      </Marker>
                    )}

                    {/* Polyline dashed line if a court is selected and userLocation is active */}
                    {userLocation && selectedMapFacility && selectedMapFacility.latitude && selectedMapFacility.longitude && (
                      <Polyline
                        positions={[
                          [userLocation.lat, userLocation.lng],
                          [selectedMapFacility.latitude, selectedMapFacility.longitude]
                        ]}
                        color="#10b981"
                        dashArray="8, 12"
                        weight={3}
                      />
                    )}

                    {/* Courts Marker pins */}
                    {facilities.map((fac) => {
                      if (!fac.latitude || !fac.longitude) return null;
                      return (
                        <Marker
                          key={fac.facilityId}
                          position={[fac.latitude, fac.longitude]}
                          icon={facilityMarkerIcon}
                          eventHandlers={{
                            click: () => {
                              setSelectedMapFacility(fac);
                            }
                          }}
                        >
                          <Popup>
                            <div className="p-1 min-w-[150px]">
                              <h4 className="font-bold text-sm text-gray-800 dark:text-white mb-1">{fac.name}</h4>
                              <p className="text-xs text-gray-500 mb-2">{fac.address}</p>
                              <button
                                onClick={() => setSelectedMapFacility(fac)}
                                className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1.5 px-2.5 rounded-lg transition-colors w-full"
                              >
                                Xem chi tiết
                              </button>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                </div>

                {/* Map Bottom Filter Bar */}
                <div className="bg-white dark:bg-card-dark border border-gray-100 dark:border-border-dark rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm flex-wrap shrink-0">
                  <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 flex-wrap">

                    {/* Date Picker */}
                    <div className="relative">
                      <input
                        type="date"
                        value={mapFilterDate}
                        onChange={(e) => setMapFilterDate(e.target.value)}
                        className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl pl-3 pr-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none hover:border-gray-300 transition-colors"
                      />
                    </div>

                    {/* Start & End Hours slot */}
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 hover:border-gray-300 transition-colors">
                      <input
                        type="time"
                        value={mapFilterStartTime}
                        onChange={(e) => setMapFilterStartTime(e.target.value)}
                        className="bg-transparent text-gray-700 dark:text-gray-300 text-sm font-semibold outline-none w-[90px]"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="time"
                        value={mapFilterEndTime}
                        onChange={(e) => setMapFilterEndTime(e.target.value)}
                        className="bg-transparent text-gray-700 dark:text-gray-300 text-sm font-semibold outline-none w-[90px]"
                      />
                    </div>

                    {/* Sport Dropdown selection */}
                    <div className="relative">
                      <select
                        value={mapFilterSportId}
                        onChange={(e) => setMapFilterSportId(e.target.value)}
                        className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl pl-4 pr-10 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none appearance-none min-w-[140px] cursor-pointer hover:border-gray-300 transition-colors"
                      >
                        <option value="">Tất cả môn</option>
                        {sports.map((sport) => (
                          <option key={sport.sportId} value={sport.sportId}>
                            {sport.sportName}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                      </div>
                    </div>

                    {/* Search submission */}
                    <button
                      onClick={handleMapSearch}
                      className="bg-emerald-500 text-white p-2.5 rounded-xl hover:bg-emerald-600 transition-colors font-bold shadow-sm shadow-emerald-500/10 flex items-center justify-center"
                    >
                      <Search size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Sidebar: Suggestions or detail card */}
              <div className="w-full lg:w-[380px] bg-white dark:bg-card-dark border border-gray-100 dark:border-border-dark rounded-2xl p-6 flex flex-col shadow-sm overflow-hidden h-full">
                {selectedMapFacility ? (
                  // Detail mode
                  <div className="flex flex-col h-full justify-between overflow-y-auto space-y-6">
                    <div className="space-y-4">
                      {/* Header with back button */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedMapFacility(null)}
                          className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
                        >
                          <ArrowLeft size={18} />
                        </button>
                        <span className="font-semibold text-gray-500 dark:text-gray-400 text-sm">Chi tiết sân</span>
                      </div>

                      {/* Photo banner */}
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800"
                          alt={selectedMapFacility.name}
                          className="w-full h-full object-cover"
                        />
                        {selectedMapFacility.distanceKm !== undefined && selectedMapFacility.distanceKm !== null && (
                          <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                            Cách {selectedMapFacility.distanceKm.toFixed(1)} km
                          </div>
                        )}
                      </div>

                      {/* Summary details */}
                      <div className="space-y-2">
                        <h3 className="font-bold text-xl text-gray-800 dark:text-white leading-tight">
                          {selectedMapFacility.name}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm flex items-start gap-2">
                          <MapPin size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{selectedMapFacility.address}, {selectedMapFacility.district || selectedMapFacility.city}</span>
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Số lượng sân:</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedMapFacility.courtCount || 0} sân</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Môn hỗ trợ:</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-right">
                            {sports.filter(s => selectedMapFacility.courts?.some(c => c.sportId === s.sportId)).map(s => s.sportName).join(', ') || 'Tất cả môn'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive routing and booking CTAs */}
                    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
                      <Button
                        onClick={() => handleBookNow(selectedMapFacility)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/10 transition-all"
                      >
                        <CalendarDays size={18} />
                        <span>Đặt lịch ngay</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          if (!userLocation) {
                            toast.error("Vui lòng cho phép quyền định vị để tìm đường đi.");
                            return;
                          }
                          const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedMapFacility.latitude},${selectedMapFacility.longitude}&travelmode=driving`;
                          window.open(googleMapsUrl, '_blank');
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-all text-gray-700 dark:text-gray-300"
                      >
                        <Navigation size={18} className="text-blue-500" />
                        <span>Tìm đường đi (Google Maps)</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Suggestion List mode
                  <div className="flex flex-col h-full overflow-hidden">
                    <div className="mb-4 shrink-0">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                        Sân được đề xuất
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {facilities.length > 0 ? `Tìm thấy ${facilities.length} sân gần bạn` : 'Không có sân nào phù hợp gần bạn'}
                      </p>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                      {loading ? (
                        <div className="flex justify-center items-center py-20">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        </div>
                      ) : facilities.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 text-sm">
                          Không tìm thấy sân phù hợp.
                        </div>
                      ) : (
                        facilities.map((fac) => (
                          <div
                            key={fac.facilityId}
                            onClick={() => setSelectedMapFacility(fac)}
                            className="p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-100 dark:border-gray-700/70 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-sm space-y-3 group"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-bold text-gray-800 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                                {fac.name}
                              </h4>
                              {fac.distanceKm !== undefined && fac.distanceKm !== null && (
                                <span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full font-semibold shrink-0">
                                  {fac.distanceKm.toFixed(1)} km
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2">
                              {fac.address}, {fac.district || fac.city}
                            </p>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-500 dark:text-gray-400 font-medium">{fac.courtCount || 0} sân</span>
                              <span className="text-emerald-500 font-bold group-hover:underline flex items-center gap-0.5">
                                Xem chi tiết <ChevronRight size={14} />
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* ------------------- GRID / LIST VIEW (STANDARD) ------------------- */
            <>
              {/* Filters Bar */}
              <div className="bg-white dark:bg-card-dark border border-gray-100 dark:border-border-dark rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 flex-wrap">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold text-[13px] tracking-wider shrink-0 ml-2">
                    <Filter size={16} />
                    <span>LỌC:</span>
                  </div>

                  {/* Dynamic Sport Dropdown */}
                  <div className="relative">
                    <select
                      value={filterSportId}
                      onChange={(e) => setFilterSportId(e.target.value)}
                      className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl pl-4 pr-10 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none appearance-none min-w-[140px] cursor-pointer hover:border-gray-300 transition-colors"
                    >
                      <option value="">Tất cả môn</option>
                      {sports.map((sport) => (
                        <option key={sport.sportId} value={sport.sportId}>
                          {sport.sportName}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                  </div>

                  {/* City Text input */}
                  <input
                    type="text"
                    placeholder="Thành phố..."
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none w-40 hover:border-gray-300 transition-colors"
                  />

                  {/* District Text input */}
                  <input
                    type="text"
                    placeholder="Quận/Huyện..."
                    value={filterDistrict}
                    onChange={(e) => setFilterDistrict(e.target.value)}
                    className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none w-40 hover:border-gray-300 transition-colors"
                  />

                  <button
                    onClick={handleListSearch}
                    className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 p-2.5 rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors"
                  >
                    <Search size={18} />
                  </button>
                </div>

                <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 rounded-xl p-1 shrink-0 border border-gray-100 dark:border-gray-700/50">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600 dark:text-primary' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                  >
                    <Grid size={18} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600 dark:text-primary' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                  >
                    <List size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Grid / List Results */}
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
              ) : facilities.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  Không có sân nào hiển thị.
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'flex flex-col gap-6'}>
                  {facilities.map(facility => (
                    <CourtCard
                      key={facility.facilityId}
                      title={facility.name}
                      subtitle={facility.address + (facility.district ? `, ${facility.district}` : '')}
                      status="Sẵn sàng"
                      distanceKm={facility.distanceKm}
                      image={'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800'}
                      onBook={() => handleBookNow(facility)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </main>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        facility={selectedFacility}
      />
    </div>
  );
}
