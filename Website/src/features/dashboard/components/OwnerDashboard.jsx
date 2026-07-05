import { useEffect, useState } from 'react';
import { getRevenueData, getUtilizationData, getRetentionData } from '../api/mockOwnerStats';
import { RevenueChart } from './charts/RevenueChart';
import { UtilizationHeatmap } from './charts/UtilizationHeatmap';
import { CustomerRetentionChart } from './charts/CustomerRetentionChart';
import { Loader2, DollarSign, Clock, Users, Calendar as CalendarIcon, Activity } from 'lucide-react';

export default function OwnerDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ revenue: [], utilization: [], retention: [] });
  const [dateRange, setDateRange] = useState('6months');

  useEffect(() => {
    setLoading(true);
    // In real app, we would pass dateRange to API calls
    Promise.all([
      getRevenueData(),
      getUtilizationData(),
      getRetentionData()
    ]).then(([revenue, utilization, retention]) => {
      setData({ revenue, utilization, retention });
      setLoading(false);
    });
  }, [dateRange]);

  return (
    <div className="space-y-6 mt-8 border-t border-gray-150 dark:border-border-dark/40 pt-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white font-display flex items-center gap-2">
            <span className="w-1.5 h-5 bg-amber-500 rounded-full inline-block"></span>
            Phân tích kinh doanh
          </h3>
          <p className="text-xs text-gray-400 font-label mt-1">Biểu đồ chuyên sâu dành cho Chủ sân</p>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex items-center gap-2 bg-white dark:bg-card-dark px-3 py-1.5 rounded-xl border border-gray-200 dark:border-border-dark/60 shadow-sm shrink-0">
          <CalendarIcon className="w-4 h-4 text-gray-400" />
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-transparent text-sm font-label text-gray-700 dark:text-gray-300 focus:outline-none pr-2 border-none cursor-pointer"
          >
            <option value="30days">30 ngày qua</option>
            <option value="3months">3 tháng qua</option>
            <option value="6months">6 tháng qua</option>
            <option value="year">Năm nay</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] w-full bg-gray-50 dark:bg-white/5 rounded-3xl animate-pulse flex flex-col items-center justify-center border border-gray-100 dark:border-border-dark/40">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
          <p className="text-sm text-gray-400 font-label">Đang tải phân tích...</p>
        </div>
      ) : data.revenue.length === 0 ? (
        <div className="bg-white dark:bg-card-dark border border-gray-200/80 dark:border-border-dark/60 rounded-3xl p-12 shadow-sm text-center">
          <Activity className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display">Chưa có dữ liệu thống kê</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-label">
            Hệ thống cần thêm dữ liệu để hiển thị các biểu đồ kinh doanh.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-card-dark border border-gray-200/80 dark:border-border-dark/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display tracking-tight">
                Doanh thu và Dự báo
              </h3>
            </div>
            <RevenueChart data={data.revenue} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-card-dark border border-gray-200/80 dark:border-border-dark/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display tracking-tight">
                  Mật độ khung giờ
                </h3>
              </div>
              <UtilizationHeatmap data={data.utilization} />
            </div>

            <div className="bg-white dark:bg-card-dark border border-gray-200/80 dark:border-border-dark/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display tracking-tight">
                  Độ giữ chân khách hàng
                </h3>
              </div>
              <CustomerRetentionChart data={data.retention} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
