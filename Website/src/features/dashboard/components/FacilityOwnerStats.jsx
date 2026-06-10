import React, { useState } from 'react';
import { 
  DollarSign, CalendarDays, Users, TrendingUp, Award, Clock 
} from 'lucide-react';
import StatCard from './StatCard';

export default function FacilityOwnerStats({ stats }) {
  const [timeRange, setTimeRange] = useState('daily'); // 'daily' | 'monthly' | 'yearly'
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  if (!stats) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  // Get active chart data
  const chartData = timeRange === 'daily' 
    ? stats.dailyStats 
    : timeRange === 'monthly' 
      ? stats.monthlyStats 
      : stats.yearlyStats;

  // Find max revenue to scale SVG chart heights
  const maxRevenue = Math.max(...chartData.map(item => item.revenue), 10000);

  // SVG Chart settings
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const chartWidth = 550;
  const activeAreaHeight = chartHeight - paddingY * 2;
  const activeAreaWidth = chartWidth - paddingX * 2;
  const barWidth = Math.max(10, Math.min(40, (activeAreaWidth / chartData.length) * 0.5));
  const spacing = (activeAreaWidth - (barWidth * chartData.length)) / (chartData.length + 1);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Overview Header */}
      <div className="border-b border-gray-150 dark:border-border-dark/40 pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white font-display flex items-center gap-2">
            <TrendingUp className="w-5.5 h-5.5 text-emerald-500" />
            Báo cáo chủ sân
          </h3>
          <p className="text-[10px] text-gray-400 font-label mt-0.5">Thống kê hoạt động kinh doanh sân thể thao của bạn</p>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard
          title="Tổng doanh thu"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          color="emerald"
          subtext="Doanh thu tích lũy từ các đặt sân thành công"
        />
        <StatCard
          title="Tổng lượt đặt"
          value={stats.totalBookingsCount}
          icon={CalendarDays}
          color="blue"
          subtext="Số ca sân đã được đặt và hoàn tất thanh toán"
        />
        <StatCard
          title="Tổng khách hàng"
          value={stats.uniqueCustomersCount}
          icon={Users}
          color="purple"
          subtext="Số người chơi riêng biệt đặt sân của bạn"
        />
        <StatCard
          title="Khung giờ cao điểm"
          value={stats.peakHour}
          icon={Clock}
          color="orange"
          subtext="Khung giờ được ưa chuộng đặt nhiều nhất"
        />
        <StatCard
          title="Sân đặt nhiều nhất"
          value={stats.mostBookedCourt}
          icon={Award}
          color="purple"
          subtext="Tên sân con dẫn đầu về tần suất đặt sân"
        />
      </div>

      {/* Revenue Chart Component (Interactive SVG) */}
      <div className="bg-white dark:bg-card-dark border border-gray-200/80 dark:border-border-dark/60 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h4 className="font-extrabold text-sm text-gray-800 dark:text-white font-display">Biểu đồ doanh thu</h4>
            <p className="text-[10px] text-gray-400 font-label">Doanh thu và số ca đặt sân theo thời gian</p>
          </div>

          {/* Time range switcher */}
          <div className="flex items-center bg-gray-50 dark:bg-white/5 border border-gray-150 dark:border-white/10 p-1.5 rounded-2xl gap-1.5 self-start sm:self-center">
            <button
              onClick={() => setTimeRange('daily')}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider uppercase font-label transition-all cursor-pointer ${
                timeRange === 'daily'
                  ? 'bg-emerald-600 dark:bg-primary text-white dark:text-[#052e14] shadow-sm'
                  : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              7 Ngày qua
            </button>
            <button
              onClick={() => setTimeRange('monthly')}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider uppercase font-label transition-all cursor-pointer ${
                timeRange === 'monthly'
                  ? 'bg-emerald-600 dark:bg-primary text-white dark:text-[#052e14] shadow-sm'
                  : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              12 Tháng qua
            </button>
            <button
              onClick={() => setTimeRange('yearly')}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider uppercase font-label transition-all cursor-pointer ${
                timeRange === 'yearly'
                  ? 'bg-emerald-600 dark:bg-primary text-white dark:text-[#052e14] shadow-sm'
                  : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Theo Năm
            </button>
          </div>
        </div>

        {/* SVG Chart display */}
        <div className="relative overflow-x-auto select-none custom-scrollbar">
          <svg 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            className="w-full min-w-[500px] h-auto drop-shadow-sm font-label"
          >
            {/* Gridlines */}
            <line 
              x1={paddingX} 
              y1={paddingY} 
              x2={chartWidth - paddingX} 
              y2={paddingY} 
              className="stroke-gray-100 dark:stroke-white/5" 
              strokeDasharray="4 4"
            />
            <line 
              x1={paddingX} 
              y1={paddingY + activeAreaHeight / 2} 
              x2={chartWidth - paddingX} 
              y2={paddingY + activeAreaHeight / 2} 
              className="stroke-gray-100 dark:stroke-white/5" 
              strokeDasharray="4 4"
            />
            <line 
              x1={paddingX} 
              y1={chartHeight - paddingY} 
              x2={chartWidth - paddingX} 
              y2={chartHeight - paddingY} 
              className="stroke-gray-200 dark:stroke-white/10" 
            />

            {/* Render Bars */}
            {chartData.map((item, index) => {
              const x = paddingX + spacing * (index + 1) + barWidth * index;
              // Calculate bar height relative to maxRevenue
              const valueRatio = maxRevenue > 0 ? item.revenue / maxRevenue : 0;
              const barHeight = activeAreaHeight * valueRatio;
              const y = chartHeight - paddingY - barHeight;

              return (
                <g 
                  key={index}
                  onMouseEnter={() => setHoveredBarIndex(index)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                  className="cursor-pointer"
                >
                  {/* Invisible broad hitbox for easy hovering */}
                  <rect
                    x={x - spacing / 2}
                    y={paddingY}
                    width={barWidth + spacing}
                    height={activeAreaHeight}
                    fill="transparent"
                  />

                  {/* Gradient fill bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx={4}
                    fill={hoveredBarIndex === index ? 'url(#barGradActive)' : 'url(#barGrad)'}
                    className="transition-all duration-300 origin-bottom"
                  />

                  {/* Highlight bubble / tooltip indicator on hover */}
                  {hoveredBarIndex === index && (
                    <circle
                      cx={x + barWidth / 2}
                      cy={y}
                      r={4}
                      className="fill-emerald-500 dark:fill-primary stroke-white dark:stroke-gray-800 stroke-2 animate-ping"
                    />
                  )}

                  {/* X axis labels */}
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight - paddingY + 16}
                    textAnchor="middle"
                    className="text-[9px] fill-gray-400 dark:fill-gray-500 font-semibold uppercase tracking-wider"
                  >
                    {item.label}
                  </text>
                </g>
              );
            })}

            {/* Gradient definitions */}
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="barGradActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Floating dynamic tooltip */}
          {hoveredBarIndex !== null && (
            <div 
              className="absolute bg-gray-900/90 dark:bg-white/95 text-white dark:text-gray-900 px-3.5 py-2.5 rounded-xl text-xs font-semibold shadow-xl border border-white/10 dark:border-gray-200 pointer-events-none transition-all duration-150 animate-fadeIn"
              style={{
                left: `${Math.max(10, Math.min(chartWidth - 140, paddingX + spacing * (hoveredBarIndex + 1) + barWidth * hoveredBarIndex - 50))}px`,
                top: `${Math.max(5, (chartHeight - paddingY - (activeAreaHeight * (chartData[hoveredBarIndex].revenue / maxRevenue))) - 55)}px`
              }}
            >
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mb-1 font-label">
                {chartData[hoveredBarIndex].label}
              </p>
              <div className="space-y-0.5">
                <p className="font-extrabold text-xs">
                  Thu: {formatCurrency(chartData[hoveredBarIndex].revenue)}
                </p>
                <p className="text-[11px] text-gray-300 dark:text-gray-600 font-label">
                  Đặt sân: {chartData[hoveredBarIndex].count} ca
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
