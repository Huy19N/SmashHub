import React, { useState } from 'react';
import { 
  Building, Settings, Plus, Edit3, Trash2, CheckCircle2, AlertTriangle, 
  MapPin, Loader2, Save, X, Activity, ToggleLeft, ToggleRight, Sparkles 
} from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import { useTheme } from '../../../contexts/ThemeContext';
import useCourtsManagement from '../hooks/useCourtsManagement';

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
    createCourtCost,
    updateCourtCost
  } = useCourtsManagement();

  // Active tab: 'list' | 'add-court' | 'add-facility'
  const [activeTab, setActiveTab] = useState('list');

  // Add facility form state
  const [facName, setFacName] = useState('');
  const [facCity, setFacCity] = useState('');
  const [facDistrict, setFacDistrict] = useState('');
  const [facAddress, setFacAddress] = useState('');
  const [isSubmittingFacility, setIsSubmittingFacility] = useState(false);
  const [facilityFormError, setFacilityFormError] = useState('');

  // Add court form state
  const [courtNameInput, setCourtNameInput] = useState('');
  const [courtSportId, setCourtSportId] = useState('');
  const [courtStartTime, setCourtStartTime] = useState('06:00:00');
  const [courtEndTime, setCourtEndTime] = useState('22:00:00');
  const [courtDuration, setCourtDuration] = useState('60');
  const [courtCostValue, setCourtCostValue] = useState('');
  const [isSubmittingCourt, setIsSubmittingCourt] = useState(false);
  const [courtFormError, setCourtFormError] = useState('');

  // Edit court modal state
  const [editingCourt, setEditingCourt] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSportId, setEditSportId] = useState('');
  const [editStatusId, setEditStatusId] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editStartTime, setEditStartTime] = useState('06:00:00');
  const [editEndTime, setEditEndTime] = useState('22:00:00');
  const [editDuration, setEditDuration] = useState('60');
  const [editCostValue, setEditCostValue] = useState('');
  const [editingCourtCost, setEditingCourtCost] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Handle Create Facility
  const handleCreateFacility = async (e) => {
    e.preventDefault();
    setFacilityFormError('');
    if (!facName.trim() || !facCity.trim() || !facDistrict.trim()) {
      setFacilityFormError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    setIsSubmittingFacility(true);
    try {
      await createFacility({
        name: facName,
        city: facCity,
        district: facDistrict,
        address: facAddress
      });
      setFacName('');
      setFacCity('');
      setFacDistrict('');
      setFacAddress('');
      setActiveTab('list');
    } catch (err) {
      setFacilityFormError(err.message || 'Lỗi khi tạo cơ sở mới.');
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

      if (courtCostValue) {
        const formatTime = (t) => t && t.length === 5 ? `${t}:00` : t;
        await createCourtCost(newCourt.courtId, {
           courtId: newCourt.courtId,
           startTime: formatTime(courtStartTime),
           endTime: formatTime(courtEndTime),
           durationMinutes: parseInt(courtDuration),
           cost: parseFloat(courtCostValue)
        });
      }

      setCourtNameInput('');
      setCourtSportId('');
      setCourtStartTime('06:00:00');
      setCourtEndTime('22:00:00');
      setCourtCostValue('');
      setActiveTab('list');
    } catch (err) {
      setCourtFormError(err.message || 'Lỗi khi tạo sân.');
    } finally {
      setIsSubmittingCourt(false);
    }
  };

  // Open edit modal
  const openEditModal = async (court) => {
    setEditingCourt(court);
    setEditName(court.courtName);
    setEditSportId(court.sportId);
    setEditStatusId(court.statusId);
    setEditIsActive(court.isActive);
    setEditError('');
    setEditStartTime('06:00:00');
    setEditEndTime('22:00:00');
    setEditDuration('60');
    setEditCostValue('');
    setEditingCourtCost(null);

    try {
      const costs = await fetchCourtCosts(court.courtId);
      if (costs && costs.length > 0) {
        const activeCost = costs[0];
        setEditingCourtCost(activeCost.courtCostId);
        setEditStartTime(activeCost.startTime || '06:00:00');
        setEditEndTime(activeCost.endTime || '22:00:00');
        setEditDuration(activeCost.durationMinutes ? activeCost.durationMinutes.toString() : '60');
        setEditCostValue(activeCost.cost ? activeCost.cost.toString() : '');
      }
    } catch (e) {
      console.warn("Could not load court costs", e);
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
      await updateCourt(editingCourt.courtId, {
        courtName: editName,
        sportId: parseInt(editSportId),
        statusId: parseInt(editStatusId),
        isActive: editIsActive
      });

      if (editCostValue) {
        const formatTime = (t) => t && t.length === 5 ? `${t}:00` : t;
        const costData = {
          startTime: formatTime(editStartTime),
          endTime: formatTime(editEndTime),
          durationMinutes: parseInt(editDuration),
          cost: parseFloat(editCostValue),
          isActive: editIsActive
        };
        if (editingCourtCost) {
           await updateCourtCost(editingCourtCost, costData);
        } else {
           costData.courtId = editingCourt.courtId;
           delete costData.isActive; // Create request doesn't accept isActive
           await createCourtCost(editingCourt.courtId, costData);
        }
      }

      setEditingCourt(null);
    } catch (err) {
      setEditError(err.message || 'Lỗi khi lưu thay đổi sân.');
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

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0c0f17]' : 'bg-gray-50'} flex`}>
      <Sidebar activeMenu="courts-management" />

      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-screen overflow-y-auto custom-scrollbar">
        
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
                className={`px-4 py-2 rounded-xl text-xs font-bold font-label transition-all cursor-pointer ${
                  activeTab === 'list'
                    ? 'bg-emerald-600 dark:bg-primary text-white dark:text-[#052e14] shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Danh sách sân
              </button>
              <button
                onClick={() => setActiveTab('add-court')}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-label transition-all cursor-pointer ${
                  activeTab === 'add-court'
                    ? 'bg-emerald-600 dark:bg-primary text-white dark:text-[#052e14] shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                + Thêm sân mới
              </button>
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
        ) : facilities.length === 0 || activeTab === 'add-facility' ? (
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
                  placeholder="Ví dụ: CLB Cầu lông SmashClub Arena Q10"
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

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-border-dark/40">
                <button
                  type="submit"
                  disabled={isSubmittingFacility}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingFacility ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Tạo cơ sở mới
                    </>
                  )}
                </button>
                {facilities.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-1.5">
                    Giờ mở cửa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={courtStartTime}
                    onChange={(e) => setCourtStartTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-1.5">
                    Giờ đóng cửa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={courtEndTime}
                    onChange={(e) => setCourtEndTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-1.5">
                    Block thời gian <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={courtDuration}
                    onChange={(e) => setCourtDuration(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label text-sm transition-colors"
                  >
                    <option value="30">30 phút</option>
                    <option value="60">60 phút (1 giờ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-1.5">
                    Giá tiền (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="VD: 100000"
                    value={courtCostValue}
                    onChange={(e) => setCourtCostValue(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-border-dark/40">
                <button
                  type="submit"
                  disabled={isSubmittingCourt}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingCourt ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Tạo sân con
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
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
                        {fac.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('add-facility')}
                  className="px-3.5 py-2 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold font-label transition-colors cursor-pointer w-full sm:w-auto text-center"
                >
                  + Đăng ký cơ sở mới
                </button>
              </div>
            </div>

            {/* Facility Location Details */}
            {activeFacility && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-label pl-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>Địa chỉ: {activeFacility.address}, {activeFacility.district}, {activeFacility.city}</span>
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
                <p className="text-xs text-gray-500 dark:text-gray-400 font-label mt-1 max-w-sm mx-auto leading-relaxed">
                  Bấm nút bên dưới để bắt đầu thêm các sân con (sân cầu lông số 1, sân bóng bàn A, v.v...) vào điểm chơi này.
                </p>
                <button
                  onClick={() => setActiveTab('add-court')}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 dark:bg-primary dark:hover:bg-primary-dark text-white dark:text-[#052e14] px-4 py-2 rounded-xl transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm sân con ngay
                </button>
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
                        <button
                          onClick={() => openEditModal(court)}
                          className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold font-label transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Chỉnh sửa
                        </button>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-1.5">
                    Giờ mở cửa
                  </label>
                  <input
                    type="time"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-1.5">
                    Giờ đóng cửa
                  </label>
                  <input
                    type="time"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-1.5">
                    Block thời gian
                  </label>
                  <select
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label text-sm transition-colors"
                  >
                    <option value="30">30 phút</option>
                    <option value="60">60 phút (1 giờ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-1.5">
                    Giá tiền (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="VD: 100000"
                    value={editCostValue}
                    onChange={(e) => setEditCostValue(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label transition-colors"
                  />
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
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
                >
                  {isSavingEdit ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Lưu thay đổi
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCourt(null)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
