import { useState, useRef, useEffect } from 'react';
import { Clock, MapPin, ChevronRight, MoreVertical, Trash2, UserPlus, UserMinus, Loader2, Flame, Users } from 'lucide-react';

/**
 * SessionCard Component
 * Premium card displaying schedule information, capacity meter, vote buttons,
 * and clear light/dark aesthetics.
 */
export default function SessionCard({
  session,
  onManage,
  isLeader,
  isDeleting,
  onDelete,
  hasJoined,
  isVoting,
  onVoteJoin,
  onVoteLeave,
  onCreateChallenge,
  activeChallengeId,
  onViewMatchRequests,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  const isFull = session.currentParticipants >= session.maxParticipants;
  const capacityPct = session.maxParticipants > 0
    ? Math.min((session.currentParticipants / session.maxParticipants) * 100, 100)
    : 0;

  return (
    <div className="rounded-2xl border border-gray-200/80 dark:border-border-dark/60 bg-white dark:bg-card-dark/30 shadow-sm dark:shadow-none hover:border-emerald-500/40 dark:hover:border-primary/20 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/5 transition-all duration-300 flex flex-col justify-between p-5 group">
      {/* Top section: Sport badge and Action Menu */}
      <div className="flex items-center justify-between">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 font-label">
          {session.sportName || 'Badminton'}
        </span>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(prev => !prev)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            <MoreVertical className="h-4.5 w-4.5" />
          </button>
          {showMenu && isLeader && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-xl shadow-lg z-20 py-1 animate-fade-in">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete?.();
                }}
                disabled={isDeleting}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer font-label"
              >
                {isDeleting ? (
                  <div className="h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {isDeleting ? 'Đang xóa...' : 'Xóa lịch trình'}
              </button>
            </div>
          )}
        </div>
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
            <span className="font-label truncate">{session.facilityName || session.courtName || 'Chưa xác định'}</span>
          </div>
        </div>
      </div>

      {/* Capacity section */}
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

        {/* Card Footer: Vote button (left) and Manage link (right) */}
        <div className="flex items-center justify-between pt-1">
          {/* Vote buttons - left side */}
          <div className="flex items-center gap-2">
            {hasJoined ? (
              <button
                onClick={() => onVoteLeave?.(session.scheduleId)}
                disabled={isVoting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 dark:hover:bg-red-500/20 transition-all cursor-pointer font-label disabled:opacity-50"
              >
                {isVoting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <UserMinus className="h-3.5 w-3.5" />
                )}
                Hủy tham gia
              </button>
            ) : (
              <button
                onClick={() => onVoteJoin?.(session.scheduleId)}
                disabled={isVoting || isFull}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-label disabled:opacity-50 disabled:cursor-not-allowed ${isFull
                    ? 'bg-gray-100 text-gray-400 border border-gray-200 dark:bg-white/5 dark:text-gray-500 dark:border-border-dark/40'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 dark:hover:bg-emerald-500/20'
                  }`}
              >
                {isVoting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <UserPlus className="h-3.5 w-3.5" />
                )}
                {isFull ? 'Đã đầy' : 'Tham gia'}
              </button>
            )}

            {isLeader && (
              activeChallengeId ? (
                <button
                  onClick={() => onViewMatchRequests?.(activeChallengeId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 dark:hover:bg-blue-500/20 transition-all cursor-pointer font-label"
                >
                  <Users className="h-3.5 w-3.5" />
                  Yêu cầu ghép
                </button>
              ) : (
                <button
                  onClick={() => onCreateChallenge?.(session.scheduleId, session.sportId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 dark:hover:bg-amber-500/20 transition-all cursor-pointer font-label"
                >
                  <Flame className="h-3.5 w-3.5" />
                  Bắt kèo
                </button>
              )
            )}
          </div>

          {/* Manage - right side (for leader to view participants) */}
          {isLeader && (
            <button
              onClick={() => onManage && onManage(session.scheduleId)}
              className="text-xs font-bold text-emerald-600 dark:text-primary hover:text-emerald-800 dark:hover:text-primary-dark transition-all duration-200 font-label cursor-pointer flex items-center gap-0.5 hover:gap-1"
            >
              Quản lý
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
