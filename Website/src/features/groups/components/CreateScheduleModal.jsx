import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Users, Type, AlignLeft } from 'lucide-react';
import { useCreateSchedule } from '../hooks/useGroups';
import { useBookings } from '../../bookings/hooks/useBookings';
import { getBookingByIdAPI } from '../../bookings/api/bookings.api';
import Button from '../../../components/ui/Button';

export default function CreateScheduleModal({ isOpen, onClose, teamId, onSuccess }) {
  const { createSchedule, isLoading: isCreating } = useCreateSchedule();
  const { bookings, fetchBookings, loading: isBookingsLoading } = useBookings();
  const [formData, setFormData] = useState({
    bookingId: '',
    title: '',
    maxParticipants: 4,
    costPerPerson: '',
    costNote: ''
  });
  const [isCostDisabled, setIsCostDisabled] = useState(false);
  const [isLoadingCost, setIsLoadingCost] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchBookings();
      setFormData({
        bookingId: '',
        title: '',
        maxParticipants: 4,
        costPerPerson: '',
        costNote: ''
      });
      setIsCostDisabled(false);
      setIsLoadingCost(false);
      setError(null);
    }
  }, [isOpen, fetchBookings]);

  // Filter bookings to only show confirmed (statusId = 2) or future bookings
  const validBookings = bookings?.filter(b => b.statusId === 2 || b.statusId === 1) || [];

  const handleBookingChange = async (bookingId) => {
    setFormData(prev => ({ ...prev, bookingId, costPerPerson: '' }));
    setIsCostDisabled(false);
    setError(null);

    if (!bookingId) return;

    setIsLoadingCost(true);
    try {
      const res = await getBookingByIdAPI(bookingId);
      const bookingData = res?.data ?? res;
      if (bookingData && typeof bookingData.totalCost !== 'undefined' && bookingData.totalCost !== null) {
        setFormData(prev => ({
          ...prev,
          costPerPerson: bookingData.totalCost
        }));
        setIsCostDisabled(true);
      }
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError('Không thể tự động tải chi phí sân. Vui lòng thử chọn lại hoặc nhập thủ công.');
    } finally {
      setIsLoadingCost(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!formData.bookingId) {
      setError('Vui lòng chọn lịch đặt sân (Booking).');
      return;
    }
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề cho lịch trình.');
      return;
    }

    try {
      await createSchedule(teamId, {
        bookingId: formData.bookingId,
        title: formData.title,
        maxParticipants: parseInt(formData.maxParticipants, 10),
        costPerPerson: formData.costPerPerson ? parseFloat(formData.costPerPerson) : null,
        costNote: formData.costNote
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err);
    }
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-card-dark rounded-2xl shadow-xl overflow-hidden animate-scale-up border border-gray-200 dark:border-border-dark">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-border-dark/60 bg-gray-50/50 dark:bg-white/5">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">
              Tạo Lịch Chơi
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-label mt-1">
              Mở kèo để các thành viên trong nhóm đăng ký tham gia.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-xl font-label">
              {error}
            </div>
          )}

          {/* Booking Selection */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 font-label block">
              Chọn Lịch Đặt Sân <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                required
                value={formData.bookingId}
                onChange={(e) => handleBookingChange(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark/60 bg-white dark:bg-[#0c0f17] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:ring-primary/20 dark:focus:border-primary transition-all font-label appearance-none"
              >
                <option value="">-- Chọn sân đã đặt --</option>
                {validBookings.map((b) => (
                  <option key={b.bookingId} value={b.bookingId}>
                    {b.courtName || 'Sân không tên'} - {formatTime(b.startTime)} {formatDate(b.startTime)}
                  </option>
                ))}
              </select>
              {isBookingsLoading && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 font-label block">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                placeholder="Vd: Giao lưu đôi nam nữ tối T7"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark/60 bg-white dark:bg-[#0c0f17] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:ring-primary/20 dark:focus:border-primary transition-all font-label"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Max Participants */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 font-label block">
                Số người tối đa <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  min="2"
                  max="20"
                  required
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark/60 bg-white dark:bg-[#0c0f17] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-label"
                />
              </div>
            </div>

            {/* Cost Per Person */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 font-label block">
                Chi phí tiền sân (VNĐ)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  placeholder={isLoadingCost ? "Đang tải chi phí..." : "Vd: 50000"}
                  value={formData.costPerPerson}
                  onChange={(e) => setFormData({ ...formData, costPerPerson: e.target.value })}
                  disabled={isCostDisabled || isLoadingCost}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark/60 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-label ${isCostDisabled || isLoadingCost
                    ? 'bg-gray-100 dark:bg-white/5 cursor-not-allowed text-gray-500'
                    : 'bg-white dark:bg-[#0c0f17]'
                    }`}
                />
                {isLoadingCost && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cost Note */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 font-label block">
              Ghi chú chi phí
            </label>
            <div className="relative">
              <AlignLeft className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
              <textarea
                rows="2"
                placeholder="Vd: Tiền sân + nước chia đều"
                value={formData.costNote}
                onChange={(e) => setFormData({ ...formData, costNote: e.target.value })}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark/60 bg-white dark:bg-[#0c0f17] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-label resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isCreating}
              className="flex-1 py-2.5 text-sm"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              isLoading={isCreating}
              className="flex-1 py-2.5 text-sm"
            >
              Tạo Lịch Chơi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
