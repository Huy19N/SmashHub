import { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  CalendarCheck,
  CircleDollarSign,
  TrendingUp,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { useAdminDashboard } from '../hooks/useAdmin';
import AdminCharts from '../components/AdminCharts';

export default function AdminDashboard() {
  const { stats, isLoading, fetchStats } = useAdminDashboard();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <AlertCircle className="w-12 h-12 mb-3 text-red-400" />
        <p>Không có dữ liệu thống kê.</p>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const kpis = [
    {
      title: 'Tổng người dùng',
      value: stats.totalUsers,
      sub: `${stats.totalPlayers} Người chơi / ${stats.totalOwners} Chủ sân`,
      icon: Users,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
    },
    {
      title: 'Tổng cơ sở',
      value: stats.totalFacilities,
      sub: `${stats.totalCourts} Sân hoạt động`,
      icon: Building2,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    },
    {
      title: 'Lượt đặt sân',
      value: stats.totalBookings,
      sub: 'Tất cả trạng thái đặt',
      icon: CalendarCheck,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    },
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(stats.totalRevenue),
      sub: 'Thanh toán thành công',
      icon: CircleDollarSign,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
    },
    {
      title: 'Phản hồi khách hàng',
      value: 25,
      sub: '25 lượt phản hồi & đánh giá',
      icon: MessageSquare,
      color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold font-display leading-tight dark:text-white">Bảng Thống Kê Tổng Quan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Xem các chỉ số hiệu suất của hệ thống SmashHub.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-primary/10 border border-emerald-200 dark:border-primary/20 rounded-xl text-emerald-700 dark:text-primary text-xs font-bold font-label">
          <TrendingUp className="w-4 h-4" />
          Hệ thống hoạt động bình thường
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-[#0b0f19]/60 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between glass-panel">
            <div className="space-y-1.5 min-w-0">
              <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-label truncate block">{kpi.title}</span>
              <h2 className="text-xl font-extrabold font-display leading-none dark:text-white">{kpi.value}</h2>
              <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 font-label truncate">{kpi.sub}</p>
            </div>
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${kpi.color}`}>
              <kpi.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      <AdminCharts stats={stats} />
      <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-white/20">
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-display mb-1">
            Đặt Sân Gần Đây
          </h3>
          <p className="text-xs text-gray-500">Danh sách 10 giao dịch đặt sân mới nhất trên hệ thống.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-3 text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider font-label">
                <th className="py-3 px-4 whitespace-nowrap">Khách hàng</th>
                <th className="py-3 px-4 whitespace-nowrap">Cơ sở / Sân</th>
                <th className="py-3 px-4 whitespace-nowrap">Thời gian</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Chi phí</th>
                <th className="py-3 px-4 whitespace-nowrap">Hình thức</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
              {(stats.recentBookings || []).map((b) => (
                <tr key={b.bookingId} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <p className="font-semibold text-gray-800 dark:text-white">{b.customerName}</p>
                    <p className="text-[10px] text-gray-400">{b.customerEmail}</p>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <p className="font-semibold text-gray-800 dark:text-white">{b.courtName}</p>
                    <p className="text-xs text-gray-500">{b.facilityName}</p>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <p className="text-gray-700 dark:text-gray-300">
                      {new Date(b.startTime).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-gray-800 dark:text-white whitespace-nowrap">
                    {formatCurrency(b.totalCost)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-label uppercase ${
                      b.bookingType === 'Online'
                        ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                        : 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20'
                    }`}>
                      {b.bookingType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-label uppercase ${
                      b.statusId === 2
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : b.statusId === 3
                          ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    }`}>
                      {b.statusName}
                    </span>
                  </td>
                </tr>
              ))}
              {(stats.recentBookings || []).length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    Chưa có lượt đặt sân nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
