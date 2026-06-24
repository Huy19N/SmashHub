import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  Globe,
  Briefcase,
  Activity
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAdminFacilities } from '../hooks/useAdmin';
import { getFacilityByIdAPI, getCourtStatusAPI } from '../../bookings/api/bookings.api';
import toast from 'react-hot-toast';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

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

export default function FacilityManagement() {
  const { facilities, isLoading, fetchFacilities, approveFacility, rejectFacility } = useAdminFacilities();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('approved'); // 'approved' | 'requests'
  const [requestFilter, setRequestFilter] = useState('all'); // 'all' | '1' | '2' | '3'

  // Modal State
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [facilityDetail, setFacilityDetail] = useState(null);
  const [courtStatuses, setCourtStatuses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().substring(0, 10));

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedFacility(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock scrolling of background page when modal is active
  useEffect(() => {
    if (selectedFacility) {
      document.body.style.overflow = 'hidden';
      const scrollables = document.querySelectorAll('.overflow-y-auto');
      scrollables.forEach(el => {
        el.style.overflow = 'hidden';
      });
    } else {
      document.body.style.overflow = '';
      const scrollables = document.querySelectorAll('.overflow-y-auto');
      scrollables.forEach(el => {
        el.style.overflow = '';
      });
    }
    return () => {
      document.body.style.overflow = '';
      const scrollables = document.querySelectorAll('.overflow-y-auto');
      scrollables.forEach(el => {
        el.style.overflow = '';
      });
    };
  }, [selectedFacility]);

  // Fetch court status dynamically when selected date or facility changes
  useEffect(() => {
    if (!selectedFacility) return;

    let isMounted = true;
    const loadCourtStatus = async () => {
      try {
        const res = await getCourtStatusAPI(selectedFacility.facilityId, selectedDate);
        if (res.success && isMounted) {
          setCourtStatuses(res.data);
        }
      } catch (err) {
        console.error('Lỗi khi tải trạng thái sân:', err);
      }
    };

    loadCourtStatus();
    return () => {
      isMounted = false;
    };
  }, [selectedDate, selectedFacility]);

  const handleOpenDetails = async (facility) => {
    setSelectedFacility(facility);
    setIsDetailLoading(true);
    setFacilityDetail(null);
    setCourtStatuses([]);
    try {
      const detailRes = await getFacilityByIdAPI(facility.facilityId);
      if (detailRes.success) {
        setFacilityDetail(detailRes.data);
      } else {
        toast.error(detailRes.message || 'Không thể tải chi tiết cơ sở.');
      }

      const statusRes = await getCourtStatusAPI(facility.facilityId, selectedDate);
      if (statusRes.success) {
        setCourtStatuses(statusRes.data);
      } else {
        toast.error(statusRes.message || 'Không thể tải trạng thái sân.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi tải thông tin.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleApprove = async (facilityId, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn PHÊ DUYỆT cơ sở "${name}" không?`)) {
      const ok = await approveFacility(facilityId);
      if (ok && selectedFacility && selectedFacility.facilityId === facilityId) {
        setSelectedFacility(prev => ({ ...prev, statusId: 2 }));
      }
    }
  };

  const handleReject = async (facilityId, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn TỪ CHỐI cơ sở "${name}" không?`)) {
      const ok = await rejectFacility(facilityId);
      if (ok && selectedFacility && selectedFacility.facilityId === facilityId) {
        setSelectedFacility(prev => ({ ...prev, statusId: 3 }));
      }
    }
  };

  // Filter facilities based on tabs and query
  const approvedFacilities = facilities.filter(f => f.statusId === 2);
  const requests = facilities;

  const getFilteredList = () => {
    const list = activeTab === 'approved' ? approvedFacilities : requests;
    return list.filter(f => {
      // Apply status filter for requests tab
      if (activeTab === 'requests' && requestFilter !== 'all' && f.statusId !== parseInt(requestFilter)) {
        return false;
      }
      
      const query = searchQuery.toLowerCase();
      return (f.name || '').toLowerCase().includes(query) ||
             (f.ownerName || '').toLowerCase().includes(query) ||
             (f.ownerEmail || '').toLowerCase().includes(query) ||
             (f.city || '').toLowerCase().includes(query) ||
             (f.district || '').toLowerCase().includes(query) ||
             (f.address || '').toLowerCase().includes(query);
    });
  };

  const filteredFacilities = getFilteredList();

  const hasCoordinates = facilityDetail && facilityDetail.latitude && facilityDetail.longitude;
  const position = hasCoordinates ? [parseFloat(facilityDetail.latitude), parseFloat(facilityDetail.longitude)] : null;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold font-display leading-tight dark:text-white">Quản Lý Chủ Sân & Cơ Sở</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Danh sách các cơ sở thể thao đăng ký trên hệ thống cùng thông tin liên hệ của chủ sân.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-white/5 gap-6">
        <button
          onClick={() => setActiveTab('approved')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'approved'
              ? 'text-emerald-500 dark:text-primary border-b-2 border-emerald-500 dark:border-primary'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          Cơ sở đã hoạt động
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'requests'
              ? 'text-emerald-500 dark:text-primary border-b-2 border-emerald-500 dark:border-primary'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          Đơn phê duyệt cơ sở
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative max-w-md w-full glass-panel p-2.5 rounded-2xl shadow-sm border border-gray-150/40 dark:border-white/10 flex items-center bg-white dark:bg-[#0b0f19]/60">
          <Search className="w-4 h-4 text-gray-400 ml-2" />
          <input
            type="text"
            placeholder="Tìm theo tên sân, chủ sân, địa chỉ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-4 py-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 dark:text-white"
          />
        </div>

        {activeTab === 'requests' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider font-label shrink-0">
              Trạng thái đơn:
            </span>
            <select
              value={requestFilter}
              onChange={(e) => setRequestFilter(e.target.value)}
              className="text-xs font-bold px-3 py-2 bg-white dark:bg-[#0b0f19]/60 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-primary dark:text-white cursor-pointer"
            >
              <option value="all" className="dark:bg-[#0b0f19]">Tất cả</option>
              <option value="1" className="dark:bg-[#0b0f19]">Chờ duyệt</option>
              <option value="2" className="dark:bg-[#0b0f19]">Đã duyệt</option>
              <option value="3" className="dark:bg-[#0b0f19]">Đã từ chối</option>
            </select>
          </div>
        )}
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : filteredFacilities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-250 dark:border-white/5">
          <AlertCircle className="w-12 h-12 mb-3 text-amber-500" />
          <p className="text-sm font-semibold">Không tìm thấy cơ sở nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFacilities.map((f) => (
            <div
              key={f.facilityId}
              className="p-6 rounded-2xl bg-white dark:bg-[#0b0f19]/60 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between glass-panel relative overflow-hidden group"
            >
              <div className={`absolute top-0 left-0 w-1 h-full transition-all ${
                f.statusId === 1 ? 'bg-amber-500' :
                f.statusId === 3 ? 'bg-rose-500' : 'bg-emerald-500'
              }`} />
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 ${
                      f.statusId === 1 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                      f.statusId === 3 ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
                      'bg-emerald-500/10 text-emerald-600 dark:text-primary border-emerald-500/20'
                    }`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-gray-900 dark:text-white leading-tight font-display">
                        {f.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[200px]">{f.address}, {f.district}, {f.city}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {f.statusId === 1 ? (
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider font-label">
                        Chờ duyệt
                      </span>
                    ) : f.statusId === 3 ? (
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wider font-label">
                        Đã từ chối
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-primary border border-emerald-500/20 uppercase tracking-wider font-label">
                        Đã duyệt
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-150/50 dark:border-white/5 space-y-2">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-label">
                    Thông tin Chủ sở hữu
                  </p>
                  <div className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                    <p className="font-bold">{f.ownerName}</p>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{f.ownerEmail}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {/* Detailed Information Button */}
                  <button
                    onClick={() => handleOpenDetails(f)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold border border-emerald-500/30 dark:border-primary/30 hover:border-emerald-500 dark:hover:border-primary text-emerald-600 dark:text-primary bg-emerald-500/5 hover:bg-emerald-500/10 flex items-center justify-center gap-1.5 transition-all duration-200"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Xem thông tin chi tiết
                  </button>

                  {/* Actions for Pending Requests */}
                  {activeTab === 'requests' && f.statusId === 1 && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleApprove(f.facilityId, f.name)}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Phê duyệt
                      </button>
                      <button
                        onClick={() => handleReject(f.facilityId, f.name)}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 transition-all duration-200"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Từ chối
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-gray-100 dark:border-white/5 flex justify-between items-center text-xs text-gray-400">
                <span className="font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-primary rounded-md uppercase tracking-wider font-label">
                  ID: #{f.facilityId}
                </span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Hoạt động từ: {new Date(f.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Box/Modal rendered at Body level using React Portal to overlap Sidebar completely */}
      {selectedFacility && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 md:p-8 animate-fadeIn">
          {/* Click outside to close */}
          <div className="absolute inset-0" onClick={() => setSelectedFacility(null)}></div>
          
          {/* Modal Container: Max-w-7xl size, fills 90vh */}
          <div className="relative w-full max-w-7xl bg-white dark:bg-[#0f172a] rounded-3xl border border-gray-150 dark:border-white/10 overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] z-10 animate-scaleUp">
            
            {/* Left Column: Information Details & Court Statuses */}
            <div className="w-full md:w-3/5 p-6 md:p-8 overflow-y-auto flex flex-col space-y-6 scrollbar-thin">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-gray-100 dark:border-white/5 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-label">
                    Chi tiết cơ sở #{selectedFacility.facilityId}
                  </span>
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white font-display mt-0.5 leading-tight">
                    {selectedFacility.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    {selectedFacility.statusId === 1 ? (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider font-label">
                        Chờ duyệt
                      </span>
                    ) : selectedFacility.statusId === 3 ? (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wider font-label">
                        Đã từ chối
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-primary border border-emerald-500/20 uppercase tracking-wider font-label">
                        Đã hoạt động
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isDetailLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                  <p className="text-xs text-gray-400">Đang tải thông tin cơ sở...</p>
                </div>
              ) : (
                <>
                  {/* General Info block */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-150/50 dark:border-white/5">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-label block">Chủ sở hữu</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{facilityDetail?.ownerName || selectedFacility.ownerName}</span>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{facilityDetail?.ownerEmail || selectedFacility.ownerEmail}</span>
                      </div>
                      {facilityDetail?.phoneNumber && (
                        <div className="text-xs text-gray-500 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{facilityDetail.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-label block">Thông tin đăng ký</span>
                      <div className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                        <span>Mã kinh doanh: <strong className="font-semibold">{facilityDetail?.businessCode || 'Chưa cập nhật'}</strong></span>
                      </div>
                      <div className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>Ngày tham gia: {facilityDetail?.createdAt ? new Date(facilityDetail.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                      </div>
                      <div className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        <span>Số lượng sân: {facilityDetail?.courtCount ?? 0} sân</span>
                      </div>
                    </div>

                    <div className="sm:col-span-2 space-y-1 border-t border-gray-100 dark:border-white/5 pt-3 mt-1">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-label block">Địa chỉ</span>
                      <div className="text-xs text-gray-750 dark:text-gray-300 flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{facilityDetail?.address}, {facilityDetail?.district}, {facilityDetail?.city}</span>
                      </div>
                    </div>

                    {hasCoordinates && (
                      <div className="sm:col-span-2 text-xs font-mono text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        <span>Tọa độ: {parseFloat(facilityDetail.latitude).toFixed(6)}, {parseFloat(facilityDetail.longitude).toFixed(6)}</span>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Court Statuses */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100 dark:border-white/5 pt-5">
                      <h3 className="text-base font-extrabold text-gray-900 dark:text-white font-display flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        Trạng thái hoạt động & Bảng giá sân
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-500 font-medium">Chọn ngày:</span>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="text-xs px-2.5 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-primary dark:text-white font-bold"
                        />
                      </div>
                    </div>

                    {courtStatuses.length === 0 ? (
                      <div className="text-center py-10 text-gray-400 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                        <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600 animate-pulse" />
                        <p className="text-xs">Chưa có thông tin sân con hoặc giá cho ngày này.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {courtStatuses.map((court) => (
                          <div
                            key={court.courtId}
                            className="p-4 rounded-2xl bg-white dark:bg-[#1e293b]/30 border border-gray-100 dark:border-white/5 shadow-sm space-y-3 animate-fadeIn"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${court.isActive ? 'bg-emerald-500 animate-ping' : 'bg-gray-400'}`} />
                                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">{court.courtName}</h4>
                                <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-primary uppercase tracking-wider font-label">
                                  {court.sportName}
                                </span>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${court.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                {court.isActive ? 'Hoạt động' : 'Tạm dừng'}
                              </span>
                            </div>
                            
                            {/* Time Slots Grid */}
                            {court.timeSlots.length === 0 ? (
                              <p className="text-xs text-gray-400 italic">Không có khung giờ hoạt động.</p>
                            ) : (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {court.timeSlots.map((slot, idx) => {
                                  const isBooked = slot.status === 'Booked';
                                  const isMaintenance = slot.status === 'Maintenance';
                                  return (
                                    <div
                                      key={idx}
                                      className={`p-2.5 rounded-xl border text-center transition-all relative group/slot ${
                                        isBooked
                                          ? 'bg-blue-50/75 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/20'
                                          : isMaintenance
                                          ? 'bg-gray-50 dark:bg-white/5 text-gray-400 border-gray-200 dark:border-white/5'
                                          : 'bg-emerald-50/40 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-950/20'
                                      }`}
                                    >
                                      <div className="text-[11px] font-bold">{slot.startTime} - {slot.endTime}</div>
                                      <div className="text-[10px] font-medium mt-0.5 opacity-90">
                                        {Number(slot.cost).toLocaleString('vi-VN')} đ
                                      </div>
                                      <div className="text-[8px] font-bold uppercase tracking-wider mt-1 opacity-75">
                                        {isBooked ? 'Đã đặt' : isMaintenance ? 'Bảo trì' : 'Còn trống'}
                                      </div>
                                      {isBooked && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/slot:block bg-gray-900 text-white text-[9px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-20">
                                          Đặt bởi: {slot.bookedByUserName || 'Khách vãng lai'}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Right Column: Leaflet Map */}
            <div className="w-full md:w-2/5 h-64 md:h-full relative z-0 border-t md:border-t-0 md:border-l border-gray-150 dark:border-white/10 bg-gray-150 dark:bg-gray-950 flex flex-col justify-center items-center">
              {position ? (
                <MapContainer
                  center={position}
                  zoom={15}
                  minZoom={5}
                  maxBounds={[[4.0, 100.0], [24.0, 122.0]]}
                  maxBoundsViscosity={1.0}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; Google Maps'
                    url="https://mt1.google.com/vt/lyrs=m&hl=vi&gl=VN&x={x}&y={y}&z={z}"
                  />
                  <Marker position={position}>
                    <Popup>
                      <div className="p-1">
                        <h4 className="font-extrabold text-xs text-gray-900">{selectedFacility.name}</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">{selectedFacility.address}</p>
                      </div>
                    </Popup>
                  </Marker>
                  <Marker position={[16.5, 112.0]} icon={hoangSaIcon} interactive={false} />
                  <Marker position={[10.0, 114.0]} icon={truongSaIcon} interactive={false} />
                  <Marker position={[14.0, 113.0]} icon={southSeaIcon} interactive={false} />
                </MapContainer>
              ) : (
                <div className="p-8 text-center text-gray-400 flex flex-col items-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center border border-gray-350 dark:border-white/10">
                    <MapPin className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-750 dark:text-gray-300">Tọa độ chưa được cập nhật</p>
                    <p className="text-[11px] text-gray-400 mt-1 max-w-xs leading-normal">Không thể hiển thị bản đồ do cơ sở này chưa cấu hình vĩ độ và kinh độ.</p>
                  </div>
                </div>
              )}
              
              {/* Close Button absolute top-right of Map column */}
              <button
                onClick={() => setSelectedFacility(null)}
                className="absolute top-4 right-4 z-[1000] p-2 rounded-full bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-sm border border-gray-200 dark:border-white/10 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
