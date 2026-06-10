import React from 'react';
import { CalendarDays, DollarSign, Users } from 'lucide-react';
import StatCard from './StatCard';

export default function LeaderStats({ stats }) {
  if (!stats) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-150 dark:border-border-dark/40 pb-2">
        <h3 className="text-base font-extrabold text-gray-900 dark:text-white font-display flex items-center gap-2">
          <span className="w-1.5 h-4.5 bg-emerald-500 rounded-full inline-block"></span>
          Thống kê Chủ nhóm
        </h3>
        <p className="text-[10px] text-gray-400 font-label mt-0.5">Các thông số quản lý và tài chính nhóm chơi</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Tổ chức lịch chơi"
          value={stats.hostedSessionsCount}
          icon={CalendarDays}
          color="emerald"
          subtext="Số buổi chơi đã kêu gọi giao lưu thành công"
        />
        <StatCard
          title="Tiền ứng đặt sân"
          value={formatCurrency(stats.totalAdvancedBookingFee)}
          icon={DollarSign}
          color="orange"
          subtext="Chi phí thuê sân trước (cần thu lại từ thành viên)"
        />
        <StatCard
          title="Thành viên quản lý"
          value={stats.totalMembersManaged}
          icon={Users}
          color="purple"
          subtext="Tổng số thành viên trong các nhóm bạn làm chủ"
        />
      </div>
    </div>
  );
}
