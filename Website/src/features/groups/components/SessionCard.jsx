import { Clock, MapPin, ChevronRight, MoreVertical } from 'lucide-react';

/**
 * SessionCard Component
 * Premium card displaying schedule information, capacity meter, overlapping avatars,
 * and clear light/dark aesthetics.
 */
export default function SessionCard({ session, onManage }) {
  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return 'Hôm nay';
    if (d.toDateString() === tomorrow.toDateString()) return 'Ngày mai';
    return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
  };

  const getCapacityColor = (current, max) => {
    if (!max) return 'bg-emerald-500';
    const ratio = current / max;
    if (ratio >= 1) return 'bg-rose-500';
    if (ratio >= 0.8) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getCapacityTextColor = (current, max) => {
    if (!max) return 'text-emerald-600 dark:text-emerald-400';
    const ratio = current / max;
    if (ratio >= 1) return 'text-rose-600 dark:text-rose-400';
    if (ratio >= 0.8) return 'text-amber-600 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  const getCapacityLabel = (current, max) => {
    if (current >= max) return 'Full';
    return `${Math.round((current / max) * 100)}%`;
  };

  const getLevelBadge = (sportName) => {
    const levels = ['Intermediate', 'Advanced', 'Casual'];
    const colors = [
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    ];
    // Seed index based on string length to give varied badges
    const idx = (sportName?.length || 0) % 3;
    return { label: levels[idx], classes: colors[idx] };
  };

  const badge = getLevelBadge(session.sportName || 'Badminton');
  const capacityPct = session.maxParticipants > 0
    ? Math.min((session.currentParticipants / session.maxParticipants) * 100, 100)
    : 0;

  return (
    <div className="rounded-2xl border border-gray-200/80 dark:border-border-dark/60 bg-white dark:bg-card-dark/30 shadow-sm dark:shadow-none hover:border-emerald-500/40 dark:hover:border-primary/20 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/5 transition-all duration-300 flex flex-col justify-between h-[230px] p-5 group">
      {/* Top section: Badge and Action Menu */}
      <div className="flex items-center justify-between">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.classes} font-label`}>
          {badge.label}
        </span>
        <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-white/5 transition-all cursor-pointer">
          <MoreVertical className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Middle section: Title and Schedule */}
      <div className="space-y-2 mt-2">
        <h3 className="text-base font-bold text-gray-900 dark:text-white truncate font-display group-hover:text-emerald-700 dark:group-hover:text-primary transition-colors duration-200">
          {session.title}
        </h3>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4 text-emerald-600/70 dark:text-primary/70 shrink-0" />
            <span className="font-label truncate">
              {formatDate(session.startTime)}, {formatTime(session.startTime)} - {formatTime(session.endTime)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <MapPin className="h-4 w-4 text-emerald-600/70 dark:text-primary/70 shrink-0" />
            <span className="font-label truncate">{session.location || 'Chưa xác định'}</span>
          </div>
        </div>
      </div>

      {/* Bottom section: Capacity Bar and Member Avatars */}
      <div className="space-y-3 mt-3">
        {/* Capacity Bar Header */}
        <div className="flex items-center justify-between text-xs font-label">
          <span className="text-gray-400 dark:text-gray-500">
            Capacity: {session.currentParticipants}/{session.maxParticipants}
          </span>
          <span className={`font-semibold ${getCapacityTextColor(session.currentParticipants, session.maxParticipants)}`}>
            {getCapacityLabel(session.currentParticipants, session.maxParticipants)}
          </span>
        </div>

        {/* Capacity Progress Bar */}
        <div className="w-full h-2 bg-gray-100 dark:bg-border-dark/40 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getCapacityColor(session.currentParticipants, session.maxParticipants)}`}
            style={{ width: `${capacityPct}%` }}
          />
        </div>

        {/* Card Footer: Overlapping Avatars and Manage Link */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex -space-x-2">
            {Array.from({ length: Math.min(session.currentParticipants || 0, 3) }).map((_, i) => (
              <div
                key={i}
                className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 border-2 border-white dark:border-[#1E293B] flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
            {(session.currentParticipants || 0) > 3 && (
              <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-border-dark border-2 border-white dark:border-[#1E293B] flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-400 shadow-sm">
                +{(session.currentParticipants || 0) - 3}
              </div>
            )}
            {(session.currentParticipants || 0) === 0 && (
              <div className="text-xs text-gray-400 font-label italic">Trống</div>
            )}
          </div>

          <button
            onClick={() => onManage && onManage(session.scheduleId)}
            className="text-xs font-bold text-emerald-600 dark:text-primary hover:text-emerald-800 dark:hover:text-primary-dark transition-all duration-200 font-label cursor-pointer flex items-center gap-0.5 hover:gap-1"
          >
            Manage
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
