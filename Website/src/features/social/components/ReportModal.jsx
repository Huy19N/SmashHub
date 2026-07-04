import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getReportReasonsAPI, reportPostAPI, reportCommentAPI } from '../api/social.api';

const ReportModal = ({ isOpen, onClose, targetId, targetType }) => {
  const [reasons, setReasons] = useState([]);
  const [selectedReason, setSelectedReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchReasons();
      setSelectedReason('');
    }
  }, [isOpen]);

  const fetchReasons = async () => {
    setIsLoading(true);
    try {
      const response = await getReportReasonsAPI();
      if (response.success) {
        setReasons(response.data || []);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách lý do');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('Vui lòng chọn một lý do');
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      if (targetType === 'post') {
        response = await reportPostAPI(targetId, selectedReason);
      } else {
        response = await reportCommentAPI(targetId, selectedReason);
      }

      if (response.success) {
        toast.success('Đã gửi báo cáo vi phạm. Cảm ơn bạn!');
        onClose();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Lỗi khi gửi báo cáo');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#1a2332] w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-slideUp">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-gray-900 dark:text-white">Báo cáo vi phạm</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Vui lòng chọn lý do khiến bạn cho rằng {targetType === 'post' ? 'bài viết' : 'bình luận'} này vi phạm Tiêu chuẩn Cộng đồng của chúng tôi:
          </p>

          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {reasons.map((reason, index) => (
                <label key={index} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mt-1 w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{reason}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-white/5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedReason}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Gửi báo cáo'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
