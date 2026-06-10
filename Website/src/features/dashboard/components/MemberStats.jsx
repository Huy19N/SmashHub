import React from 'react';
import { Percent, DollarSign } from 'lucide-react';
import StatCard from './StatCard';

export default function MemberStats({ stats }) {
  if (!stats) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-150 dark:border-border-dark/40 pb-2">
        <h3 className="text-base font-extrabold text-gray-900 dark:text-white font-display flex items-center gap-2">
          <span className="w-1.5 h-4.5 bg-blue-500 rounded-full inline-block"></span>
          Thống kê Thành viên
        </h3>
        <p className="text-[10px] text-gray-400 font-label mt-0.5">Tỉ lệ tham gia và chi phí giao lưu đóng góp</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Tỉ lệ chuyên cần"
          value={`${stats.attendanceRate}%`}
          icon={Percent}
          color="blue"
          subtext={`Tham dự ${stats.totalAttended}/${stats.totalSchedulesCount} buổi chơi của nhóm`}
        />
        <StatCard
          title="Tiền đóng góp share kèo"
          value={formatCurrency(stats.totalContributedFees)}
          icon={DollarSign}
          color="emerald"
          subtext="Tổng chi phí tham gia lịch trình bạn đã hoàn đóng góp"
        />
      </div>
    </div>
  );
}
