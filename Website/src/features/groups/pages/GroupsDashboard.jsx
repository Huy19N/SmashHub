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
import { useTeams, useDeleteGroup, useRemoveMember } from '../hooks/useGroups';
import CreateGroupModal from './CreateGroupModal';
import EditGroupModal from './EditGroupModal';
import TeamCard from '../components/TeamCard';
import Sidebar from '../../../components/layout/Sidebar';
import SportyWatermarks from '../../../components/ui/SportyWatermarks';
import Button from '../../../components/ui/Button';
import toast from 'react-hot-toast';

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [deletingTeam, setDeletingTeam] = useState(null);

  const { deleteGroup, isLoading: isDeleting } = useDeleteGroup();
  const { removeMember, isLoading: isRemoving } = useRemoveMember();

  const handleManageTeam = (teamId) => {
    navigate(`/groups/${teamId}/manage`);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTeam) return;
    try {
      await deleteGroup(deletingTeam.teamId);
      toast.success('Xóa nhóm thành công');
      setDeletingTeam(null);
      refetchTeams();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleLeaveTeam = async (team) => {
    if (window.confirm(`Bạn có chắc chắn muốn rời nhóm "${team.teamName}" không?`)) {
      try {
        const currentUserId = localStorage.getItem('userId');
        await removeMember(team.teamId || team.id, currentUserId);
        toast.success('Đã rời nhóm thành công');
        refetchTeams();
      } catch (err) {
        console.error('Leave failed:', err);
      }
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
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans relative overflow-hidden">
        <SportyWatermarks />
        {/* ── Left Sidebar ── */}
        <Sidebar onCreateGroup={() => setShowCreateModal(true)} activeMenu="teams" />

        {/* ── Right Content Area ── */}
        <main className="flex-1 overflow-y-auto h-screen p-6 lg:p-10 flex flex-col justify-between animate-page">
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

              <Button
                onClick={() => setShowCreateModal(true)}
                variant="primary"
                className="py-2.5 px-5 text-sm"
              >
                <Plus className="h-4 w-4" />
                Tạo Nhóm
              </Button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 dark:border-border-dark/60 gap-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-5 py-3 text-sm font-bold transition-all duration-200 border-b-2 font-label cursor-pointer active:scale-95 hover:scale-[1.02] ${activeTab === 'all'
                  ? 'text-emerald-700 border-emerald-600 dark:text-primary dark:border-primary bg-emerald-500/5 dark:bg-primary/5 rounded-t-xl'
                  : 'text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-white'
                  }`}
              >
                Tất cả nhóm
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`px-5 py-3 text-sm font-bold transition-all duration-200 border-b-2 font-label cursor-pointer active:scale-95 hover:scale-[1.02] ${activeTab === 'active'
                  ? 'text-emerald-700 border-emerald-600 dark:text-primary dark:border-primary bg-emerald-500/5 dark:bg-primary/5 rounded-t-xl'
                  : 'text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-white'
                  }`}
              >
                Đang hoạt động
              </button>
            </div>

            {/* Teams Grid */}
            <div key={activeTab} className="animate-tab-panel">
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
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      variant="primary"
                      className="w-full sm:w-auto py-2.5 px-5 text-sm"
                    >
                      <Plus className="h-4 w-4" /> Tạo nhóm mới
                    </Button>
                    {/* <Button
                      onClick={() => console.log('Navigate to search')}
                      variant="secondary"
                      className="w-full sm:w-auto py-2.5 px-5 text-sm"
                    >
                      <Search className="h-4 w-4" /> Tìm & Tham gia nhóm
                    </Button> */}
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
                      onLeave={handleLeaveTeam}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200/60 dark:border-border-dark/40 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 font-label">
            <span>© {new Date().getFullYear()} SmashHub. Mọi quyền được bảo lưu.</span>
            <div className="flex gap-4">
              <span className="hover:text-emerald-600 dark:hover:text-primary cursor-pointer transition-colors">Bảo mật</span>
              <span className="hover:text-emerald-600 dark:hover:text-primary cursor-pointer transition-colors">Điều khoản</span>
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
              <Button
                onClick={() => setDeletingTeam(null)}
                variant="secondary"
                className="flex-1 py-2.5 text-sm"
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleConfirmDelete}
                isLoading={isDeleting}
                className="flex-1 py-2.5 text-sm bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 border-none shadow-none"
              >
                Xóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
