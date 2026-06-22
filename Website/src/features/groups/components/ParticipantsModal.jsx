import { useState, useEffect } from 'react';
import { X, UserCheck, UserX, Users, Loader2, Save, AlignLeft, Users as UsersIcon, DollarSign } from 'lucide-react';
import { useScheduleParticipants, useUpdateSchedule, useUpdateAttendance, useUpdateSplitBill } from '../hooks/useGroups';
import toast from 'react-hot-toast';
import Button from '../../../components/ui/Button';
import SplitBillModal from './SplitBillModal';

/**
 * ParticipantsModal — shows who has voted/joined a schedule, AND allows leader to edit schedule details.
 * Visible when leader clicks "Manage" on a SessionCard.
 */
export default function ParticipantsModal({ isOpen, onClose, schedule, onSuccess }) {
  const scheduleId = schedule?.scheduleId;
  const { participants, isLoading: participantsLoading, refetch: refetchParticipants } = useScheduleParticipants(isOpen ? scheduleId : null);
  const { updateSchedule, isLoading: isUpdating } = useUpdateSchedule();
  const { updateAttendance } = useUpdateAttendance();
  const { updateSplitBill } = useUpdateSplitBill();

  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'edit'
  const [showSplitBill, setShowSplitBill] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    title: '',
    maxParticipants: '',
    costPerPerson: '',
    costNote: ''
  });

  // Sync form data when schedule prop changes
  useEffect(() => {
    if (schedule) {
      setFormData({
        title: schedule.title || '',
        maxParticipants: schedule.maxParticipants || '',
        costPerPerson: schedule.costPerPerson || '',
        costNote: schedule.costNote || ''
      });
      setActiveTab('list'); // reset tab on open
    }
  }, [schedule]);

  if (!isOpen || !schedule) return null;

  const attended = participants.filter(p => p.isAttended);
  const notAttended = participants.filter(p => !p.isAttended);

  const handleToggleAttendance = async (userId, currentStatus) => {
    try {
      await updateAttendance(scheduleId, userId, !currentStatus);
      if (refetchParticipants) refetchParticipants();
    } catch (err) {
      toast.error("Không thể điểm danh: " + err);
    }
  };

  const handleTogglePaid = async (userId, currentPaidStatus, costToPay) => {
    try {
      await updateSplitBill(scheduleId, userId, { costToPay, isPaid: !currentPaidStatus });
      toast.success("Cập nhật trạng thái đóng tiền thành công.");
      if (refetchParticipants) refetchParticipants();
    } catch (err) {
      toast.error("Không thể cập nhật đóng tiền: " + err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (isTimeLocked) {
      toast.error("Không thể chỉnh sửa thông tin khi đã tới giờ chơi.");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề.");
      return;
    }
    if (!formData.maxParticipants || isNaN(formData.maxParticipants)) {
      toast.error("Vui lòng nhập số người tối đa hợp lệ.");
      return;
    }

    try {
      await updateSchedule(scheduleId, {
        title: formData.title,
        maxParticipants: parseInt(formData.maxParticipants, 10),
        costPerPerson: formData.costPerPerson ? parseFloat(formData.costPerPerson) : null,
        costNote: formData.costNote || ""
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      // Error handled by hook
    }
  };

  const isTimeLocked = schedule?.startTime && new Date() >= new Date(schedule.startTime);
  const isCostLocked = !!schedule?.bookingId && schedule?.bookingId !== '00000000-0000-0000-0000-000000000000';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-card-dark rounded-2xl shadow-xl overflow-hidden animate-scale-up border border-gray-200 dark:border-border-dark flex flex-col max-h-[85vh]">

        {/* Header & Tabs */}
        <div className="shrink-0 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-border-dark/60">
          <div className="flex items-center justify-between p-5 pb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white font-display">
                Quản lý lịch Chơi
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-label mt-0.5 truncate max-w-[250px]">
                {schedule.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex px-5 gap-4">
            <button
              onClick={() => setActiveTab('list')}
              className={`pb-2 text-sm font-bold transition-all duration-200 border-b-2 font-label cursor-pointer active:scale-95 hover:scale-[1.02] ${activeTab === 'list'
                ? 'border-emerald-500 text-emerald-600 dark:text-primary dark:border-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              Người tham gia
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`pb-2 text-sm font-bold transition-all duration-200 border-b-2 font-label cursor-pointer active:scale-95 hover:scale-[1.02] ${activeTab === 'edit'
                ? 'border-emerald-500 text-emerald-600 dark:text-primary dark:border-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              Chỉnh sửa thông tin
            </button>
          </div>
        </div>

        {/* Body */}
        <div key={activeTab} className="p-5 overflow-y-auto flex-1 custom-scrollbar animate-tab-panel">
          {activeTab === 'list' ? (
            // LIST TAB
            participantsLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-3" />
                <p className="text-sm text-gray-500 font-label">Đang tải...</p>
              </div>
            ) : participants.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400 font-label">
                  Chưa có ai đăng ký tham gia.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary */}
                <div className="flex items-center gap-3 text-sm font-label">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                    <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{attended.length}</span>
                    <span className="text-emerald-600/70 dark:text-emerald-400/70">đã điểm danh</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                    <UserX className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="font-bold text-amber-700 dark:text-amber-400">{notAttended.length}</span>
                    <span className="text-amber-600/70 dark:text-amber-400/70">chưa điểm danh</span>
                  </div>
                </div>

                {/* Participant List */}
                <div className="space-y-2">
                  {participants.map((p, index) => (
                    <div
                      key={p.userId}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-border-dark/40 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                          {(p.fullName || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white font-label">
                            {p.fullName || 'Thành viên'}
                          </p>
                          {p.costToPay > 0 && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold font-label">
                              Phải đóng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.costToPay)}
                            </p>
                          )}
                          {p.joinedAt && (
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-label">
                              Đăng ký: {new Date(p.joinedAt).toLocaleString('vi-VN', {
                                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {p.costToPay > 0 && (
                          <button
                            onClick={() => handleTogglePaid(p.userId, p.isPaid, p.costToPay)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold font-label transition-colors cursor-pointer active:scale-95 ${p.isPaid
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/25'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-500/25'
                              }`}
                          >
                            {p.isPaid ? 'Đã đóng' : 'Chưa đóng'}
                          </button>
                        )}

                        {/* Attendance badge/button */}
                        <button
                          onClick={() => handleToggleAttendance(p.userId, p.isAttended)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold font-label transition-colors cursor-pointer active:scale-95 ${p.isAttended
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/25'
                            : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                            }`}>
                          {p.isAttended ? 'Đã điểm danh' : 'Chưa điểm danh'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            // EDIT TAB
            <form id="edit-schedule-form" onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 font-label">Tiêu đề <span className="text-red-500">*</span></label>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    disabled={isTimeLocked}
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-xl text-sm font-label focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-900 dark:text-white disabled:opacity-60 disabled:bg-gray-100 dark:disabled:bg-white/5"
                    placeholder="Vd: Giao lưu đôi nam nữ tối T7"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 font-label">Số người tối đa <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <UsersIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      required
                      min="1"
                      disabled={isTimeLocked}
                      value={formData.maxParticipants}
                      onChange={e => setFormData({ ...formData, maxParticipants: e.target.value })}
                      className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-xl text-sm font-label focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-900 dark:text-white disabled:opacity-60 disabled:bg-gray-100 dark:disabled:bg-white/5"
                      placeholder="Vd: 10"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 font-label">Chi phí tiền sân (VNĐ)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      disabled={isTimeLocked || isCostLocked}
                      value={formData.costPerPerson}
                      onChange={e => setFormData({ ...formData, costPerPerson: e.target.value })}
                      className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm font-label focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-900 dark:text-white ${isTimeLocked || isCostLocked
                        ? 'bg-gray-100 dark:bg-white/5 cursor-not-allowed text-gray-500 border-gray-200 dark:border-border-dark/60'
                        : 'bg-white dark:bg-card-dark border-gray-200 dark:border-border-dark'
                        }`}
                      placeholder="Vd: 50000"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 font-label">Ghi chú chi phí</label>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    disabled={isTimeLocked}
                    value={formData.costNote}
                    onChange={e => setFormData({ ...formData, costNote: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-xl text-sm font-label focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[80px] resize-none text-gray-900 dark:text-white disabled:opacity-60 disabled:bg-gray-100 dark:disabled:bg-white/5"
                    placeholder="Vd: Tiền sân + nước chia đều"
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3 bg-gray-50 dark:bg-[#0c0f17] border-t border-gray-100 dark:border-border-dark/60 flex justify-between items-center">
          <span className="text-[10px] text-gray-400 font-label">
            {activeTab === 'list' ? `Tổng: ${participants.length} người đăng ký` : 'Cập nhật lại thông tin buổi giao lưu'}
          </span>
          {activeTab === 'edit' ? (
            <Button
              type="submit"
              form="edit-schedule-form"
              isLoading={isUpdating}
              disabled={isTimeLocked}
              className="px-4 py-2.5 text-xs"
            >
              <Save className="h-3.5 w-3.5" />
              Lưu thay đổi
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowSplitBill(true)}
                className="px-4 py-2.5 text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 border-none dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
              >
                <DollarSign className="h-3.5 w-3.5" />
                Tính tiền
              </Button>
              <Button
                variant="primary"
                onClick={onClose}
                className="px-4 py-2.5 text-xs"
              >
                Đóng
              </Button>
            </div>
          )}
        </div>
      </div>

      <SplitBillModal
        isOpen={showSplitBill}
        onClose={() => setShowSplitBill(false)}
        scheduleId={scheduleId}
        onSuccess={() => {
          if (refetchParticipants) refetchParticipants();
        }}
      />
    </div>
  );
}
