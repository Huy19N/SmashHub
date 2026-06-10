import React from 'react';
import { 
  Activity, DollarSign, Award, Target, Trophy, Frown, Loader2, AlertCircle 
} from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import { useTheme } from '../../../contexts/ThemeContext';
import useStatistics from '../hooks/useStatistics';
import StatCard from '../components/StatCard';
import LeaderStats from '../components/LeaderStats';
import MemberStats from '../components/MemberStats';
import FacilityOwnerStats from '../components/FacilityOwnerStats';

export default function DashboardPage() {
  const { theme } = useTheme();
  const { data, isLoading, error, refetch } = useStatistics();

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0c0f17]' : 'bg-gray-50'} flex`}>
      <Sidebar activeMenu="dashboard" />

      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-screen overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display tracking-tight">
            Bảng thống kê
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-label mt-1">
            Theo dõi hiệu suất chơi thể thao và số liệu thống kê tài chính của bạn.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-label">Đang tải bảng thống kê...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-150 dark:border-red-500/20 max-w-md mx-auto">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-red-800 dark:text-red-400 font-display">Đã xảy ra lỗi</h3>
            <p className="text-sm text-red-600 dark:text-red-400/80 font-label mt-1">{error}</p>
            <button 
              onClick={refetch} 
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        ) : data ? (
          <div className="space-y-8 pb-16">
            {/* If user is Facility Owner, render Owner specific stats exclusively */}
            {data.isFacilityOwner ? (
              <FacilityOwnerStats stats={data.facilityOwnerStats} />
            ) : (
              // Else render normal player stats
              <>
                {/* Section 1: General Stats */}
                <div className="space-y-4">
                  <div className="border-b border-gray-150 dark:border-border-dark/40 pb-2">
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white font-display flex items-center gap-2">
                      <span className="w-1.5 h-4.5 bg-emerald-500 rounded-full inline-block"></span>
                      Thống kê chung
                    </h3>
                    <p className="text-[10px] text-gray-400 font-label mt-0.5">Các số liệu tổng quan hoạt động thể thao cá nhân</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                      title="Trận đã tham gia"
                      value={data.generalStats?.totalMatchesJoined}
                      icon={Activity}
                      color="emerald"
                      subtext="Tổng số ca chơi bạn đã có mặt giao lưu"
                    />
                    <StatCard
                      title="Tổng chi tiêu"
                      value={formatCurrency(data.generalStats?.totalSpending)}
                      icon={DollarSign}
                      color="blue"
                      subtext="Tổng tiền đã nạp mua Subscription"
                    />
                    <StatCard
                      title="Tỉ lệ Thắng / Thua"
                      value={`${data.generalStats?.winRate}%`}
                      icon={Target}
                      color="orange"
                      subtext={`Chiến thắng ${data.generalStats?.wins} trận và thua ${data.generalStats?.losses} trận`}
                    />
                    <StatCard
                      title="Môn chơi nhiều nhất"
                      value={data.generalStats?.mostPlayedSport}
                      icon={Award}
                      color="purple"
                      subtext="Bộ môn thể thao bạn tích cực tham dự nhất"
                    />
                  </div>

                  {/* Visual Win/Loss Pie Chart */}
                  {(data.generalStats?.wins > 0 || data.generalStats?.losses > 0) && (
                    <div className="bg-white dark:bg-card-dark border border-gray-200/80 dark:border-border-dark/60 rounded-3xl p-6 shadow-sm max-w-sm">
                      <h4 className="font-bold text-xs text-gray-800 dark:text-white font-display mb-4">Biểu đồ tỉ lệ Thắng / Thua</h4>
                      <div className="flex items-center gap-6">
                        {/* Circular SVG Chart */}
                        <div className="relative w-28 h-28 shrink-0">
                          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                            {/* Background circle (Losses) */}
                            <circle
                              cx="18"
                              cy="18"
                              r="15.915"
                              fill="none"
                              className="stroke-red-500/20"
                              strokeWidth="4"
                            />
                            {/* Foreground circle (Wins) */}
                            <circle
                              cx="18"
                              cy="18"
                              r="15.915"
                              fill="none"
                              className="stroke-emerald-500"
                              strokeWidth="4.2"
                              strokeDasharray={`${data.generalStats.winRate} ${100 - data.generalStats.winRate}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-base font-black font-display text-emerald-600 dark:text-primary">
                              {data.generalStats.winRate}%
                            </span>
                            <span className="text-[7px] text-gray-400 font-bold uppercase font-label">Thắng</span>
                          </div>
                        </div>

                        {/* Legends */}
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-emerald-500 shrink-0"></div>
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-400 font-bold font-label leading-none">THẮNG</p>
                              <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight mt-0.5">
                                {data.generalStats.wins} trận
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-red-400 shrink-0"></div>
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-400 font-bold font-label leading-none">THUA</p>
                              <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight mt-0.5">
                                {data.generalStats.losses} trận
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 2: Leader Stats */}
                {data.isLeader && (
                  <LeaderStats stats={data.leaderStats} />
                )}

                {/* Section 3: Member Stats */}
                {data.isMember && (
                  <MemberStats stats={data.memberStats} />
                )}

                {/* Optional welcome placeholder if user has no groups/roles yet */}
                {!data.isLeader && !data.isMember && (
                  <div className="p-6 text-center bg-gray-50/50 dark:bg-white/5 border border-gray-150 dark:border-white/10 rounded-2xl max-w-md mx-auto">
                    <Trophy className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <h4 className="text-xs font-bold text-gray-800 dark:text-white font-display">Bắt đầu hành trình chơi thể thao</h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-label mt-1 leading-relaxed">
                      Bạn chưa tham gia vào nhóm giao lưu nào. Hãy tìm kiếm nhóm chơi phù hợp hoặc tạo nhóm mới để cùng nhau tổ chức cá ca chơi thú vị nhé!
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : null}

      </div>
    </div>
  );
}
