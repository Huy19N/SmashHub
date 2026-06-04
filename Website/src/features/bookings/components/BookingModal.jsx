import React, { useState, useEffect, useCallback } from 'react';
import { X, MapPin, CalendarDays, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useCourt, useCourtCost, useBookings } from '../hooks/useBookings';
import { toast } from 'react-hot-toast';

export default function BookingModal({ isOpen, onClose, facility }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [rangeStart, setRangeStart] = useState(null); // index of first selected slot
  const [rangeEnd, setRangeEnd] = useState(null);     // index of last selected slot

  const { courts, fetchCourts, loading: loadingCourts } = useCourt();
  const { courtCosts, fetchCourtCosts, loading: loadingCosts } = useCourtCost();
  const { bookings, fetchBookings, createBooking, loading: bookingActionLoading } = useBookings();

  useEffect(() => {
    if (isOpen && facility) {
      fetchCourts(facility.facilityId || facility.id);
      fetchBookings();
    }
  }, [isOpen, facility, fetchCourts, fetchBookings]);

  useEffect(() => {
    if (courts.length > 0 && !selectedCourtId) {
      setSelectedCourtId(courts[0].courtId);
    }
  }, [courts]);

  useEffect(() => {
    if (selectedCourtId) {
      fetchCourtCosts(selectedCourtId);
      setRangeStart(null);
      setRangeEnd(null);
    }
  }, [selectedCourtId, fetchCourtCosts]);

  // Reset range when date changes
  useEffect(() => {
    setRangeStart(null);
    setRangeEnd(null);
  }, [selectedDate]);

  if (!isOpen || !facility) return null;

  // Format date helper
  const formatDateForApi = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const selectedDateStr = formatDateForApi(selectedDate);

  // Sort courtCosts by startTime
  const sortedCosts = [...courtCosts].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  // Filter bookings for the selected date and selected court
  const relevantBookings = (bookings || []).filter(b => {
    if (b.courtId !== selectedCourtId) return false;
    return b.startTime?.startsWith(selectedDateStr);
  });

  // Check if a slot overlaps with any existing booking
  const isSlotBooked = (cost) => {
    const costStart = cost.startTime.substring(0, 5);
    return relevantBookings.some(b => {
      const bStart = b.startTime.split('T')[1]?.substring(0, 5);
      const bEnd = b.endTime.split('T')[1]?.substring(0, 5);
      const costEnd = cost.endTime.substring(0, 5);
      // Overlap: costStart < bEnd && costEnd > bStart
      return costStart < bEnd && costEnd > bStart;
    });
  };

  // Build booked status for each slot
  const slotStatuses = sortedCosts.map(cost => ({
    ...cost,
    booked: isSlotBooked(cost)
  }));

  // Handle slot click — range selection logic
  const handleSlotClick = (index) => {
    const slot = slotStatuses[index];
    if (slot.booked) return;

    if (rangeStart === null) {
      // First click — set start
      setRangeStart(index);
      setRangeEnd(index);
    } else if (rangeEnd === index && rangeStart === index) {
      // Click same slot again — deselect
      setRangeStart(null);
      setRangeEnd(null);
    } else {
      // Second click — set range end (expand from start)
      const start = Math.min(rangeStart, index);
      const end = Math.max(rangeStart, index);

      // Check if any slot in the range is booked
      const hasBookedInRange = slotStatuses.slice(start, end + 1).some(s => s.booked);
      if (hasBookedInRange) {
        toast.error('Không thể chọn khoảng giờ có chứa slot đã đặt');
        return;
      }

      setRangeStart(start);
      setRangeEnd(end);
    }
  };

  // Check if a slot index is within the selected range
  const isInRange = (index) => {
    if (rangeStart === null || rangeEnd === null) return false;
    return index >= rangeStart && index <= rangeEnd;
  };

  // Get selected slots
  const selectedSlots = rangeStart !== null && rangeEnd !== null
    ? slotStatuses.slice(rangeStart, rangeEnd + 1)
    : [];

  const totalCost = selectedSlots.reduce((sum, s) => sum + s.cost, 0);

  // Navigation
  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + 1);
    setSelectedDate(next);
  };

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    prev.setHours(0, 0, 0, 0);
    if (prev > today) {
      prev.setDate(prev.getDate() - 1);
      setSelectedDate(prev);
    }
  };

  // Book
  const handleBook = async () => {
    if (selectedSlots.length === 0) {
      toast.error('Vui lòng chọn ít nhất một khung giờ');
      return;
    }
    try {
      const first = selectedSlots[0];
      const last = selectedSlots[selectedSlots.length - 1];
      const startDateTime = `${selectedDateStr}T${first.startTime}`;
      const endDateTime = `${selectedDateStr}T${last.endTime}`;

      await createBooking({
        courtId: selectedCourtId,
        startTime: startDateTime,
        endTime: endDateTime
      });

      toast.success('Đặt sân thành công!');
      onClose();
    } catch (err) {
      toast.error('Có lỗi xảy ra: ' + (err?.message || 'Unknown'));
    }
  };

  const selectedCourt = courts.find(c => c.courtId === selectedCourtId);

  // Calculate time display for selected range
  const rangeDisplay = selectedSlots.length > 0
    ? `${selectedSlots[0].startTime.substring(0, 5)} → ${selectedSlots[selectedSlots.length - 1].endTime.substring(0, 5)}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-card-dark rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-border-dark flex items-center justify-between sticky top-0 bg-white dark:bg-card-dark z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Xác nhận đặt sân
            </h2>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
              <span className="font-semibold text-emerald-600 dark:text-primary">
                {selectedCourt?.courtName || 'Đang chọn sân'}
              </span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{facility.name || facility.title}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* 1. Courts Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-primary text-xs">1</span>
              Chọn sân
            </h3>
            {loadingCourts ? (
              <div className="animate-pulse flex gap-3">
                <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {courts.map(court => (
                  <button
                    key={court.courtId}
                    onClick={() => setSelectedCourtId(court.courtId)}
                    className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 border ${
                      selectedCourtId === court.courtId
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-emerald-300 hover:text-emerald-600'
                    }`}
                  >
                    {court.courtName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Timetable */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-primary text-xs">2</span>
                Chọn khung giờ
              </h3>

              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700">
                <button
                  onClick={handlePrevDay}
                  className="p-1.5 text-gray-500 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-2 px-3">
                  <CalendarDays size={16} className="text-emerald-600" />
                  <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">
                    {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
                <button
                  onClick={handleNextDay}
                  className="p-1.5 text-gray-500 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 text-xs font-medium text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gray-100 border border-gray-200"></span> Trống
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-400"></span> Đã chọn
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-100 border border-rose-200"></span> Đã đặt
              </div>
            </div>

            {/* Timetable Grid */}
            {loadingCosts ? (
              <div className="space-y-2">
                {[1,2,3,4].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>)}
              </div>
            ) : sortedCosts.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Sân này chưa có bảng giá hoặc khung giờ hoạt động.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-12 bg-gray-50 dark:bg-gray-800/70 border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <div className="col-span-1 px-4 py-3 text-center">STT</div>
                  <div className="col-span-3 px-4 py-3">Khung giờ</div>
                  <div className="col-span-2 px-4 py-3 text-center">Thời lượng</div>
                  <div className="col-span-2 px-4 py-3 text-right">Giá</div>
                  <div className="col-span-2 px-4 py-3 text-center">Trạng thái</div>
                  <div className="col-span-2 px-4 py-3 text-center">Thanh giờ</div>
                </div>

                {/* Rows */}
                {slotStatuses.map((slot, idx) => {
                  const booked = slot.booked;
                  const inRange = isInRange(idx);
                  const isStart = idx === rangeStart;
                  const isEnd = idx === rangeEnd;

                  return (
                    <div
                      key={slot.courtCostId}
                      onClick={() => handleSlotClick(idx)}
                      className={`grid grid-cols-12 items-center border-b last:border-b-0 border-gray-100 dark:border-gray-800 transition-all duration-150 ${
                        booked
                          ? 'bg-rose-50/60 dark:bg-rose-900/10 cursor-not-allowed'
                          : inRange
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 cursor-pointer'
                            : 'bg-white dark:bg-card-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer'
                      }`}
                    >
                      {/* STT */}
                      <div className="col-span-1 px-4 py-3.5 text-center">
                        <span className={`text-xs font-bold ${inRange ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {idx + 1}
                        </span>
                      </div>

                      {/* Khung giờ */}
                      <div className="col-span-3 px-4 py-3.5">
                        <span className={`text-sm font-bold ${
                          booked ? 'text-gray-400 line-through' : inRange ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-800 dark:text-gray-100'
                        }`}>
                          {slot.startTime.substring(0, 5)} – {slot.endTime.substring(0, 5)}
                        </span>
                      </div>

                      {/* Thời lượng */}
                      <div className="col-span-2 px-4 py-3.5 text-center">
                        <span className={`text-xs font-semibold ${booked ? 'text-gray-400' : 'text-gray-500'}`}>
                          {slot.durationMinutes} phút
                        </span>
                      </div>

                      {/* Giá */}
                      <div className="col-span-2 px-4 py-3.5 text-right">
                        <span className={`text-sm font-bold ${
                          booked ? 'text-gray-400' : inRange ? 'text-emerald-600' : 'text-gray-700 dark:text-gray-200'
                        }`}>
                          {slot.cost.toLocaleString('vi-VN')}đ
                        </span>
                      </div>

                      {/* Trạng thái */}
                      <div className="col-span-2 px-4 py-3.5 text-center">
                        {booked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Đã đặt
                          </span>
                        ) : inRange ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Đã chọn
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            Trống
                          </span>
                        )}
                      </div>

                      {/* Thanh giờ (visual bar) */}
                      <div className="col-span-2 px-4 py-3.5">
                        <div className="w-full h-5 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                          <div
                            className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                              booked
                                ? 'bg-rose-200/70 dark:bg-rose-800/30'
                                : inRange
                                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 dark:from-emerald-500 dark:to-emerald-600'
                                  : 'bg-transparent'
                            }`}
                          ></div>
                          {/* Start / End markers */}
                          {isStart && !booked && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-700 rounded-l-lg"></div>
                          )}
                          {isEnd && !booked && (
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-700 rounded-r-lg"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Selection hint */}
            {rangeStart !== null && rangeEnd !== null && (
              <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
                <Clock size={16} className="text-emerald-600 shrink-0" />
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  <span className="font-bold">Đã chọn: </span>
                  <span className="font-semibold">{rangeDisplay}</span>
                  <span className="text-emerald-500 ml-2">({selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''})</span>
                </p>
                <button
                  onClick={() => { setRangeStart(null); setRangeEnd(null); }}
                  className="ml-auto text-xs font-bold text-emerald-600 hover:text-emerald-800 underline underline-offset-2"
                >
                  Xóa chọn
                </button>
              </div>
            )}

            {rangeStart === null && sortedCosts.length > 0 && (
              <p className="text-xs text-gray-400 italic">
                💡 Nhấn vào một khung giờ để chọn bắt đầu, sau đó nhấn khung giờ khác để chọn khoảng thời gian liên tục.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-border-dark bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Tổng tiền thanh toán</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-gray-900 dark:text-white">
                {totalCost.toLocaleString('vi-VN')}đ
              </span>
              {selectedSlots.length > 0 && (
                <span className="text-sm font-medium text-emerald-600 dark:text-primary">
                  ({selectedSlots.length} khung giờ)
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} className="px-6 rounded-xl">
              Hủy
            </Button>
            <Button
              onClick={handleBook}
              disabled={selectedSlots.length === 0 || bookingActionLoading}
              className="px-8 rounded-xl shadow-lg shadow-emerald-500/20"
            >
              {bookingActionLoading ? 'Đang xử lý...' : 'Xác nhận đặt sân'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
