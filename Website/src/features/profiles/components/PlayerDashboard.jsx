import { useEffect, useState } from 'react';
import { getPlayerProgressData, getPlayTimeData, getOpponentData } from '../api/mockPlayerStats';
import { PlayerProgressChart } from './charts/PlayerProgressChart';
import { PlayTimeBarChart } from './charts/PlayTimeBarChart';
import { OpponentPieChart } from './charts/OpponentPieChart';
import { Loader2, TrendingUp, Activity, Crosshair } from 'lucide-react';

export default function PlayerDashboard({ statistics }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ progress: [], playTime: [], opponent: [] });

  useEffect(() => {
    async function loadPlayerData() {
      // 1. Elo Rating Progress
      let progress = statistics?.monthlyProgress;
      if (!progress || progress.length === 0) {
        progress = await getPlayerProgressData();
      }

      // 2. Play Time / Frequency
      let playTime = statistics?.playFrequency;
      if (!playTime || playTime.length === 0) {
        playTime = await getPlayTimeData();
      }

      // 3. Match Results (Thắng / Thua / Hòa) from real generalStats
      let opponent = [];
      const wins = statistics?.generalStats?.wins ?? 15;
      const losses = statistics?.generalStats?.losses ?? 10;
      const draws = statistics?.generalStats?.draws ?? 2;

      if (wins > 0 || losses > 0 || draws > 0) {
        opponent = [
          { name: 'Thắng', value: wins, color: '#0BE860' },
          { name: 'Thua', value: losses, color: '#ef4444' },
          { name: 'Hòa', value: draws, color: '#f59e0b' },
        ];
      } else {
        opponent = await getOpponentData();
      }

      setData({ progress, playTime, opponent });
      setLoading(false);
    }

    loadPlayerData();
  }, [statistics]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-[350px] w-full bg-gray-50 dark:bg-white/5 rounded-3xl animate-pulse flex flex-col items-center justify-center border border-gray-100 dark:border-border-dark/40">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
          <p className="text-sm text-gray-400 font-label">Đang tải dữ liệu biểu đồ người chơi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn mt-6">
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
