import React, { useState, useEffect } from 'react';
import { X, Plus, AlertTriangle, Save, ToggleRight, ToggleLeft } from 'lucide-react';
import Button from '../../../components/ui/Button';

export default function EditCourtModal({
  isOpen,
  onClose,
  court,
  sports,
  courtStatuses,
  fetchFacilityHours,
  fetchCourtCosts,
  updateCourtAll,
  updateCourt,
  onSave
}) {
  const [editName, setEditName] = useState('');
  const [editSportId, setEditSportId] = useState('');
  const [editStatusId, setEditStatusId] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [groupedEditCosts, setGroupedEditCosts] = useState([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (court) {
      setEditName(court.courtName || '');
      setEditSportId(court.sportId || '');
      setEditStatusId(court.statusId || '');
      setEditIsActive(court.isActive !== undefined ? court.isActive : true);
      setEditError('');
      setGroupedEditCosts([]);

      const loadCourtData = async () => {
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

      loadCourtData();
    }
  }, [court, fetchFacilityHours, fetchCourtCosts]);

  if (!isOpen || !court) return null;

  const addCostRow = (groupIndex) => {
    setGroupedEditCosts(prev => prev.map((group, idx) => {
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

  const removeCostRow = (groupIndex, costIndex) => {
    setGroupedEditCosts(prev => prev.map((group, idx) => {
      if (idx !== groupIndex) return group;
      const newCosts = [...group.costs];
      newCosts.splice(costIndex, 1);
      return {
        ...group,
        costs: newCosts
      };
    }));
  };

  const updateCostField = (groupIndex, costIndex, field, value) => {
    setGroupedEditCosts(prev => prev.map((group, idx) => {
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

  const handleSubmit = async (e) => {
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

      await updateCourtAll(court.courtId, bulkData);

      await updateCourt(court.courtId, {
        courtName: editName,
        sportId: parseInt(editSportId),
        statusId: parseInt(editStatusId),
        isActive: editIsActive
      });

      onSave();
      onClose();
    } catch (err) {
      const backendMessage = err.response?.data?.message || err.response?.data?.title || err.message;
      setEditError(backendMessage || 'Lỗi khi lưu thay đổi sân.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="bg-white dark:bg-card-dark w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-150 dark:border-border-dark/60 transform transition-all duration-300 animate-scaleIn z-10">
        
        <div className="relative p-6 border-b border-gray-100 dark:border-border-dark/40 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white font-display">Cập nhật thông tin sân</h3>
            <p className="text-[10px] text-gray-400 font-label mt-0.5">Mã sân con: #{court.courtId}</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {editError && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-150 dark:border-red-500/20 rounded-xl text-xs text-red-650 dark:text-red-400 font-label flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{editError}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 font-label mb-1.5">
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
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 font-label mb-1.5">
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
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 font-label mb-1.5">
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
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 font-label">
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
                      onClick={() => addCostRow(groupIdx)}
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
                            onClick={() => removeCostRow(groupIdx, costIdx)}
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
                              onChange={(e) => updateCostField(groupIdx, costIdx, 'startTime', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-border-dark text-xs bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 mb-1">Giờ kết thúc</label>
                            <input
                              type="time" required value={c.endTime}
                              min={group.openTime.substring(0, 5)}
                              max={group.closeTime.substring(0, 5)}
                              onChange={(e) => updateCostField(groupIdx, costIdx, 'endTime', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-border-dark text-xs bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 mb-1">Block (phút)</label>
                            <select
                              required value={c.durationMinutes}
                              onChange={(e) => updateCostField(groupIdx, costIdx, 'durationMinutes', e.target.value)}
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
                              onChange={(e) => updateCostField(groupIdx, costIdx, 'cost', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-border-dark text-xs bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
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
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs"
            >
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
