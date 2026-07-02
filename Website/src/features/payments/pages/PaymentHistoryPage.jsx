import React, { useEffect, useState } from 'react';
import { getMyPaymentsAPI } from '../api/payments.api';
import { useTheme } from '../../../contexts/ThemeContext';
import Sidebar from '../../../components/layout/Sidebar';
import SportyWatermarks from '../../../components/ui/SportyWatermarks';
import { Loader2, Search, Calendar, CreditCard, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentHistoryPage() {
  const { theme } = useTheme();
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const response = await getMyPaymentsAPI({ pageIndex, pageSize: 10 });
      setPayments(response.data?.items || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      toast.error('Lỗi khi tải lịch sử giao dịch.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPayments();
  }, [pageIndex]);
  
  const getStatusBadge = (statusName) => {
    if (!statusName) return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-lg text-xs font-semibold">Unknown</span>;
    const lower = statusName.toLowerCase();
    if (lower.includes('thành công') || lower.includes('paid')) {
      return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full text-xs font-bold font-label">Thành công</span>;
    }
    if (lower.includes('hủy') || lower.includes('cancel')) {
      return <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full text-xs font-bold font-label">Đã hủy</span>;
    }
    return <span className="px-3 py-1 bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 rounded-full text-xs font-bold font-label">{statusName}</span>;
  };
  
  return (
    <div className={`flex min-h-screen ${theme === 'dark' ? 'bg-[#0c0f17]' : 'bg-gray-50'} text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans relative overflow-hidden`}>
      <SportyWatermarks />
      <Sidebar activeMenu="payment-history" />
      
      <main className="flex-1 overflow-y-auto h-screen p-6 lg:p-10 flex flex-col animate-page">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display">Lịch sử giao dịch</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-label">Xem lại các khoản thanh toán đặt sân và mua gói</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Tìm mã đơn hàng..." 
                    className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-transparent focus:bg-white focus:border-emerald-500 rounded-xl text-sm transition-colors outline-none w-64 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                  />
                </div>
                <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400 flex flex-col items-center">
                  <CreditCard className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-700" />
                  <p className="text-lg font-semibold font-display">Chưa có giao dịch nào</p>
                  <p className="text-sm font-label mt-1">Lịch sử thanh toán của bạn sẽ hiển thị tại đây.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                      <th className="px-6 py-4 font-label">Mã đơn hàng</th>
                      <th className="px-6 py-4 font-label">Loại giao dịch</th>
                      <th className="px-6 py-4 font-label">Ngày tạo</th>
                      <th className="px-6 py-4 font-label">Số tiền</th>
                      <th className="px-6 py-4 font-label">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {payments.map(payment => (
                      <tr key={payment.paymentId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                          #{payment.orderCode}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                          {payment.paymentType === 'Booking' ? 'Đặt sân' : payment.paymentType === 'Subscription' ? 'Mua gói' : payment.paymentType}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(payment.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-gray-900 dark:text-white font-display">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payment.amount)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(payment.statusName)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            {/* Pagination Placeholder */}
            {!isLoading && totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-2">
                <button 
                  disabled={pageIndex === 1}
                  onClick={() => setPageIndex(p => p - 1)}
                  className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm disabled:opacity-50"
                >
                  Trước
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {pageIndex} / {totalPages}
                </span>
                <button 
                  disabled={pageIndex === totalPages}
                  onClick={() => setPageIndex(p => p + 1)}
                  className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
