import React, { useState, useEffect } from 'react';
import { 
  Building, Settings, Plus, Edit3, Trash2, CheckCircle2, AlertTriangle, 
  MapPin, Loader2, Save, X, Activity, ToggleLeft, ToggleRight, Sparkles 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Sidebar from '../../../components/layout/Sidebar';
import SportyWatermarks from '../../../components/ui/SportyWatermarks';
import { useTheme } from '../../../contexts/ThemeContext';
import useCourtsManagement from '../hooks/useCourtsManagement';
import Button from '../../../components/ui/Button';
import toast from 'react-hot-toast';

// Fix for default Leaflet icon not showing in React
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

export default function CourtsManagementPage() {
  const { theme } = useTheme();
  const {
    facilities,
    selectedFacilityId,
    setSelectedFacilityId,
    courts,
    sports,
    courtStatuses,
    isLoadingFacilities,
    isLoadingCourts,
    error,
    refetchFacilities,
    refetchCourts,
    createFacility,
    createCourt,
    updateCourt,
    deleteCourt,
    fetchCourtCosts,
    fetchFacilityHours,
    createCourtCost,
    updateCourtCost,
    updateCourtAll,
    updateFacilityHours
  } = useCourtsManagement();

  // Active tab: 'list' | 'add-court' | 'add-facility'
    const [activeTab, setActiveTab] = useState('list');

    useEffect(() => {
      if (activeTab === 'add-court' && selectedFacilityId) {
         fetchFacilityHours(selectedFacilityId).then(hours => {
            setFacilityHours(hours);
            const groups = {};
            hours.forEach(h => {
               const key = `${h.openTime}-${h.closeTime}`;
               if (!groups[key]) groups[key] = { openTime: h.openTime, closeTime: h.closeTime, daysOfWeek: [], label: '' };
               groups[key].daysOfWeek.push(h.dayOfWeek);
            });
            const parsedGroups = Object.values(groups).map((g, idx) => {
               g.label = g.daysOfWeek.map(d => d === 8 ? 'CN' : `T${d}`).join(', ');
               return {
                  id: Date.now() + Math.random() + idx,
                  groupId: `${g.openTime}-${g.closeTime}-${g.daysOfWeek.join(',')}`,
                  daysOfWeek: g.daysOfWeek,
                  label: g.label,
                  openTime: g.openTime,
                  closeTime: g.closeTime,
                  costs: [{ id: Date.now() + Math.random() + idx * 10, startTime: g.openTime.substring(0, 5), endTime: g.closeTime.substring(0, 5), durationMinutes: '60', cost: '' }]
               };
            });
            setGroupedCourtCosts(parsedGroups);
         }).catch(err => console.error(err));
      }
    }, [activeTab, selectedFacilityId, fetchFacilityHours]);

  // Add facility form state
  const [facName, setFacName] = useState('');
  const [facCity, setFacCity] = useState('');
  const [facDistrict, setFacDistrict] = useState('');
  const [facAddress, setFacAddress] = useState('');
  const [facLatitude, setFacLatitude] = useState(null); // Force user to pick
  const [facLongitude, setFacLongitude] = useState(null);
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);
  const [operatingHours, setOperatingHours] = useState([
    { dayOfWeek: 2, label: 'Thứ 2', isOpen: true, openTime: '05:00', closeTime: '23:00' },
    { dayOfWeek: 3, label: 'Thứ 3', isOpen: true, openTime: '05:00', closeTime: '23:00' },
    { dayOfWeek: 4, label: 'Thứ 4', isOpen: true, openTime: '05:00', closeTime: '23:00' },
    { dayOfWeek: 5, label: 'Thứ 5', isOpen: true, openTime: '05:00', closeTime: '23:00' },
    { dayOfWeek: 6, label: 'Thứ 6', isOpen: true, openTime: '05:00', closeTime: '23:00' },
    { dayOfWeek: 7, label: 'Thứ 7', isOpen: true, openTime: '05:00', closeTime: '23:00' },
    { dayOfWeek: 8, label: 'Chủ Nhật', isOpen: true, openTime: '05:00', closeTime: '23:00' }
  ]);
  const [isSubmittingFacility, setIsSubmittingFacility] = useState(false);
  const [facilityFormError, setFacilityFormError] = useState('');

  // Add court form state
  const [courtNameInput, setCourtNameInput] = useState('');
  const [courtSportId, setCourtSportId] = useState('');
  const [groupedCourtCosts, setGroupedCourtCosts] = useState([]);
    const [facilityHours, setFacilityHours] = useState([]);
  const [isSubmittingCourt, setIsSubmittingCourt] = useState(false);
  const [courtFormError, setCourtFormError] = useState('');

  // Edit court modal state
  const [editingCourt, setEditingCourt] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSportId, setEditSportId] = useState('');
  const [editStatusId, setEditStatusId] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [groupedEditCosts, setGroupedEditCosts] = useState([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  const addCostRow = (groupIndex, isEdit = false) => {
    const setFn = isEdit ? setGroupedEditCosts : setGroupedCourtCosts;
    setFn(prev => prev.map((group, idx) => {
      if (idx !== groupIndex) return group;
      const lastCost = group.costs[group.costs.length - 1];
      const defaultStart = lastCost ? lastCost.endTime : group.openTime.substring(0, 5);
      return {
        ...group,
        costs: [
          ...group.costs,
          {
            id: Date.now() + Math.random(),
            startTime: defaultStart,
            endTime: group.closeTime.substring(0, 5),
            durationMinutes: '60',
            cost: ''
          }
        ]
      };
    }));
  };

  const removeCostRow = (groupIndex, costIndex, isEdit = false) => {
    const setFn = isEdit ? setGroupedEditCosts : setGroupedCourtCosts;
    setFn(prev => prev.map((group, idx) => {
      if (idx !== groupIndex) return group;
      const newCosts = [...group.costs];
      newCosts.splice(costIndex, 1);
      return {
        ...group,
        costs: newCosts
      };
    }));
  };

  const updateCostField = (groupIndex, costIndex, field, value, isEdit = false) => {
    const setFn = isEdit ? setGroupedEditCosts : setGroupedCourtCosts;
    setFn(prev => prev.map((group, idx) => {
      if (idx !== groupIndex) return group;
      return {
        ...group,
        costs: group.costs.map((c, cIdx) => {
          if (cIdx !== costIndex) return c;
          return { ...c, [field]: value };
        })
      };
    }));
  };

  // Handle Create Facility
  const handleCreateFacility = async (e) => {
    e.preventDefault();
    setFacilityFormError('');
    if (!facName.trim() || !facCity.trim() || !facDistrict.trim()) {
      setFacilityFormError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    if (facLatitude === null || facLongitude === null) {
      setFacilityFormError('Vui lòng chấm trên bản đồ để chọn vị trí cơ sở của bạn.');
      return;
    }
    if (!isLocationConfirmed) {
      setFacilityFormError('Vui lòng bấm nút "Xác nhận vị trí" dưới bản đồ trước khi tiếp tục.');
      return;
    }

    setIsSubmittingFacility(true);
    try {
      const newFacility = await createFacility({
        name: facName,
        city: facCity,
        district: facDistrict,
        address: facAddress || `${facDistrict}, ${facCity}`,
        latitude: facLatitude,
        longitude: facLongitude
      });

      // Lấy dữ liệu 7 ngày để cập nhật thông qua updateFacilityHours
      const hoursData = operatingHours
        .filter(h => h.isOpen)
        .map(h => ({
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime.substring(0, 5), // Lấy đúng định dạng HH:mm
          closeTime: h.closeTime.substring(0, 5) // Lấy đúng định dạng HH:mm
        }));
      
      if (hoursData.length > 0) {
        await updateFacilityHours(newFacility.facilityId, hoursData);
      }

      toast.success('Đăng ký cơ sở thành công. Đơn đăng ký của bạn đang chờ Admin phê duyệt.');

      setFacName('');
      setFacCity('');
      setFacDistrict('');
      setFacAddress('');
      setFacLatitude(null);
      setFacLongitude(null);
      setIsLocationConfirmed(false);
      setOperatingHours(prev => prev.map(h => ({ ...h, isOpen: true, openTime: '05:00', closeTime: '23:00' })));
      setActiveTab('list');
    } catch (err) {
      const backendMessage = err.response?.data?.message || err.response?.data?.title || err.message;
      setFacilityFormError(backendMessage || 'Lỗi khi tạo cơ sở mới.');
    } finally {
      setIsSubmittingFacility(false);
    }
  };

  // Handle Create Court
  const handleCreateCourt = async (e) => {
    e.preventDefault();
    setCourtFormError('');
    if (!selectedFacilityId) {
      setCourtFormError('Vui lòng chọn hoặc tạo cơ sở thể thao trước.');
      return;
    }
    if (!courtNameInput.trim() || !courtSportId) {
      setCourtFormError('Vui lòng điền tên sân và chọn môn thể thao tương ứng.');
      return;
    }
    setIsSubmittingCourt(true);
    try {
      const newCourt = await createCourt({
        sportId: parseInt(courtSportId),
        courtName: courtNameInput
      });

      
        const bulkData = [];
        const formatTime = (t) => t && t.length === 5 ? `${t}:00` : t;
        groupedCourtCosts.forEach(group => {
          group.costs.forEach(c => {
            if (c.cost !== '' && c.cost !== null) {
              bulkData.push({
                 daysOfWeek: group.daysOfWeek,
                 startTime: formatTime(c.startTime),
                 endTime: formatTime(c.endTime),
                 durationMinutes: parseInt(c.durationMinutes),
                 cost: parseFloat(c.cost)
              });
            }
          });
        });
        if (bulkData.length > 0) {
          await updateCourtAll(newCourt.courtId, bulkData);
        }

      setCourtNameInput('');
      setCourtSportId('');
      setGroupedCourtCosts([]);
      setActiveTab('list');
    } catch (err) {
      const backendMessage = err.response?.data?.message || err.response?.data?.title || err.message;
      setCourtFormError(backendMessage || 'Lỗi khi tạo sân.');
    } finally {
      setIsSubmittingCourt(false);
    }
  };

  // Open edit modal
  // Open edit modal
  const openEditModal = async (court) => {
    setEditingCourt(court);
    setEditName(court.courtName);
    setEditSportId(court.sportId);
    setEditStatusId(court.statusId);
    setEditIsActive(court.isActive);
    setEditError('');
    setGroupedEditCosts([]);

    try {
      const hours = await fetchFacilityHours(court.facilityId);
      const costs = await fetchCourtCosts(court.courtId);
      
      const groups = {};
      hours.forEach(h => {
         const key = `${h.openTime}-${h.closeTime}`;
         if (!groups[key]) groups[key] = { openTime: h.openTime, closeTime: h.closeTime, daysOfWeek: [], label: '' };
         groups[key].daysOfWeek.push(h.dayOfWeek);
      });

      const parsedGroups = Object.values(groups).map((g, idx) => {
         g.label = g.daysOfWeek.map(d => d === 8 ? 'CN' : `T${d}`).join(', ');
         
         const firstRepresentedDay = g.daysOfWeek.find(d => costs.some(c => c.dayOfWeek === d));
         let groupCostsList = [];
         if (firstRepresentedDay) {
           groupCostsList = costs
             .filter(c => c.dayOfWeek === firstRepresentedDay)
             .map(c => ({
               id: c.courtCostId || Date.now() + Math.random() + idx * 100,
               startTime: c.startTime.substring(0, 5),
               endTime: c.endTime.substring(0, 5),
               durationMinutes: c.durationMinutes.toString(),
               cost: c.cost.toString()
             }));
         }

         if (groupCostsList.length === 0) {
           groupCostsList = [{
             id: Date.now() + Math.random() + idx * 100,
             startTime: g.openTime.substring(0, 5),
             endTime: g.closeTime.substring(0, 5),
             durationMinutes: '60',
             cost: ''
           }];
         }

         return {
            id: Date.now() + Math.random() + idx,
            groupId: `${g.openTime}-${g.closeTime}-${g.daysOfWeek.join(',')}`,
            daysOfWeek: g.daysOfWeek,
            label: g.label,
            openTime: g.openTime,
            closeTime: g.closeTime,
            costs: groupCostsList
         };
      });

      setGroupedEditCosts(parsedGroups);
    } catch (e) {
      console.warn("Could not load court costs", e);
      setGroupedEditCosts([]);
    }
  };

  // Handle Save Court edits
  const handleSaveCourtEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editName.trim() || !editSportId) {
      setEditError('Vui lòng điền tên sân và chọn môn thể thao.');
      return;
    }
    setIsSavingEdit(true);
    try {
      const bulkData = [];
      const formatTime = (t) => t && t.length === 5 ? `${t}:00` : t;
      
      groupedEditCosts.forEach(group => {
        group.costs.forEach(c => {
          if (c.cost !== '' && c.cost !== null) {
            bulkData.push({
               daysOfWeek: group.daysOfWeek,
               startTime: formatTime(c.startTime),
               endTime: formatTime(c.endTime),
               durationMinutes: parseInt(c.durationMinutes),
               cost: parseFloat(c.cost)
            });
          }
        });
      });

      await updateCourtAll(editingCourt.courtId, bulkData);

      await updateCourt(editingCourt.courtId, {
        courtName: editName,
        sportId: parseInt(editSportId),
        statusId: parseInt(editStatusId),
        isActive: editIsActive
      });

      setEditingCourt(null);
      refetchCourts();
    } catch (err) {
      const backendMessage = err.response?.data?.message || err.response?.data?.title || err.message;
      setEditError(backendMessage || 'Lỗi khi lưu thay đổi sân.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle Delete/Deactivate Court
  const handleDeleteCourt = async (courtId, courtName) => {
    if (confirm(`Bạn có chắc chắn muốn xóa sân "${courtName}" khỏi cơ sở?`)) {
      try {
        await deleteCourt(courtId);
      } catch (err) {
        alert('Lỗi khi xóa sân: ' + (err.message || 'Vui lòng thử lại sau.'));
      }
    }
  };

  // Find active facility metadata
  const activeFacility = facilities.find(f => f.facilityId === selectedFacilityId);

  // Map Component for picking location
  const LocationPickerMarker = () => {
    useMapEvents({
      click(e) {
        setFacLatitude(e.latlng.lat);
        setFacLongitude(e.latlng.lng);
        setIsLocationConfirmed(false); // require re-confirmation on new selection
      },
    });
    return facLatitude && facLongitude ? (
      <Marker position={[facLatitude, facLongitude]} />
    ) : null;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0c0f17]' : 'bg-gray-50'} flex relative overflow-hidden`}>
      <SportyWatermarks />
      <Sidebar activeMenu="courts-management" />

      <div className="flex-1 h-screen overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-page">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display tracking-tight">
              Quản lý sân bãi
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-label mt-1">
              Thành lập cơ sở thể thao và quản lý danh sách sân con thuộc quyền sở hữu của bạn.
            </p>
          </div>

          {facilities.length > 0 && (
            <div className="flex items-center bg-gray-150 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-1 rounded-2xl gap-1">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-label transition-all duration-200 active:scale-95 hover:scale-[1.03] cursor-pointer ${
                  activeTab === 'list'
                    ? 'bg-emerald-600 dark:bg-primary text-white dark:text-[#052e14] shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Danh sách sân
              </button>
              {activeFacility?.statusId !== 1 && (
                <button
                  onClick={() => setActiveTab('add-court')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-label transition-all duration-200 active:scale-95 hover:scale-[1.03] cursor-pointer ${
                    activeTab === 'add-court'
                      ? 'bg-emerald-600 dark:bg-primary text-white dark:text-[#052e14] shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  + Thêm sân mới
                </button>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-150 dark:border-red-500/20 rounded-2xl text-sm text-red-600 dark:text-red-400 font-label flex items-start gap-2 max-w-md mx-auto">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold">Đã xảy ra lỗi</h5>
              <p className="text-xs mt-0.5 text-red-500 dark:text-red-400/80">{error}</p>
            </div>
          </div>
        )}

        {isLoadingFacilities ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-label">Đang tải danh sách cơ sở...</p>
          </div>
        ) : (
          <div key={activeTab} className="animate-tab-panel">
            {facilities.length === 0 || activeTab === 'add-facility' ? (
          /* SECTION: Create first Facility form */
          <div className="max-w-xl mx-auto bg-white dark:bg-card-dark border border-gray-200/80 dark:border-border-dark/60 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100 dark:border-border-dark/40">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 dark:bg-primary/10 flex items-center justify-center shrink-0">
                <Building className="w-5 h-5 text-emerald-600 dark:text-primary" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 dark:text-white font-display text-base">
                  Đăng ký cơ sở thể thao
                </h3>
                <p className="text-[10px] text-gray-400 font-label">Tạo điểm đặt sân giao lưu trước khi tạo sân con</p>
              </div>
            </div>

            {facilityFormError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-150 dark:border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400 font-label flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{facilityFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateFacility} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-1.5">
                  Tên cơ sở <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: CLB Cầu lông SmashHub Arena Q10"
                  value={facName}
                  onChange={(e) => setFacName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-1.5">
                    Thành phố <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Hồ Chí Minh"
                    value={facCity}
                    onChange={(e) => setFacCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-1.5">
                    Quận / Huyện <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Quận 10"
                    value={facDistrict}
                    onChange={(e) => setFacDistrict(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-1.5">
                  Địa chỉ chi tiết
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 285 Cách Mạng Tháng 8, Phường 12"
                  value={facAddress}
                  onChange={(e) => setFacAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label transition-colors"
                />
              </div>

              {/* Cấu hình giờ hoạt động 7 ngày */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-2">
                  Giờ hoạt động
                </label>
                <div className="border border-gray-200 dark:border-border-dark rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-white/5">
                  {operatingHours.map((h, i) => (
                    <div key={h.dayOfWeek} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white dark:bg-card-dark gap-3">
                      <div className="flex items-center gap-3 min-w-[100px]">
                        <input
                          type="checkbox"
                          checked={h.isOpen}
                          onChange={(e) => {
                            const newHours = [...operatingHours];
                            newHours[i].isOpen = e.target.checked;
                            setOperatingHours(newHours);
                          }}
                          className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {h.label}
                        </span>
                      </div>
                      
                      {h.isOpen ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={h.openTime}
                            onChange={(e) => {
                              const newHours = [...operatingHours];
                              newHours[i].openTime = e.target.value;
                              setOperatingHours(newHours);
                            }}
                            className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-border-dark text-xs bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white cursor-text focus:outline-none focus:border-emerald-500"
                          />
                          <span className="text-gray-400 text-xs font-bold">-</span>
                          <input
                            type="time"
                            value={h.closeTime}
                            onChange={(e) => {
                              const newHours = [...operatingHours];
                              newHours[i].closeTime = e.target.value;
                              setOperatingHours(newHours);
                            }}
                            className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-border-dark text-xs bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white cursor-text focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      ) : (
                        <div className="flex-1 text-right text-xs text-red-500 italic px-2 font-bold font-label">Đóng cửa</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Map Selection (chỉ hiển thị tham khảo vị trí) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-1.5 flex justify-between">
                  <span>Vị trí tham khảo trên bản đồ</span>
                  <span className="text-[10px] text-gray-400 font-normal">Click vào bản đồ để đánh dấu</span>
                </label>
                <div className="h-64 rounded-xl overflow-hidden border border-gray-200 dark:border-border-dark relative z-0">
                  <MapContainer 
                    center={[10.762622, 106.660172]} 
                    zoom={13} 
                    minZoom={5}
                    maxBounds={[[4.0, 100.0], [24.0, 122.0]]}
                    maxBoundsViscosity={1.0}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; Google Maps'
                      url="https://mt1.google.com/vt/lyrs=m&hl=vi&gl=VN&x={x}&y={y}&z={z}"
                    />
                    <Marker position={[16.5, 112.0]} icon={hoangSaIcon} interactive={false} />
                    <Marker position={[10.0, 114.0]} icon={truongSaIcon} interactive={false} />
                    <Marker position={[14.0, 113.0]} icon={southSeaIcon} interactive={false} />
                    <LocationPickerMarker />
                  </MapContainer>
                </div>
                {facLatitude && facLongitude ? (
                  <div className="mt-3 flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-150 dark:border-white/10 animate-fade-in">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-label">Tọa độ đã chọn</span>
                      <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300">
                        {facLatitude.toFixed(6)}, {facLongitude.toFixed(6)}
                      </span>
                    </div>
                    {isLocationConfirmed ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Đã xác nhận vị trí
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsLocationConfirmed(false)}
                          className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer"
                        >
                          Chỉnh sửa
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsLocationConfirmed(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-primary dark:hover:bg-primary/95 text-white dark:text-[#052e14] text-xs font-black rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Xác nhận vị trí này
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-500/10 flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0" />
                    <span className="text-xs text-amber-800 dark:text-amber-400/90 font-bold font-label">
                      Vui lòng click chọn một vị trí bất kỳ trên bản đồ ở trên.
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-border-dark/40">
                <Button
                  type="submit"
                  isLoading={isSubmittingFacility}
                  disabled={!isLocationConfirmed || isSubmittingFacility}
                  className={`flex-1 ${!isLocationConfirmed ? 'opacity-40 cursor-not-allowed select-none' : ''}`}
                >
                  <Plus className="w-4 h-4" />
                  Tạo cơ sở mới
                </Button>
                {facilities.length > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setActiveTab('list')}
                    className="px-4 py-2.5 rounded-xl text-xs"
                  >
                    Hủy
                  </Button>
                )}
              </div>
            </form>
          </div>
        ) : activeTab === 'add-court' ? (
          /* SECTION: Add Court form */
          <div className="max-w-xl mx-auto bg-white dark:bg-card-dark border border-gray-200/80 dark:border-border-dark/60 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100 dark:border-border-dark/40">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 dark:bg-primary/10 flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5 text-emerald-600 dark:text-primary" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 dark:text-white font-display text-base">
                  Thêm sân con mới
                </h3>
                <p className="text-[10px] text-gray-400 font-label">Thêm sân vào cơ sở đang chọn: {activeFacility?.name}</p>
              </div>
            </div>

            {courtFormError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-150 dark:border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400 font-label flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{courtFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCourt} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-1.5">
                  Tên sân con <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Sân số 1 (VIP), Sân Cầu lông A"
                  value={courtNameInput}
                  onChange={(e) => setCourtNameInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-1.5">
                  Môn thể thao áp dụng <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={courtSportId}
                  onChange={(e) => setCourtSportId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label text-sm transition-colors"
                >
                  <option value="">-- Chọn bộ môn thể thao --</option>
                  {sports.map((sport) => (
                    <option key={sport.sportId} value={sport.sportId}>
                      {sport.sportName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4 space-y-6">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label">
                  Bảng giá theo khung giờ hoạt động <span className="text-red-500">*</span>
                </label>
                
                {groupedCourtCosts.map((group, groupIdx) => (
                  <div key={group.id} className="p-4 bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-border-dark/60 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200/65 dark:border-border-dark/40 pb-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-gray-900 dark:text-white font-display">
                          Nhóm ngày: {group.label}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold font-label">
                          Giờ hoạt động: {group.openTime.substring(0, 5)} - {group.closeTime.substring(0, 5)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => addCostRow(groupIdx, false)}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-border-dark px-2.5 py-1.5 rounded-lg shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" /> Thêm khung giờ
                      </button>
                    </div>

                    <div className="space-y-3">
                      {group.costs.map((c, costIdx) => (
                        <div key={c.id} className="p-3 bg-white dark:bg-card-dark border border-gray-100 dark:border-border-dark/30 rounded-xl relative group">
                          {group.costs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeCostRow(groupIdx, costIdx, false)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-border-dark rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-all cursor-pointer z-10"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                          
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 mb-1">Giờ bắt đầu</label>
                              <input
                                type="time" required value={c.startTime}
                                min={group.openTime.substring(0, 5)}
                                max={group.closeTime.substring(0, 5)}
                                onChange={(e) => updateCostField(groupIdx, costIdx, 'startTime', e.target.value, false)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-border-dark text-xs bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 mb-1">Giờ kết thúc</label>
                              <input
                                type="time" required value={c.endTime}
                                min={group.openTime.substring(0, 5)}
                                max={group.closeTime.substring(0, 5)}
                                onChange={(e) => updateCostField(groupIdx, costIdx, 'endTime', e.target.value, false)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-border-dark text-xs bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 mb-1">Block (phút)</label>
                              <select
                                required value={c.durationMinutes}
                                onChange={(e) => updateCostField(groupIdx, costIdx, 'durationMinutes', e.target.value, false)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 text-xs"
                              >
                                <option value="30">30</option>
                                <option value="60">60</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 mb-1">Giá tiền (VNĐ)</label>
                              <input
                                type="number" required min="0" placeholder="VD: 100000" value={c.cost}
                                onChange={(e) => updateCostField(groupIdx, costIdx, 'cost', e.target.value, false)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-border-dark text-xs bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-border-dark/40">
                <Button
                  type="submit"
                  isLoading={isSubmittingCourt}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4" />
                  Tạo sân con
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2.5 rounded-xl text-xs"
                >
                  Hủy
                </Button>
              </div>
            </form>
          </div>
        ) : (
          /* SECTION: List of Courts */
          <div className="space-y-6">
            
            {/* Facility Selector Bar */}
            <div className="bg-white dark:bg-card-dark border border-gray-200/80 dark:border-border-dark/60 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Building className="w-5.5 h-5.5 text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-label block">Chọn cơ sở quản lý</span>
                  <select
                    value={selectedFacilityId || ''}
                    onChange={(e) => setSelectedFacilityId(parseInt(e.target.value))}
                    className="mt-0.5 text-sm font-black text-gray-900 dark:text-white bg-transparent focus:outline-none font-display cursor-pointer"
                  >
                    {facilities.map((fac) => (
                      <option key={fac.facilityId} value={fac.facilityId}>
                        {fac.name} {fac.statusId === 1 ? '(Chờ duyệt)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('add-facility')}
                  className="py-2.5 px-3.5 text-xs w-full sm:w-auto text-center"
                >
                  + Đăng ký cơ sở mới
                </Button>
              </div>
            </div>

            {/* Facility Location Details */}
            {activeFacility && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-label pl-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>Địa chỉ: {activeFacility.address}, {activeFacility.district}, {activeFacility.city}</span>
              </div>
            )}

            {/* Pending Approval Banner */}
            {activeFacility?.statusId === 1 && (
              <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl text-sm text-amber-700 dark:text-amber-400 font-label flex items-start gap-3 max-w-xl mx-auto mb-6">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
                <div>
                  <h5 className="font-bold text-sm">Cơ sở đang chờ phê duyệt</h5>
                  <p className="text-xs mt-1 text-amber-600 dark:text-amber-400/80 leading-relaxed">
                    Cơ sở "{activeFacility.name}" của bạn đang được quản trị viên xem xét. 
                    Bạn sẽ có thể tạo sân con và bắt đầu vận hành sau khi cơ sở được phê duyệt thành công.
                  </p>
                </div>
              </div>
            )}

            {/* List of Courts */}
            {isLoadingCourts ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400 font-label">Đang tải danh sách sân con...</p>
              </div>
            ) : courts.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-card-dark/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-border-dark/40 p-8">
                <Sparkles className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3 animate-pulse" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white font-display">Cơ sở chưa có sân con nào</h3>
                {activeFacility?.statusId === 1 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-label mt-2 max-w-sm mx-auto leading-relaxed">
                    Cơ sở đang chờ phê duyệt. Bạn sẽ có thể bắt đầu tạo sân con sau khi cơ sở được phê duyệt thành công.
                  </p>
                ) : (
                  <>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-label mt-1 max-w-sm mx-auto leading-relaxed">
                      Bấm nút bên dưới để bắt đầu thêm các sân con (sân cầu lông số 1, sân bóng bàn A, v.v...) vào điểm chơi này.
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => setActiveTab('add-court')}
                      className="mt-4 py-2.5 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm sân con ngay
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {courts.map((court) => {
                  const currentStatus = courtStatuses?.find(s => s.statusId === court.statusId);
                  const statusName = currentStatus ? currentStatus.statusName : 'Không rõ';
                  // Use specific styling for 'Bảo trì' based on name or ID, but avoid hardcoding texts directly if possible.
                  // We'll use a dynamic badge style.
                  const isReady = statusName.toLowerCase().includes('sẵn sàng');
                  
                  return (
                    <div 
                      key={court.courtId}
                      className="bg-white dark:bg-card-dark border border-gray-200/80 dark:border-border-dark/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        {/* Court Name & Badges */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-base text-gray-900 dark:text-white font-display truncate">
                              {court.courtName}
                            </h4>
                            <p className="text-[10px] text-gray-400 font-label mt-0.5 uppercase tracking-wider font-semibold">
                              Bộ môn: {court.sportName}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            {/* Court Status Badge */}
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${
                              !isReady
                                ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20'
                                : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-primary border-emerald-200 dark:border-emerald-500/20'
                            }`}>
                              {statusName}
                            </span>

                            {/* Active/Inactive state */}
                            <span className={`text-[8px] font-bold tracking-wider uppercase ${
                              court.isActive ? 'text-emerald-500' : 'text-gray-400'
                            }`}>
                              {court.isActive ? 'Hoạt động' : 'Đóng cửa'}
                            </span>
                          </div>
                        </div>

                        {/* Court details illustration icon */}
                        <div className="h-20 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-center text-gray-400">
                          <Activity className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                        </div>
                      </div>

                      {/* Card Action footer */}
                      <div className="flex items-center gap-3.5 mt-5 pt-4 border-t border-gray-50 dark:border-white/5">
                        <Button
                          variant="outline"
                          onClick={() => openEditModal(court)}
                          className="flex-1 py-2.5 text-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Chỉnh sửa
                        </Button>
                        <button
                          onClick={() => handleDeleteCourt(court.courtId, court.courtName)}
                          className="p-2 border border-transparent hover:border-red-150 hover:bg-red-50/20 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-xl transition-all cursor-pointer"
                          title="Xóa sân khỏi hệ thống"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
          </div>
        )}

        </div>
      </div>

      {/* MODAL: CHỈNH SỬA SÂN CON */}
      {editingCourt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-card-dark w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-150 dark:border-border-dark/60 transform transition-all duration-300 animate-scaleIn">
            
            <div className="relative p-6 border-b border-gray-100 dark:border-border-dark/40 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white font-display">Cập nhật thông tin sân</h3>
                <p className="text-[10px] text-gray-400 font-label mt-0.5">Mã sân con: #{editingCourt.courtId}</p>
              </div>
              <button 
                onClick={() => setEditingCourt(null)}
                className="p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourtEdit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-150 dark:border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400 font-label flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-1.5">
                  Tên sân con
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-1.5">
                  Môn thể thao
                </label>
                <select
                  required
                  value={editSportId}
                  onChange={(e) => setEditSportId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label text-sm transition-colors"
                >
                  {sports.map((sport) => (
                    <option key={sport.sportId} value={sport.sportId}>
                      {sport.sportName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-1.5">
                  Trạng thái đặt sân
                </label>
                <select
                  required
                  value={editStatusId}
                  onChange={(e) => setEditStatusId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label text-sm transition-colors"
                >
                  <option value="">-- Chọn trạng thái --</option>
                  {courtStatuses && courtStatuses.map((status) => (
                    <option key={status.statusId} value={status.statusId}>
                      {status.statusName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4 space-y-4">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label">
                  Bảng giá theo khung giờ hoạt động
                </label>
                
                <div className="space-y-4 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
                  {groupedEditCosts.map((group, groupIdx) => (
                    <div key={group.id} className="p-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-border-dark/60 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-border-dark/30 pb-2">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-gray-900 dark:text-white font-display">
                            Nhóm ngày: {group.label}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold font-label">
                            Giờ hoạt động: {group.openTime.substring(0, 5)} - {group.closeTime.substring(0, 5)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => addCostRow(groupIdx, true)}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-border-dark px-2 py-1 rounded-lg shadow-sm"
                        >
                          <Plus className="w-3 h-3" /> Thêm
                        </button>
                      </div>

                      <div className="space-y-3">
                        {group.costs.map((c, costIdx) => (
                          <div key={c.id} className="p-3 bg-white dark:bg-card-dark border border-gray-150 dark:border-border-dark/30 rounded-xl relative group">
                            {group.costs.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeCostRow(groupIdx, costIdx, true)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-border-dark rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-all cursor-pointer z-10"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                            
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 mb-1">Giờ bắt đầu</label>
                                <input
                                  type="time" required value={c.startTime}
                                  min={group.openTime.substring(0, 5)}
                                  max={group.closeTime.substring(0, 5)}
                                  onChange={(e) => updateCostField(groupIdx, costIdx, 'startTime', e.target.value, true)}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-border-dark text-xs bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 mb-1">Giờ kết thúc</label>
                                <input
                                  type="time" required value={c.endTime}
                                  min={group.openTime.substring(0, 5)}
                                  max={group.closeTime.substring(0, 5)}
                                  onChange={(e) => updateCostField(groupIdx, costIdx, 'endTime', e.target.value, true)}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-border-dark text-xs bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 mb-1">Block (phút)</label>
                                <select
                                  required value={c.durationMinutes}
                                  onChange={(e) => updateCostField(groupIdx, costIdx, 'durationMinutes', e.target.value, true)}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 text-xs"
                                >
                                  <option value="30">30</option>
                                  <option value="60">60</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 mb-1">Giá tiền (VNĐ)</label>
                                <input
                                  type="number" required min="0" placeholder="VD: 100000" value={c.cost}
                                  onChange={(e) => updateCostField(groupIdx, costIdx, 'cost', e.target.value, true)}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-border-dark text-xs bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-b border-gray-100 dark:border-border-dark/40 my-3">
                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-white font-display">
                    Trạng thái hoạt động
                  </label>
                  <p className="text-[10px] text-gray-400 font-label mt-0.5">Tắt hoạt động để tạm ẩn sân khỏi danh sách đặt</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsActive(!editIsActive)}
                  className="text-gray-500 hover:text-emerald-500 transition-colors focus:outline-none cursor-pointer"
                >
                  {editIsActive ? (
                    <ToggleRight className="w-10 h-10 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-300 dark:text-white/20" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  isLoading={isSavingEdit}
                  className="flex-1"
                >
                  <Save className="w-4 h-4" />
                  Lưu thay đổi
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingCourt(null)}
                  className="px-4 py-2.5 rounded-xl text-xs"
                >
                  Hủy
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
