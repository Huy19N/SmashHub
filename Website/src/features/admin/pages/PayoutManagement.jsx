import { useState, useEffect } from 'react';
import {
  Search,
  Wallet,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  Calendar,
  Banknote,
  Send,
  X
} from 'lucide-react';
import { useAdminPayouts } from '../hooks/useAdmin';
import toast from 'react-hot-toast';

export default function PayoutManagement() {
  const { requests, isLoading, isSubmitting, fetchPayoutRequests, approvePayout, rejectPayout } = useAdminPayouts();
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [activeRequest, setActiveRequest] = useState(null);
  const [modalType, setModalType] = useState(null); // 'approve' or 'reject'
  const [transactionRef, setTransactionRef] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchPayoutRequests();
  }, [fetchPayoutRequests]);

  const openModal = (request, type) => {
    setActiveRequest(request);
    setModalType(type);
    setTransactionRef('');
    setNote(type === 'approve' ? 'Yêu cầu rút tiền được phê duyệt và hoàn tất chuyển khoản.' : 'Yêu cầu bị từ chối do số dư ví không khớp hoặc thông tin ngân hàng sai.');
  };

  const closeModal = () => {
    setActiveRequest(null);
    setModalType(null);
  };

  // Handle Approve Payout
  const handleApprove = async () => {
    if (modalType === 'approve' && !transactionRef.trim()) {
      toast.error('Vui lòng nhập Mã giao dịch ngân hàng.');
      return;
    }

    const payload = { transactionRef, note };
    const success = await approvePayout(activeRequest.payoutId, payload);
    if (success) {
      closeModal();
    }
  };

  // Handle Reject Payout
  const handleReject = async () => {
    const payload = { note };
    const success = await rejectPayout(activeRequest.payoutId, payload);
    if (success) {
      closeModal();
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(r => {
    const query = searchQuery.toLowerCase();
    return (r.facilityName || '').toLowerCase().includes(query) ||
           (r.ownerName || '').toLowerCase().includes(query) ||
           (r.ownerEmail || '').toLowerCase().includes(query) ||
           (r.bankName || '').toLowerCase().includes(query) ||
           (r.accountNumber || '').includes(query);
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="space-y-6 animate-fadeIn relative">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold font-display leading-tight dark:text-white">Quản Lý Yêu Cầu Rút Tiền</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Xem và phê duyệt các yêu cầu rút tiền từ ví doanh thu của chủ sân.</p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md bg-white dark:bg-[#0b0f19]/60 p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm theo tên sân, chủ sân, ngân hàng..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-primary transition-colors dark:text-white"
        />
      </div>

      {/* Payout requests table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0b0f19]/60 border border-gray-100 dark:border-white/5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <AlertCircle className="w-12 h-12 mb-3 text-emerald-500" />
            <p>Không có yêu cầu rút tiền nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-3 text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider font-label">
                  <th className="py-3 px-4 whitespace-nowrap">Cơ sở / Chủ sân</th>
                  <th className="py-3 px-4 whitespace-nowrap">Số tiền rút</th>
                  <th className="py-3 px-4 whitespace-nowrap">Tài khoản thụ hưởng</th>
                  <th className="py-3 px-4 whitespace-nowrap">Ngày yêu cầu</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Trạng thái</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
                {filteredRequests.map((r) => (
                  <tr key={r.payoutId} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-600 dark:text-primary shrink-0" />
                        <p className="font-semibold text-gray-800 dark:text-white">{r.facilityName}</p>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">Chủ: {r.ownerName} ({r.ownerEmail})</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-primary whitespace-nowrap">
                      {formatCurrency(r.amount)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-semibold text-gray-800 dark:text-white uppercase">{r.bankName}</p>
                      <p className="text-xs text-gray-500 font-label">{r.accountNumber}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{r.accountHolder}</p>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                      <p className="text-xs">{new Date(r.requestedAt).toLocaleDateString('vi-VN')}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(r.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-label uppercase ${
                        r.statusId === 1
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          : r.statusId === 2
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-600 border border-red-500/20'
                      }`}>
                        {r.statusName === 'Pending' ? 'Chờ duyệt' : r.statusName === 'Completed' ? 'Đã chuyển' : 'Bị từ chối'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {r.statusId === 1 ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openModal(r, 'approve')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold font-label bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95 transition-all shadow-sm"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Duyệt
                          </button>
                          <button
                            onClick={() => openModal(r, 'reject')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold font-label bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20 cursor-pointer active:scale-95 transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <div className="text-left max-w-[180px] mx-auto text-[11px] text-gray-400">
                          {r.statusId === 2 ? (
                            <>
                              <p className="font-bold text-gray-500 dark:text-gray-400">Ref: {r.transactionRef}</p>
                              {r.note && <p className="truncate italic mt-0.5">"{r.note}"</p>}
                            </>
                          ) : (
                            <p className="italic text-red-400">"{r.note || 'Không có lý do'}"</p>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modals */}
      {activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#0b0f19] border border-gray-100 dark:border-white/5 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
            {/* Close */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${
                modalType === 'approve'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-primary border-emerald-500/20'
                  : 'bg-red-500/10 text-red-600 border-red-500/20'
              }`}>
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base leading-tight font-display dark:text-white">
                  {modalType === 'approve' ? 'Phê Duyệt Rút Tiền' : 'Từ Chối Yêu Cầu'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{activeRequest.facilityName}</p>
              </div>
            </div>

            {/* Request Summary Info */}
            <div className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-150/50 dark:border-white/5 rounded-xl space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-semibold font-label">Thụ hưởng:</span>
                <span className="font-bold text-gray-900 dark:text-white">{activeRequest.accountHolder}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-semibold font-label">Ngân hàng:</span>
                <span className="font-bold text-gray-900 dark:text-white">{activeRequest.bankName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-semibold font-label">Số tài khoản:</span>
                <span className="font-bold text-gray-900 dark:text-white font-label">{activeRequest.accountNumber}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-white/10">
                <span className="text-gray-500 font-bold font-label">Số tiền yêu cầu:</span>
                <span className="font-extrabold text-emerald-600 dark:text-primary">{formatCurrency(activeRequest.amount)}</span>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              {modalType === 'approve' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-label">Mã giao dịch ngân hàng (Transaction Ref) *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: FT2614234567..."
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-primary transition-colors dark:text-white"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-label">Ghi chú (Note)</label>
                <textarea
                  placeholder="Nhập ghi chú cho chủ sân..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows="3"
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-primary transition-colors dark:text-white resize-none"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 dark:border-white/10 transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
              >
                Hủy
              </button>
              {modalType === 'approve' ? (
                <button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95 transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Đang duyệt...' : 'Xác nhận duyệt'}
                </button>
              ) : (
                <button
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white cursor-pointer active:scale-95 transition-all shadow-md shadow-red-500/10 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  {isSubmitting ? 'Đang từ chối...' : 'Từ chối rút'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
