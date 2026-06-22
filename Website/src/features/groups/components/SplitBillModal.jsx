import { useState } from 'react';
import { X, DollarSign, Calculator } from 'lucide-react';
import Button from '../../../components/ui/Button';
import toast from 'react-hot-toast';
import { calculateSplitBillAPI } from '../api/groups.api';

export default function SplitBillModal({ isOpen, onClose, scheduleId, onSuccess, isDarkMode = false }) {
  const [extraFee, setExtraFee] = useState('');
  const [extraFeeNote, setExtraFeeNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const fee = extraFee ? parseInt(extraFee, 10) : 0;
      await calculateSplitBillAPI(scheduleId, {
        extraFee: fee,
        extraFeeNote: extraFeeNote.trim() || null
      });
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
      <div className="relative w-full max-w-md animate-fade-in bg-white dark:bg-[#0d1117] rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-border-dark flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-border-dark">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300 font-label">
            Hệ thống sẽ tự động tính phí sân (hoặc phí được chia sẻ từ kèo ghép). Bạn có thể nhập thêm các khoản phụ phí (VD: nước nôi, cầu lưới...) để chia đều cho những người đã tham gia. Những người "No-show" (đăng ký nhưng không tham gia) sẽ chỉ phải trả tiền sân, không chịu phụ phí.
          </div>

          {/* Extra Fee */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 font-label flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
              Tổng phụ phí phát sinh (VNĐ)
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

          {/* Extra Fee Note */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 font-label">
              Ghi chú phụ phí
            </label>
            <input
              type="text"
              value={extraFeeNote}
              onChange={(e) => setExtraFeeNote(e.target.value)}
              placeholder="VD: Tiền nước 2 thùng, 1 ống cầu"
              className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-label"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-border-dark">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 py-2.5">
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1 py-2.5">
              Tính tiền ngay
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
