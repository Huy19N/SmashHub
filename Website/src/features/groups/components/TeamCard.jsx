import { useState, useRef, useEffect } from 'react';
import { Users, FileText, ChevronRight, MoreVertical, Calendar, Edit2, Trash2 } from 'lucide-react';

export default function TeamCard({ team, onManage, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const formatDate = (iso) => {
    if (!iso) return 'Chưa xác định';
    return new Date(iso).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const badge = team.isActive
    ? { label: 'Đang hoạt động', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' }
    : { label: 'Ngừng hoạt động', classes: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20' };

  return (
    <div className="rounded-2xl border border-gray-200/80 dark:border-border-dark/60 bg-white dark:bg-card-dark/30 shadow-sm dark:shadow-none hover:border-emerald-500/40 dark:hover:border-primary/20 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/5 transition-all duration-300 flex flex-col justify-between h-[230px] p-5 group">
      {/* Top section: Badge and Action Menu */}
      <div className="flex items-center justify-between">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.classes} font-label`}>
          {badge.label}
        </span>
        <div className="relative" ref={menuRef}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            <MoreVertical className="h-4.5 w-4.5" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#1a202c] border border-gray-200 dark:border-border-dark rounded-xl shadow-lg overflow-hidden z-10 animate-fade-in">
              <button 
                onClick={(e) => { 
                  e.stopPropagation();
                  setShowMenu(false); 
                  onEdit && onEdit(team); 
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5 transition-colors font-label cursor-pointer text-left"
              >
                <Edit2 className="h-4 w-4" /> Chỉnh sửa
              </button>
              <button 
                onClick={(e) => { 
                  e.stopPropagation();
                  setShowMenu(false); 
                  onDelete && onDelete(team); 
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors font-label cursor-pointer text-left border-t border-gray-100 dark:border-border-dark"
              >
                <Trash2 className="h-4 w-4" /> Xóa nhóm
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Middle section: Title and Description */}
      <div className="space-y-2 mt-2">
        <h3 className="text-base font-bold text-gray-900 dark:text-white truncate font-display group-hover:text-emerald-700 dark:group-hover:text-primary transition-colors duration-200">
          {team.teamName}
        </h3>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <FileText className="h-4 w-4 text-emerald-600/70 dark:text-primary/70 shrink-0" />
            <span className="font-label truncate" title={team.description}>
              {team.description || 'Chưa có mô tả'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4 text-emerald-600/70 dark:text-primary/70 shrink-0" />
            <span className="font-label truncate">
              Ngày tạo: {formatDate(team.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom section: Member Count and Action */}
      <div className="space-y-3 mt-3">
        <div className="w-full h-px bg-gray-100 dark:bg-border-dark/40" />

        {/* Card Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-label text-sm">
            <Users className="h-4.5 w-4.5 text-emerald-600 dark:text-primary" />
            <span className="font-semibold">{team.memberCount} thành viên</span>
          </div>

          <button
            onClick={() => onManage && onManage(team.teamId)}
            className="text-xs font-bold text-emerald-600 dark:text-primary hover:text-emerald-800 dark:hover:text-primary-dark transition-all duration-200 font-label cursor-pointer flex items-center gap-0.5 hover:gap-1"
          >
            Quản lý
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
