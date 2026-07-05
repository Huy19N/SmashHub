import { useEffect, useState } from 'react';
import { getPlatformRevenueData, getUserGrowthData, getRoleDistributionData } from '../api/mockAdminStats';
import { PlatformRevenueChart } from './charts/PlatformRevenueChart';
import { UserGrowthChart } from './charts/UserGrowthChart';
import { RoleDistributionChart } from './charts/RoleDistributionChart';
import { Loader2, TrendingUp, Users, PieChart } from 'lucide-react';

export default function AdminCharts() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ revenue: [], growth: [], roles: [] });

  useEffect(() => {
    Promise.all([
      getPlatformRevenueData(),
      getUserGrowthData(),
      getRoleDistributionData()
    ]).then(([revenue, growth, roles]) => {
      setData({ revenue, growth, roles });
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 glass-panel rounded-3xl shadow-xl border border-white/20">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
        <p className="text-sm text-gray-400 font-label">Đang tải biểu đồ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-white/20 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-display mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Doanh thu Platform
            </h3>
            <p className="text-xs text-gray-500">Doanh thu từ phí nền tảng và các giao dịch đặt sân trong 6 tháng.</p>
          </div>
          <PlatformRevenueChart data={data.revenue} />
        </div>
        
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-white/20 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-display mb-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Tăng trưởng người dùng
            </h3>
            <p className="text-xs text-gray-500">Tương quan người dùng mới và rời đi.</p>
          </div>
          <UserGrowthChart data={data.growth} />
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-white/20">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-display mb-1 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-500" />
            Phân bổ vai trò hệ thống
          </h3>
          <p className="text-xs text-gray-500">Tỉ lệ các nhóm người dùng trên hệ thống SmashHub.</p>
        </div>
        <RoleDistributionChart data={data.roles} />
      </div>
    </div>
  );
}
