import { useState } from 'react';
import { X, Flame, Shield, CheckCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';

export default function CreateChallengeModal({ isOpen, onClose, scheduleId, sportId, hostTeamId, onSubmit, isLoading, isDarkMode = false }) {
  const [level, setLevel] = useState('Trung bình');
  const [message, setMessage] = useState('Giao lưu vui vẻ, phí sân chia đôi.');
  const [isCostSplit, setIsCostSplit] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!level.trim()) {
      alert("Vui lòng nhập trình độ yêu cầu.");
      return;
    }
    onSubmit({
      scheduleId,
      hostTeamId,
      sportId: sportId || 1,
      isCostSplit,
      message: message.trim()
    });
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDarkMode ? 'dark' : ''}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md animate-fade-in bg-white dark:bg-[#0d1117] rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-border-dark flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-border-dark">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
            <Flame className="h-5 w-5" />
            <h2 className="text-lg font-bold font-display text-gray-900 dark:text-white">Bắt Kèo Ghép Đấu</h2>
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
          {/* Level */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 font-label flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
              Trình độ yêu cầu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="VD: Trung bình, Khá, Giỏi..."
              className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-label"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 font-label">
              Lời nhắn
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ghi chú thêm cho đối thủ..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-label resize-none"
            />
          </div>

          {/* Cost Split Checkbox */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 cursor-pointer" onClick={() => setIsCostSplit(!isCostSplit)}>
            <div className={`flex items-center justify-center h-5 w-5 rounded border ${isCostSplit ? 'bg-emerald-500 border-emerald-500' : 'bg-white dark:bg-transparent border-gray-300 dark:border-gray-600'}`}>
              {isCostSplit && <CheckCircle className="h-3.5 w-3.5 text-white" />}
            </div>
            <div className="flex flex-col select-none">
              <span className="text-sm font-bold text-gray-900 dark:text-white font-label">Chia đôi phí sân (Cost Split)</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-label">Đội khách sẽ chia sẻ 50% chi phí sân.</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-border-dark">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 py-2.5">
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1 py-2.5">
              Đăng kèo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
