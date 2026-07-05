import { useEffect, useState } from 'react';
import { getPlayerProgressData, getPlayTimeData, getOpponentData } from '../api/mockPlayerStats';
import { PlayerProgressChart } from './charts/PlayerProgressChart';
import { PlayTimeBarChart } from './charts/PlayTimeBarChart';
import { OpponentPieChart } from './charts/OpponentPieChart';
import { Loader2, TrendingUp, Activity, Crosshair } from 'lucide-react';

export default function PlayerDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ progress: [], playTime: [], opponent: [] });

  useEffect(() => {
    Promise.all([
      getPlayerProgressData(),
      getPlayTimeData(),
      getOpponentData()
    ]).then(([progress, playTime, opponent]) => {
      setData({ progress, playTime, opponent });
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-[350px] w-full bg-gray-50 dark:bg-white/5 rounded-3xl animate-pulse flex flex-col items-center justify-center border border-gray-100 dark:border-border-dark/40">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
          <p className="text-sm text-gray-400 font-label">Đang tải dữ liệu biểu đồ...</p>
        </div>
      </div>
    );
  }

  // Handle empty state explicitly
  const hasData = data.progress.length > 0 || data.playTime.length > 0 || data.opponent.length > 0;
  if (!hasData) {
    return (
      <div className="bg-white dark:bg-card-dark border border-gray-200/80 dark:border-border-dark/60 rounded-3xl p-12 shadow-sm text-center">
        <Activity className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display">Chưa có dữ liệu thống kê</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-label">
          Tham gia các trận đấu để hệ thống ghi nhận và phân tích dữ liệu cho bạn.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Chart 1: Progress */}
      <div className="bg-white dark:bg-card-dark border border-gray-200/80 dark:border-border-dark/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display tracking-tight">
            Sự tiến bộ (Rating Elo)
          </h3>
        </div>
        <PlayerProgressChart data={data.progress} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 2: Play Time */}
        <div className="bg-white dark:bg-card-dark border border-gray-200/80 dark:border-border-dark/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-teal-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display tracking-tight">
              Tần suất chơi
            </h3>
          </div>
          <PlayTimeBarChart data={data.playTime} />
        </div>

        {/* Chart 3: Opponents */}
        <div className="bg-white dark:bg-card-dark border border-gray-200/80 dark:border-border-dark/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-6">
            <Crosshair className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display tracking-tight">
              Kết quả thi đấu
            </h3>
          </div>
          <OpponentPieChart data={data.opponent} />
        </div>
      </div>
    </div>
  );
}
