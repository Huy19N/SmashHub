import React, { useEffect } from 'react';
import { X, Check, XCircle, Users } from 'lucide-react';
import { useMatchmaking } from '../hooks/useMatchmaking';
import toast from 'react-hot-toast';

export default function MatchRequestsModal({ isOpen, onClose, challengeId }) {
  const { acceptances, fetchAcceptances, respondToAcceptance, loading } = useMatchmaking();

  useEffect(() => {
    if (isOpen && challengeId) {
      fetchAcceptances(challengeId);
    }
  }, [isOpen, challengeId, fetchAcceptances]);

  const handleRespond = async (acceptanceId, accept) => {
    try {
      await respondToAcceptance(acceptanceId, accept);
      toast.success(accept ? 'Đã chấp nhận ghép đấu!' : 'Đã từ chối yêu cầu.');
      if (accept) {
        onClose(); // Close modal on accept because challenge is now matched
      } else {
        fetchAcceptances(challengeId); // Refresh list
      }
    } catch (err) {
      toast.error('Lỗi xử lý yêu cầu: ' + (err.message || 'Unknown'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-card-dark rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-border-dark flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-border-dark flex items-center justify-between bg-gray-50 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600 dark:text-primary" />
            <h3 className="font-bold text-lg text-gray-900 dark:text-white font-display">Yêu cầu ghép đấu</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-b-2 border-emerald-500 rounded-full" />
            </div>
          ) : acceptances?.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 font-label">
              Chưa có đội nào xin ghép đấu.
            </div>
          ) : (
            acceptances.map((req) => (
              <div key={req.acceptanceId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 dark:border-border-dark rounded-xl bg-gray-50/50 dark:bg-white/5 gap-4">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{req.challengerTeamName}</h4>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Gửi lúc: {new Date(req.createdAt).toLocaleString('vi-VN')}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Trạng thái: <span className="font-semibold text-emerald-600">{req.statusName}</span>
                  </div>
                </div>
                {req.statusId === 1 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespond(req.acceptanceId, false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 flex items-center gap-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Từ chối
                    </button>
                    <button
                      onClick={() => handleRespond(req.acceptanceId, true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Chấp nhận
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
