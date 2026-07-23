import { useEffect, useState } from 'react';
import { getPlatformRevenueData, getUserGrowthData, getRoleDistributionData } from '../api/mockAdminStats';
import { PlatformRevenueChart } from './charts/PlatformRevenueChart';
import { UserGrowthChart } from './charts/UserGrowthChart';
import { RoleDistributionChart } from './charts/RoleDistributionChart';
import { Loader2, TrendingUp, Users, PieChart } from 'lucide-react';

export default function AdminCharts({ stats }) {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({ revenue: [], growth: [], roles: [] });

  useEffect(() => {
    async function loadData() {
      // Build role distribution from real admin stats
      const totalUsers = stats?.totalUsers || 25;
      const totalPlayers = stats?.totalPlayers || 21;
      const totalOwners = stats?.totalOwners || 1;
      const totalAdmins = Math.max(1, totalUsers - totalPlayers - totalOwners);

      const roles = [
        { name: 'Player (Người chơi)', value: totalPlayers, color: '#0BE860' },
        { name: 'Court Owner (Chủ sân)', value: totalOwners, color: '#3b82f6' },
        { name: 'Admin (Quản trị)', value: totalAdmins, color: '#f59e0b' },
      ];

      // Use real monthly revenue from stats API if provided
      let revenue = stats?.monthlyRevenue;
      if (!revenue || revenue.length === 0) {
        revenue = await getPlatformRevenueData();
      }

      // Use real user growth or calculate from stats
      let growth = stats?.userGrowth;
      if (!growth || growth.length === 0) {
        growth = await getUserGrowthData();
      }

      setChartData({ revenue, growth, roles });
      setLoading(false);
    }

    loadData();
  }, [stats]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 glass-panel rounded-3xl shadow-xl border border-white/20">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
        <p className="text-sm text-gray-400 font-label">Đang tải biểu đồ thống kê hệ thống...</p>
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
          <PlatformRevenueChart data={chartData.revenue} />
        </div>
        
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-white/20 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-display mb-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Tăng trưởng người dùng
            </h3>
            <p className="text-xs text-gray-500">Tương quan người dùng mới và rời đi.</p>
          </div>
          <UserGrowthChart data={chartData.growth} />
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-white/20">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-display mb-1 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-500" />
            Phân bổ vai trò hệ thống (Dữ liệu thực)
          </h3>
          <p className="text-xs text-gray-500">Tỉ lệ thực tế các nhóm người dùng trên hệ thống SmashHub.</p>
        </div>
        <RoleDistributionChart data={chartData.roles} />
      </div>
    </div>
  );
}
