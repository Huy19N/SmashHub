import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  CalendarDays,
  DollarSign,
  UserCircle,
  Settings,
  Plus,
  Flame,
  Moon,
  Sun,
  Users,
  Search,
  LayoutDashboard,
  AlertTriangle
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTeams, useDeleteGroup } from '../hooks/useGroups';
import CreateGroupModal from './CreateGroupModal';
import EditGroupModal from './EditGroupModal';
import TeamCard from '../components/TeamCard';

/**
 * GroupsDashboard
 * Premium full-screen admin portal for group and team management.
 * Designed with a stunning light-mode-first aesthetic, complete with dark mode toggle.
 */
export default function GroupsDashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  // API Call to fetch teams
  const { teams, isLoading: teamsLoading, refetch: refetchTeams } = useTeams();

  const [activeTab, setActiveTab] = useState('all');
  const [sidebarNav, setSidebarNav] = useState('teams');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [deletingTeam, setDeletingTeam] = useState(null);

  const { deleteGroup, isLoading: isDeleting } = useDeleteGroup();

  const sidebarItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard, action: () => navigate('/dashboard') },
    { id: 'teams', label: 'Quản lý Nhóm', icon: Users },
    { id: 'sessions', label: 'Lịch chơi', icon: CalendarDays },
    { id: 'finance', label: 'Tài chính', icon: DollarSign },
    { id: 'profile', label: 'Cá nhân', icon: UserCircle },
  ];

  const handleManageTeam = (teamId) => {
    // Navigate to a specific team's detail page or handle state change
    console.log(`Managing team ${teamId}`);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTeam) return;
    try {
      await deleteGroup(deletingTeam.teamId);
      setDeletingTeam(null);
      refetchTeams();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // ─── Loading State ──────────────────────────────────────────
  if (teamsLoading && (!teams || teams.length === 0)) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0b0f19] ${isDarkMode ? 'dark' : ''}`}>
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full border-2 border-gray-200 dark:border-border-dark border-t-emerald-500 dark:border-t-primary animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 font-label">Đang tải danh sách nhóm...</p>
        </div>
      </div>
    );
  }

  const activeTeams = teams?.filter(t => t.isActive) || [];
  const displayTeams = activeTab === 'all' ? teams : activeTeams;

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">

        {/* ── Left Sidebar ── */}
        <aside className="w-64 bg-white dark:bg-[#0d1117]/90 border-r border-gray-200 dark:border-border-dark flex flex-col justify-between h-screen sticky top-0 shrink-0 transition-colors duration-300">
          <div className="flex flex-col">
            {/* Back to Home Navigation Element */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-5 py-4 text-xs font-bold text-emerald-700 dark:text-primary hover:text-emerald-800 dark:hover:text-primary-dark border-b border-gray-100 dark:border-border-dark/40 transition-colors font-label cursor-pointer text-left w-full"
            >
              <span>← Quay về Trang chủ</span>
            </button>

            {/* Club/Group Profile Section */}
            <div className="p-5 border-b border-gray-200 dark:border-border-dark/60">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 dark:bg-primary/10 border border-emerald-500/20 dark:border-primary/20 flex items-center justify-center shrink-0 shadow-sm">
                  <Flame className="h-5 w-5 text-emerald-600 dark:text-primary animate-pulse" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-gray-900 dark:text-white font-extrabold text-sm truncate font-display">
                    SmashClub
                  </h3>
                  <p className="text-[10px] text-emerald-700 dark:text-primary/70 font-bold uppercase tracking-wider font-label">
                    Quản lý Nhóm
                  </p>
                </div>
              </div>
            </div>

            {/* "+ New Session/Team" Button */}
            <div className="px-4 py-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 dark:bg-primary dark:hover:bg-primary-dark text-white dark:text-[#052e14] transition-all duration-200 shadow-md shadow-emerald-500/10 dark:shadow-primary/10 hover:-translate-y-0.5 font-label cursor-pointer"
              >
                <Plus className="h-4.5 w-4.5" />
                Tạo Nhóm Mới
              </button>
            </div>

            {/* Navigation Menu */}
            <nav className="px-3 space-y-1 mt-1">
              {sidebarItems.map((item) => {
                const isActive = sidebarNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.action) item.action();
                      else setSidebarNav(item.id);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 font-label cursor-pointer ${isActive
                      ? 'text-emerald-800 bg-emerald-50/70 border-l-4 border-emerald-600 dark:text-primary dark:bg-primary/5 dark:border-emerald-500'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                      }`}
                  >
                    <item.icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-emerald-600 dark:text-primary' : 'text-gray-400 dark:text-gray-500'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Theme & Settings Section at Bottom */}
          <div className="p-4 border-t border-gray-200 dark:border-border-dark/60 space-y-1 bg-gray-50/50 dark:bg-transparent">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white transition-all font-label cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {isDarkMode ? <Moon className="h-4 w-4 text-emerald-500" /> : <Sun className="h-4 w-4 text-amber-500" />}
                Theme
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200/60 dark:bg-white/10 text-gray-600 dark:text-gray-400">
                {isDarkMode ? 'Dark' : 'Light'}
              </span>
            </button>

            <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white transition-all font-label cursor-pointer">
              <Settings className="h-4 w-4 text-gray-400" />
              Cài đặt
            </button>
          </div>
        </aside>

        {/* ── Right Content Area ── */}
        <main className="flex-1 overflow-y-auto h-screen p-6 lg:p-10 flex flex-col justify-between">
          <div className="space-y-8">

            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/60 dark:border-border-dark/40 pb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
                  Quản lý Nhóm
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-label">
                  Quản lý các nhóm bạn tham gia và tạo nhóm mới.
                </p>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 dark:bg-primary dark:hover:bg-primary-dark text-white dark:text-[#052e14] transition-all duration-200 shadow-md shadow-emerald-500/10 dark:shadow-primary/10 hover:-translate-y-0.5 font-label cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Tạo Nhóm
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 dark:border-border-dark/60">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-5 py-3 text-sm font-bold transition-all border-b-2 font-label cursor-pointer ${activeTab === 'all'
                  ? 'text-emerald-700 border-emerald-600 dark:text-primary dark:border-primary'
                  : 'text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-white'
                  }`}
              >
                Tất cả nhóm
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`px-5 py-3 text-sm font-bold transition-all border-b-2 font-label cursor-pointer ${activeTab === 'active'
                  ? 'text-emerald-700 border-emerald-600 dark:text-primary dark:border-primary'
                  : 'text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-white'
                  }`}
              >
                Đang hoạt động
              </button>
            </div>

            {/* Teams Grid */}
            {!teams || teams.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-card-dark/10 rounded-2xl border border-gray-200/80 dark:border-border-dark/60 p-8 space-y-4 max-w-lg mx-auto">
                <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white font-display">Bạn chưa tham gia nhóm nào</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-label">
                    Bạn có thể tự tạo một nhóm mới hoặc tìm kiếm các nhóm có sẵn để tham gia.
                  </p>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-primary dark:hover:bg-primary-dark dark:text-[#052e14] transition-all font-label cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Tạo nhóm mới
                  </button>
                  <button
                    onClick={() => console.log('Navigate to search')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 dark:bg-transparent dark:border-border-dark dark:text-gray-300 dark:hover:bg-white/5 transition-all font-label cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <Search className="h-4 w-4" /> Tìm & Tham gia nhóm
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayTeams.map((team) => (
                  <TeamCard
                    key={team.teamId}
                    team={team}
                    onManage={handleManageTeam}
                    onEdit={(t) => setEditingTeam(t)}
                    onDelete={(t) => setDeletingTeam(t)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Main Content Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200/60 dark:border-border-dark/40 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 font-label">
            <span>© {new Date().getFullYear()} SmashClub. All rights reserved.</span>
            <div className="flex gap-4">
              <span className="hover:text-emerald-600 dark:hover:text-primary cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-emerald-600 dark:hover:text-primary cursor-pointer transition-colors">Terms</span>
            </div>
          </div>
        </main>
      </div>

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            refetchTeams();
          }}
        />
      )}

      {/* Edit Group Modal */}
      {editingTeam && (
        <EditGroupModal
          team={editingTeam}
          onClose={() => setEditingTeam(null)}
          onUpdated={() => {
            setEditingTeam(null);
            refetchTeams();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingTeam && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDarkMode ? 'dark' : ''}`}>
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setDeletingTeam(null)} />
          <div className="relative w-full max-w-sm animate-fade-in bg-white dark:bg-[#0d1117] rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-border-dark p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">Xóa Nhóm Này?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-label">
              Bạn có chắc chắn muốn xóa nhóm <strong>{deletingTeam.teamName}</strong>? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setDeletingTeam(null)}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 transition-colors font-label cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 transition-colors font-label cursor-pointer flex items-center justify-center"
              >
                {isDeleting ? (
                  <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  'Xóa'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
