import { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  CalendarCheck,
  CircleDollarSign,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useAdminDashboard } from '../hooks/useAdmin';

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
    }
  ];

  const maxRevenue = Math.max(...(stats.monthlyRevenue || []).map(m => m.revenue), 1000000);
  const chartHeight = 160;
  const chartWidth = 500;
  const points = (stats.monthlyRevenue || []).map((m, idx) => {
    const x = (idx / ((stats.monthlyRevenue?.length || 1) - 1)) * (chartWidth - 60) + 30;
    const y = chartHeight - (m.revenue / maxRevenue) * (chartHeight - 40) - 20;
    return { x, y, label: m.label, revenue: m.revenue };
  });

  const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0 ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - 20} L ${points[0].x} ${chartHeight - 20} Z` : '';

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-[#0b0f19]/60 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between glass-panel">
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-label">{kpi.title}</span>
              <h2 className="text-2xl font-extrabold font-display leading-none dark:text-white">{kpi.value}</h2>
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 font-label">{kpi.sub}</p>
            </div>
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border ${kpi.color}`}>
              <kpi.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-white/20 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-display mb-1">
              Doanh thu 6 tháng gần nhất
            </h3>
            <p className="text-xs text-gray-500">Doanh thu từ các gói hội viên và phí đặt sân trực tuyến.</p>
          </div>
          <div className="w-full">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full overflow-visible">
              <line x1="30" y1="20" x2={chartWidth - 30} y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="1" className="dark:stroke-white/5 stroke-gray-100" />
              <line x1="30" y1="80" x2={chartWidth - 30} y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="1" className="dark:stroke-white/5 stroke-gray-100" />
              <line x1="30" y1={chartHeight - 20} x2={chartWidth - 30} y2={chartHeight - 20} stroke="rgba(255,255,255,0.1)" strokeWidth="1" className="dark:stroke-white/10 stroke-gray-200" />
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}
              {linePath && <path d={linePath} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
              {points.map((p, idx) => (
                <g key={idx} className="group cursor-pointer">
                  <circle cx={p.x} cy={p.y} r="4" fill="#10B981" stroke="white" strokeWidth="1.5" className="hover:r-6 transition-all duration-150" />
                  <text x={p.x} y={p.y - 8} textAnchor="middle" className="text-[9px] font-bold fill-gray-500 dark:fill-gray-400 hidden group-hover:block pointer-events-none">
                    {formatCurrency(p.revenue)}
                  </text>
                  <text x={p.x} y={chartHeight - 5} textAnchor="middle" className="text-[10px] font-bold fill-gray-400 font-label">
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-white/20 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-display mb-1">
              Phân phối đặt sân
            </h3>
            <p className="text-xs text-gray-500">Tổng quan lượng đặt sân theo tháng.</p>
          </div>
          <div className="space-y-4 my-4">
            {(stats.monthlyRevenue || []).map((item, idx) => {
              const maxCount = Math.max(...(stats.monthlyRevenue || []).map(m => m.bookingCount), 1);
              const percentage = (item.bookingCount / maxCount) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{item.bookingCount} lượt</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider font-label text-center pt-2 border-t border-gray-100 dark:border-white/5">
            Dữ liệu thống kê thời gian thực
          </div>
        </div>
      </div>
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
