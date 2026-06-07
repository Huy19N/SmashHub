import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, CalendarDays, ChevronLeft, ChevronRight, Clock, Info } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useCourt, useBookings } from '../hooks/useBookings';
import { getCourtCostByCourtIdAPI } from '../api/bookings.api';
import { toast } from 'react-hot-toast';

// Generate 30-min time labels from START_HOUR to END_HOUR
const START_HOUR = 5;
const END_HOUR = 23;
const SLOT_MINUTES = 30;

function generateTimeSlots() {
  const slots = [];
  for (let h = START_HOUR; h < END_HOUR; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  slots.push(`${String(END_HOUR).padStart(2, '0')}:00`);
  return slots;
}

const TIME_SLOTS = generateTimeSlots();
const SLOT_COUNT = TIME_SLOTS.length - 1;

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

// ─── Calendar Popup Component ────────────────────────────────
function CalendarPopup({ selectedDate, onSelect, onClose }) {
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
  const popupRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // 0=CN, 1=T2, ..., 6=T7  →  shift so T2=0
  const firstDayRaw = new Date(viewYear, viewMonth, 1).getDay();
  const firstDay = firstDayRaw === 0 ? 6 : firstDayRaw - 1;

  const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

  const handleDayClick = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    if (d < today) return;
    onSelect(d);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30">
      <div ref={popupRef} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-5 w-[340px] border border-gray-200 dark:border-gray-700">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
            tháng {viewMonth + 1} năm {viewYear}
          </span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(d => (
            <div key={d} className="text-center text-[11px] font-bold text-gray-400 uppercase py-1">{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const d = new Date(viewYear, viewMonth, day);
            const isPast = d < today;
            const isToday = isSameDay(d, today);
            const isSelected = isSameDay(d, selectedDate);

            return (
              <button
                key={day}
                disabled={isPast}
                onClick={() => handleDayClick(day)}
                className={`aspect-square flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-150 ${isPast
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                    : isToday
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="px-4 py-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            Hủy
          </button>
          <button
            onClick={() => { onSelect(today); onClose(); }}
            className="px-4 py-1.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
          >
            Hôm nay
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main BookingModal ───────────────────────────────────────
export default function BookingModal({ isOpen, onClose, facility }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  // Multi-selection: array of { courtId, slotIdx } objects
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const dragCourtRef = useRef(null);
  const dragStartIdx = useRef(null);

  const [allCourtCosts, setAllCourtCosts] = useState({});
  const [loadingCosts, setLoadingCosts] = useState(false);

  const { courts, fetchCourts, loading: loadingCourts } = useCourt();
  const { bookings, fetchBookings, createBooking, loading: bookingActionLoading } = useBookings();

  useEffect(() => {
    if (isOpen && facility) {
      fetchCourts(facility.facilityId || facility.id);
      fetchBookings();
    }
  }, [isOpen, facility, fetchCourts, fetchBookings]);

  useEffect(() => {
    if (courts.length === 0) return;
    setLoadingCosts(true);
    const promises = courts.map(c =>
      getCourtCostByCourtIdAPI(c.courtId)
        .then(res => ({ courtId: c.courtId, costs: res.data || [] }))
        .catch(() => ({ courtId: c.courtId, costs: [] }))
    );
    Promise.all(promises).then(results => {
      const map = {};
      results.forEach(r => { map[r.courtId] = r.costs; });
      setAllCourtCosts(map);
      setLoadingCosts(false);
    });
  }, [courts]);

  useEffect(() => {
    setSelectedSlots([]);
  }, [selectedDate]);

  useEffect(() => {
    if (isDragging) {
      const handler = () => {
        setIsDragging(false);
        dragCourtRef.current = null;
        dragStartIdx.current = null;
      };
      window.addEventListener('mouseup', handler);
      return () => window.removeEventListener('mouseup', handler);
    }
  }, [isDragging]);

  if (!isOpen || !facility) return null;

  // ─── Helpers ─────────────────────
  const formatDateForApi = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const selectedDateStr = formatDateForApi(selectedDate);

  const getBookingsForCourt = (courtId) =>
    (bookings || []).filter(b => b.courtId === courtId && b.startTime?.startsWith(selectedDateStr));

  const getSlotStatus = (courtId, slotIdx) => {
    const slotStartMin = timeToMinutes(TIME_SLOTS[slotIdx]);
    const slotEndMin = timeToMinutes(TIME_SLOTS[slotIdx + 1]);

    // Check if slot is in the past for today's date
    const now = new Date();
    if (selectedDate.getFullYear() === now.getFullYear() &&
        selectedDate.getMonth() === now.getMonth() &&
        selectedDate.getDate() === now.getDate()) {
      const currentMin = now.getHours() * 60 + now.getMinutes();
      if (slotStartMin < currentMin) return 'locked'; // Past slots are locked
    }

    const courtBookings = getBookingsForCourt(courtId);
    for (const b of courtBookings) {
      const bStart = b.startTime.split('T')[1]?.substring(0, 5);
      const bEnd = b.endTime.split('T')[1]?.substring(0, 5);
      if (!bStart || !bEnd) continue;
      if (slotStartMin < timeToMinutes(bEnd) && slotEndMin > timeToMinutes(bStart)) return 'booked';
    }

    const costs = allCourtCosts[courtId] || [];
    if (costs.length === 0) return 'locked';
    for (const cost of costs) {
      const cStart = timeToMinutes(cost.startTime.substring(0, 5));
      const cEnd = timeToMinutes(cost.endTime.substring(0, 5));
      if (slotStartMin >= cStart && slotEndMin <= cEnd) return 'available';
    }
    return 'locked';
  };

  const getSlotCost = (courtId, slotIdx) => {
    const slotStartMin = timeToMinutes(TIME_SLOTS[slotIdx]);
    const costs = allCourtCosts[courtId] || [];
    for (const cost of costs) {
      const cStart = timeToMinutes(cost.startTime.substring(0, 5));
      const cEnd = timeToMinutes(cost.endTime.substring(0, 5));
      if (slotStartMin >= cStart && slotStartMin < cEnd) {
        return (cost.cost / cost.durationMinutes) * SLOT_MINUTES;
      }
    }
    return 0;
  };

  // ─── Slot selection helpers ──────
  const slotKey = (courtId, slotIdx) => `${courtId}:${slotIdx}`;
  const isSlotSelected = (courtId, slotIdx) =>
    selectedSlots.some(s => s.courtId === courtId && s.slotIdx === slotIdx);

  const toggleSlot = (courtId, slotIdx) => {
    if (isSlotSelected(courtId, slotIdx)) {
      setSelectedSlots(prev => prev.filter(s => !(s.courtId === courtId && s.slotIdx === slotIdx)));
    } else {
      setSelectedSlots(prev => [...prev, { courtId, slotIdx }]);
    }
  };

  const addSlotRange = (courtId, fromIdx, toIdx) => {
    const start = Math.min(fromIdx, toIdx);
    const end = Math.max(fromIdx, toIdx);
    const newSlots = [];
    for (let i = start; i <= end; i++) {
      if (getSlotStatus(courtId, i) === 'available' && !isSlotSelected(courtId, i)) {
        newSlots.push({ courtId, slotIdx: i });
      }
    }
    if (newSlots.length > 0) {
      setSelectedSlots(prev => [...prev, ...newSlots]);
    }
  };

  // ─── Mouse handlers ──────────────
  const handleMouseDown = (courtId, slotIdx) => {
    if (getSlotStatus(courtId, slotIdx) !== 'available') return;
    setIsDragging(true);
    dragCourtRef.current = courtId;
    dragStartIdx.current = slotIdx;
    // Toggle single slot on mousedown
    toggleSlot(courtId, slotIdx);
  };

  const handleMouseEnter = (courtId, slotIdx) => {
    if (!isDragging || courtId !== dragCourtRef.current) return;
    if (getSlotStatus(courtId, slotIdx) !== 'available') return;
    // Add range from drag start to current
    const start = Math.min(dragStartIdx.current, slotIdx);
    const end = Math.max(dragStartIdx.current, slotIdx);
    // Remove old drag range for this court, then add new range
    setSelectedSlots(prev => {
      // Keep non-drag slots and slots from other courts
      const keep = prev.filter(s => s.courtId !== courtId || s.slotIdx < start || s.slotIdx > end);
      const newSlots = [];
      for (let i = start; i <= end; i++) {
        if (getSlotStatus(courtId, i) === 'available') {
          newSlots.push({ courtId, slotIdx: i });
        }
      }
      return [...keep, ...newSlots];
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragCourtRef.current = null;
    dragStartIdx.current = null;
  };

  // ─── Group selected slots into contiguous ranges per court ───
  const getSelectionGroups = () => {
    const groups = [];
    const byCourt = {};
    selectedSlots.forEach(s => {
      if (!byCourt[s.courtId]) byCourt[s.courtId] = [];
      byCourt[s.courtId].push(s.slotIdx);
    });

    Object.entries(byCourt).forEach(([courtId, slots]) => {
      const sorted = [...slots].sort((a, b) => a - b);
      let rangeStart = sorted[0];
      let rangeEnd = sorted[0];
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === rangeEnd + 1) {
          rangeEnd = sorted[i];
        } else {
          groups.push({ courtId: Number(courtId), startIdx: rangeStart, endIdx: rangeEnd });
          rangeStart = sorted[i];
          rangeEnd = sorted[i];
        }
      }
      groups.push({ courtId: Number(courtId), startIdx: rangeStart, endIdx: rangeEnd });
    });

    return groups;
  };

  // ─── Calculate totals ────────────
  const totalSlotCount = selectedSlots.length;
  const totalMinutes = totalSlotCount * SLOT_MINUTES;
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;
  const totalTimeStr = totalSlotCount === 0
    ? '—'
    : totalHours > 0
      ? (totalMins > 0 ? `${totalHours}h${String(totalMins).padStart(2, '0')}` : `${totalHours}h00`)
      : `${totalMins} phút`;

  let totalCost = 0;
  selectedSlots.forEach(s => { totalCost += getSlotCost(s.courtId, s.slotIdx); });

  const clearSelection = () => setSelectedSlots([]);

  // ─── Book (creates one booking per contiguous range) ───
  const handleBook = async () => {
    const groups = getSelectionGroups();
    if (groups.length === 0) {
      toast.error('Vui lòng chọn ít nhất một khung giờ');
      return;
    }
    try {
      for (const g of groups) {
        const startTime = `${selectedDateStr}T${TIME_SLOTS[g.startIdx]}:00`;
        const endTime = `${selectedDateStr}T${TIME_SLOTS[g.endIdx + 1]}:00`;
        await createBooking({ courtId: g.courtId, startTime, endTime });
      }
      toast.success(`Đặt sân thành công! (${groups.length} lượt)`);
      onClose();
    } catch (err) {
      toast.error('Có lỗi xảy ra: ' + (err?.response?.data?.message || err?.message || 'Unknown'));
    }
  };

  const isLoading = loadingCourts || loadingCosts;
  const groups = getSelectionGroups();

  // ─── Render ──────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="bg-white dark:bg-card-dark w-full max-w-[95vw] 2xl:max-w-screen-2xl shadow-2xl overflow-hidden flex flex-col rounded-t-3xl sm:rounded-3xl"
        style={{ maxHeight: '96vh', height: '90vh' }}
        onMouseUp={handleMouseUp}
      >
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-100 dark:border-border-dark flex items-center justify-between bg-white dark:bg-card-dark z-10">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Đặt sân — {facility.name || facility.title}
            </h2>
            <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
              <MapPin size={12} />
              <span>{facility.address || facility.district || ''}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Date button → opens calendar */}
            <button
              onClick={() => setShowCalendar(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              <ChevronLeft
                size={14}
                className="hover:opacity-70 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  const prev = new Date(selectedDate);
                  const today = new Date(); today.setHours(0, 0, 0, 0);
                  if (prev > today) { prev.setDate(prev.getDate() - 1); setSelectedDate(prev); }
                }}
              />
              <CalendarDays size={14} />
              <span>{selectedDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
              <ChevronRight
                size={14}
                className="hover:opacity-70 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  const next = new Date(selectedDate);
                  next.setDate(next.getDate() + 1);
                  setSelectedDate(next);
                }}
              />
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="px-5 py-2.5 border-b border-gray-100 dark:border-border-dark flex items-center gap-5 text-xs font-semibold bg-gray-50/80 dark:bg-gray-800/50">
          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
            <span className="w-4 h-3 rounded-sm bg-white border border-gray-300"></span> Trống
          </div>
          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
            <span className="w-4 h-3 rounded-sm bg-rose-500/80"></span> Đã đặt
          </div>
          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
            <span className="w-4 h-3 rounded-sm bg-gray-300"></span> Khóa
          </div>
          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
            <span className="w-4 h-3 rounded-sm bg-emerald-400 border border-emerald-500"></span> Đã chọn
          </div>
          {selectedSlots.length > 0 && (
            <button onClick={clearSelection} className="ml-auto text-emerald-600 hover:text-emerald-800 underline underline-offset-2 text-xs font-bold">
              Xóa chọn ({selectedSlots.length} ô)
            </button>
          )}
        </div>

        {/* Hint */}
        <div className="px-5 py-1.5 text-center text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/20 font-medium">
          <Info size={11} className="inline mr-1 -mt-0.5" />
          Kéo chuột để chọn khung giờ liên tục, hoặc nhấn từng ô để chọn nhiều khung rời. Mỗi ô = 30 phút.
        </div>

        {/* Timeline Grid */}
        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar" style={{ minHeight: 0 }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <span className="ml-3 text-sm text-gray-500">Đang tải dữ liệu...</span>
            </div>
          ) : courts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Clock className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Không có sân nào trong cơ sở này.</p>
            </div>
          ) : (
            <div className="min-w-max">
              <table className="w-full border-collapse select-none">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-20 bg-emerald-800 text-white text-xs font-bold px-4 py-4 border-r border-emerald-900 min-w-[160px] w-[160px] shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                      Sân
                    </th>
                    {TIME_SLOTS.slice(0, SLOT_COUNT).map((t, idx) => (
                      <th key={idx} className="bg-emerald-700 text-emerald-50 text-[11px] font-semibold px-0 py-4 border-r border-emerald-800/50 min-w-[60px] w-[60px] text-center whitespace-nowrap">
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courts.map((court) => (
                    <tr key={court.courtId} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="sticky left-0 z-10 bg-white dark:bg-card-dark border-r border-gray-200 dark:border-gray-700 px-4 py-3 shadow-[2px_0_5px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.2)]">
                        <div className="text-[13px] font-bold text-gray-800 dark:text-gray-100 truncate" title={court.courtName}>
                          {court.courtName}
                        </div>
                      </td>
                      {Array.from({ length: SLOT_COUNT }).map((_, slotIdx) => {
                        const status = getSlotStatus(court.courtId, slotIdx);
                        const sel = isSlotSelected(court.courtId, slotIdx);

                        // Check neighbors for rounded corners
                        const selLeft = slotIdx > 0 && isSlotSelected(court.courtId, slotIdx - 1);
                        const selRight = slotIdx < SLOT_COUNT - 1 && isSlotSelected(court.courtId, slotIdx + 1);

                        let bgClass = '';
                        let cursor = 'cursor-pointer';
                        if (status === 'booked') {
                          bgClass = 'bg-rose-400/70 dark:bg-rose-600/50';
                          cursor = 'cursor-not-allowed';
                        } else if (status === 'locked') {
                          bgClass = 'bg-gray-200/80 dark:bg-gray-700/60';
                          cursor = 'cursor-not-allowed';
                        } else if (sel) {
                          bgClass = 'bg-emerald-300/80 dark:bg-emerald-500/50';
                        } else {
                          bgClass = 'bg-white dark:bg-card-dark hover:bg-emerald-50 dark:hover:bg-emerald-900/10';
                        }

                        return (
                          <td
                            key={slotIdx}
                            className={`border-r border-gray-100 dark:border-gray-800 p-0 relative ${cursor} transition-colors duration-75`}
                            onMouseDown={() => handleMouseDown(court.courtId, slotIdx)}
                            onMouseEnter={() => handleMouseEnter(court.courtId, slotIdx)}
                          >
                            <div
                              className={`w-full h-10 ${bgClass} ${sel && !selLeft ? 'rounded-l-md' : ''
                                } ${sel && !selRight ? 'rounded-r-md' : ''
                                }`}
                            >
                              {sel && !selLeft && (
                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-700 rounded-l"></div>
                              )}
                              {sel && !selRight && (
                                <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-emerald-700 rounded-r"></div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-border-dark bg-emerald-800 text-white px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div>
              <span className="text-xs text-emerald-200 font-medium">Tổng giờ</span>
              <p className="text-xl font-black">{totalTimeStr}</p>
            </div>
            {groups.length > 0 && (
              <div>
                <span className="text-xs text-emerald-200 font-medium">Lượt đặt</span>
                <p className="text-sm font-bold">{groups.length} lượt</p>
              </div>
            )}
            {groups.length > 0 && groups.length <= 3 && (
              <div className="hidden sm:block">
                <span className="text-xs text-emerald-200 font-medium">Chi tiết</span>
                <div className="flex flex-col gap-0.5">
                  {groups.map((g, i) => (
                    <p key={i} className="text-[11px] font-semibold text-emerald-100">
                      {courts.find(c => c.courtId === g.courtId)?.courtName}: {TIME_SLOTS[g.startIdx]} → {TIME_SLOTS[g.endIdx + 1]}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-emerald-200 font-medium">Tổng tiền</span>
              <p className="text-2xl font-black">
                {totalCost > 0 ? `${totalCost.toLocaleString('vi-VN')} đ` : '0 đ'}
              </p>
            </div>
            <Button
              onClick={handleBook}
              disabled={totalSlotCount === 0 || bookingActionLoading}
              className="px-8 py-3 rounded-xl text-sm font-bold bg-amber-400 hover:bg-amber-500 text-gray-900 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bookingActionLoading ? 'Đang xử lý...' : 'TIẾP THEO'}
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Popup */}
      {showCalendar && (
        <CalendarPopup
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
}
