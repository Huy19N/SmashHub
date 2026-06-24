import { useState } from 'react';
import { X, DollarSign, Calculator } from 'lucide-react';
import Button from '../../../components/ui/Button';
import toast from 'react-hot-toast';
import { calculateSplitBillAPI } from '../api/groups.api';

export default function SplitBillModal({ isOpen, onClose, scheduleId, participants = [], baseCourtCost = 0, onSuccess, isDarkMode = false }) {
  const [extraFee, setExtraFee] = useState('');
  const [extraFeeNote, setExtraFeeNote] = useState('');
  const [splitMode, setSplitMode] = useState('auto'); // auto, fixed, custom
  const [fixedAmount, setFixedAmount] = useState('');
  const [customAmounts, setCustomAmounts] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // --- Calculation for Warning ---
  const fee = extraFee ? parseInt(extraFee, 10) : 0;
  const attendedCount = participants.filter(p => p.isAttended).length;
  const totalParticipants = participants.length;
  const extraFeePerPerson = attendedCount > 0 ? fee / attendedCount : 0;
  
  let totalCollected = 0;
  if (splitMode === 'fixed') {
    const fixed = fixedAmount ? parseInt(fixedAmount, 10) : 0;
    totalCollected = (fixed * totalParticipants) + (extraFeePerPerson * attendedCount); 
  } else if (splitMode === 'custom') {
    let customTotal = 0;
    participants.forEach(p => {
       const amount = customAmounts[p.userId] ? parseInt(customAmounts[p.userId], 10) : 0;
       customTotal += amount;
       if (p.isAttended) customTotal += extraFeePerPerson;
    });
    totalCollected = customTotal;
  }
  
  const totalCost = baseCourtCost + fee;
  const difference = totalCollected - totalCost;
  const isWarningVisible = splitMode !== 'auto';
  // -------------------------------

  if (!isOpen) return null;

  const handleCustomAmountChange = (userId, value) => {
    setCustomAmounts(prev => ({
      ...prev,
      [userId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const fee = extraFee ? parseInt(extraFee, 10) : 0;
      
      let payload = {
        extraFee: fee,
        extraFeeNote: extraFeeNote.trim() || null
      };

      if (splitMode === 'fixed') {
        payload.fixedAmountPerPerson = fixedAmount ? parseInt(fixedAmount, 10) : 0;
      } else if (splitMode === 'custom') {
        const amounts = {};
        Object.keys(customAmounts).forEach(userId => {
           amounts[userId] = customAmounts[userId] ? parseInt(customAmounts[userId], 10) : 0;
        });
        payload.customAmounts = amounts;
      }

      await calculateSplitBillAPI(scheduleId, payload);
      toast.success('Đã tính tiền chia phí thành công!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error('Lỗi tính tiền: ' + (err.response?.data?.message || err.message || 'Unknown'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDarkMode ? 'dark' : ''}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md animate-fade-in bg-white dark:bg-[#0d1117] rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-border-dark flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-border-dark shrink-0">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
            <Calculator className="h-5 w-5" />
            <h2 className="text-lg font-bold font-display text-gray-900 dark:text-white">Tính Tiền Chia Phí</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto custom-scrollbar flex-1">
          <form id="split-bill-form" onSubmit={handleSubmit} className="p-6 space-y-5">
            
            <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
              <button type="button" onClick={() => setSplitMode('auto')} className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${splitMode === 'auto' ? 'bg-white dark:bg-card-dark text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Tự động</button>
              <button type="button" onClick={() => setSplitMode('fixed')} className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${splitMode === 'fixed' ? 'bg-white dark:bg-card-dark text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Mức chung</button>
              <button type="button" onClick={() => setSplitMode('custom')} className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${splitMode === 'custom' ? 'bg-white dark:bg-card-dark text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Tùy chỉnh</button>
            </div>

            {splitMode === 'auto' && (
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300 font-label">
                Hệ thống tự động tính phí sân. Bạn nhập phụ phí bên dưới để chia đều cho người đã điểm danh (No-show chỉ trả tiền sân).
              </div>
            )}
            {splitMode === 'fixed' && (
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300 font-label">
                Mọi người đều phải đóng cùng một số tiền cố định do bạn chỉ định.
              </div>
            )}

            {/* Extra Fee */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 font-label flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                Tổng phụ phí phát sinh (nếu có)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={extraFee}
                onChange={(e) => setExtraFee(e.target.value)}
                placeholder="VD: 50000"
                className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-label"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 font-label">
                Ghi chú phụ phí
              </label>
              <input
                type="text"
                value={extraFeeNote}
                onChange={(e) => setExtraFeeNote(e.target.value)}
                placeholder="VD: Tiền nước 2 thùng"
                className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-label"
              />
            </div>

            {splitMode === 'fixed' && (
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-border-dark">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 font-label text-emerald-600">
                  Số tiền cố định mỗi người phải đóng (VNĐ)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={fixedAmount}
                  onChange={(e) => setFixedAmount(e.target.value)}
                  placeholder="VD: 60000"
                  className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-white/5 border-emerald-200 dark:border-emerald-500/30 text-gray-900 dark:text-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-label"
                />
              </div>
            )}

            {splitMode === 'custom' && (
              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-border-dark">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 font-label text-emerald-600">
                  Tùy chỉnh số tiền cho từng thành viên
                </label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                  {participants.map(p => (
                    <div key={p.userId} className="flex items-center justify-between gap-3 bg-gray-50 dark:bg-white/5 p-2 px-3 rounded-lg border border-gray-100 dark:border-white/10">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate flex-1">{p.fullName || 'Thành viên'}</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="VD: 50000"
                        value={customAmounts[p.userId] || ''}
                        onChange={(e) => handleCustomAmountChange(p.userId, e.target.value)}
                        className="w-28 px-3 py-1.5 rounded-lg border bg-white dark:bg-card-dark border-gray-200 dark:border-border-dark text-gray-900 dark:text-white text-sm focus:border-emerald-500 outline-none"
                      />
                    </div>
                  ))}
                  {participants.length === 0 && (
                    <div className="text-sm text-gray-500 italic">Không có thành viên nào.</div>
                  )}
                </div>
              </div>
            )}

            {/* Warning block */}
            {isWarningVisible && (
              <div className={`p-4 rounded-xl border ${difference === 0 ? 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-white/5 dark:border-white/10 dark:text-gray-400' : difference > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'} font-label text-sm flex flex-col gap-1`}>
                <div className="flex justify-between font-bold">
                  <span>Tổng thu dự kiến:</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalCollected)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Tổng chi (Tiền sân + Phụ phí):</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalCost)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-current/20 pt-1 mt-1">
                  <span>Trạng thái:</span>
                  <span>
                    {difference === 0 ? 'Đủ tiền' : difference > 0 ? `Dư ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(difference)}` : `Thiếu ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.abs(difference))}`}
                  </span>
                </div>
              </div>
            )}

          </form>
        </div>

        {/* Actions */}
        <div className="shrink-0 flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-border-dark bg-gray-50 dark:bg-[#0c0f17]">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1 py-2.5">
            Hủy
          </Button>
          <Button type="submit" form="split-bill-form" variant="primary" isLoading={isLoading} className="flex-1 py-2.5">
            Tính tiền ngay
          </Button>
        </div>
      </div>
    </div>
  );
}
