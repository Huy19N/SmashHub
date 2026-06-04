import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Award, Calendar, Users, ChevronRight, Trash2, Shield } from 'lucide-react';

const AVATAR_COLORS = [
  'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-pink-500',
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function MemberCard({ member, onRemove, onViewProfile }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleBadge = member.roleName === 'Leader'
    ? { label: 'Trưởng nhóm', classes: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30' }
    : { label: 'Thành viên', classes: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30' };

  const formatDate = (iso) => {
    if (!iso) return 'Chưa xác định';
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Calculate a simple skill label from wins/losses
  const totalGames = (member.wins || 0) + (member.losses || 0);
  const winRate = totalGames > 0 ? Math.round(((member.wins || 0) / totalGames) * 100) : 0;
  const skillLabel = totalGames === 0 ? 'Mới'
    : winRate >= 70 ? 'Giỏi'
      : winRate >= 40 ? 'Khá'
        : 'Trung bình';

  return (
    <div className="rounded-2xl border border-gray-200/80 dark:border-border-dark/60 bg-white dark:bg-card-dark/30 shadow-sm dark:shadow-none hover:border-emerald-500/40 dark:hover:border-primary/20 hover:shadow-md transition-all duration-300 p-5 group flex flex-col justify-between min-h-[220px]">
      {/* Top: Avatar + Name + Menu */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className={`h-11 w-11 rounded-full ${getAvatarColor(member.fullName)} flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0`}>
            {getInitials(member.fullName)}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate font-display group-hover:text-emerald-700 dark:group-hover:text-primary transition-colors">
              {member.fullName}
            </h4>
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-xs font-bold border ${roleBadge.classes} font-label`}>
              {roleBadge.label}
            </span>
          </div>
        </div>

        {/* Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-[#1a202c] border border-gray-200 dark:border-border-dark rounded-xl shadow-lg overflow-hidden z-10 animate-fade-in">
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); onRemove?.(member); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors font-label cursor-pointer text-left"
              >
                <Trash2 className="h-4 w-4" /> Xóa khỏi nhóm
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Info */}
      <div className="mt-4 space-y-2">
        {(member.sportName || member.sport) && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-label">Thể thao: <strong className="text-gray-700 dark:text-gray-200">{member.sportName || member.sport}</strong></span>
          </div>
        )}
        {(member.levelName || member.level) ? (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Award className="h-3.5 w-3.5 text-emerald-600/70 dark:text-primary/70 shrink-0" />
            <span className="font-label">Trình độ: <strong className="text-gray-700 dark:text-gray-200">{member.levelName || member.level}</strong></span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Award className="h-3.5 w-3.5 text-emerald-600/70 dark:text-primary/70 shrink-0" />
            <span className="font-label">Trình độ (W/L): <strong className="text-gray-700 dark:text-gray-200">{skillLabel}</strong></span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="h-3.5 w-3.5 text-emerald-600/70 dark:text-primary/70 shrink-0" />
          <span className="font-label">Tham gia: {formatDate(member.joinedAt)}</span>
        </div>
        {(!member.sportName && !member.sport) && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Shield className="h-3.5 w-3.5 text-emerald-600/70 dark:text-primary/70 shrink-0" />
            <span className="font-label">Thắng/Thua: <strong className="text-gray-700 dark:text-gray-200">{member.wins || 0}W - {member.losses || 0}L</strong></span>
          </div>
        )}
      </div>

      {/* Bottom: Action */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-border-dark/40 flex items-center justify-end">
        <button
          onClick={() => onViewProfile?.(member)}
          className="text-xs font-bold text-emerald-600 dark:text-primary hover:text-emerald-800 dark:hover:text-primary-dark transition-all duration-200 font-label cursor-pointer flex items-center gap-0.5 hover:gap-1"
        >
          Hồ sơ
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
