import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Users,
  MessageSquare,
  Swords,
  AlertTriangle,
  CalendarDays,
  DollarSign,
  UserCircle,
  Settings,
  Flame,
  Moon,
  Sun,
  LayoutDashboard,
  X,
  Mail,
  Phone,
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTeamDetail, useTeamMembers, useRemoveMember, useCreateInvite } from '../hooks/useGroups';
import MemberCard from '../components/MemberCard';
import TeamChat from '../components/TeamChat';
import Sidebar from '../../../components/layout/Sidebar';
import { getUserIdAPI } from '../../Auth/api/auth.api.js';

const filterProfileData = (obj) => {
  if (!obj || typeof obj !== 'object') return [];

  const result = [];

  const cleanKey = (key) => {
    const translations = {
      fullName: 'Họ và tên',
      email: 'Email',
      phoneNumber: 'Số điện thoại',
      roleName: 'Vai trò',
      role: 'Vai trò',
      status: 'Trạng thái',
      isActive: 'Trạng thái hoạt động',
      createdAt: 'Ngày tạo tài khoản',
      joinedAt: 'Ngày tham gia',
      wins: 'Số trận thắng',
      losses: 'Số trận thua',
      sportName: 'Môn thể thao',
      levelName: 'Trình độ',
      position: 'Vị trí thi đấu',
      yearsOfExperience: 'Năm kinh nghiệm',
      experience: 'Kinh nghiệm',
      bio: 'Giới thiệu bản thân',
      description: 'Mô tả',
      gender: 'Giới tính',
      dob: 'Ngày sinh',
      dateOfBirth: 'Ngày sinh',
      address: 'Địa chỉ',
    };
    return translations[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const traverse = (item, parentKey = '') => {
    if (!item) return;

    Object.entries(item).forEach(([key, val]) => {
      const lowerKey = key.toLowerCase();
      // Skip ID fields
      if (lowerKey === 'id' || lowerKey.endsWith('id') || lowerKey.includes('id_') || lowerKey.includes('_id')) {
        return;
      }

      if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        traverse(val, key);
      } else if (Array.isArray(val)) {
        val.forEach((subItem, index) => {
          if (typeof subItem === 'object') {
            traverse(subItem, `${cleanKey(key)} #${index + 1}`);
          } else {
            result.push({
              key: `${cleanKey(key)} #${index + 1}`,
              value: String(subItem),
              group: parentKey ? cleanKey(parentKey) : ''
            });
          }
        });
      } else {
        let displayVal = val;
        if (typeof val === 'boolean') {
          displayVal = val ? 'Đang hoạt động' : 'Không hoạt động';
        } else if (key.toLowerCase().includes('date') || key.toLowerCase().includes('created') || key.toLowerCase().includes('joined')) {
          try {
            displayVal = new Date(val).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          } catch {
            displayVal = String(val);
          }
        }

        if (val !== null && val !== undefined && val !== '') {
          result.push({
            key: cleanKey(key),
            value: String(displayVal),
            group: parentKey ? cleanKey(parentKey) : ''
          });
        }
      }
    });
  };

  traverse(obj);
  return result;
};

/**
 * TeamManagementPage
 * Detailed member management view for a specific team.
 * Includes the same left sidebar as GroupsDashboard for consistent navigation.
 */
export default function TeamManagementPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  const { team, isLoading: teamLoading } = useTeamDetail(teamId);
  const { members, isLoading: membersLoading, refetch: refetchMembers } = useTeamMembers(teamId);
  const { removeMember, isLoading: isRemoving } = useRemoveMember();
  const { createInvite } = useCreateInvite();

  const [activeTab, setActiveTab] = useState('members');
  const [removingMember, setRemovingMember] = useState(null);
  const [showInviteSuccess, setShowInviteSuccess] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [viewingProfileMember, setViewingProfileMember] = useState(null);
  const [profileDetails, setProfileDetails] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const handleViewProfile = async (member) => {
    setViewingProfileMember(member);
    setProfileDetails(null);
    setProfileLoading(true);
    setProfileError(null);
    try {
      const res = await getUserIdAPI(member.userId);
      let data = res?.data ?? res;

      // Combine API user details with sport data from the team members API
      if (member.sportName || member.sport || member.levelName || member.level || member.wins !== undefined) {
        data = {
          ...data,
          sportProfiles: [{
            sportName: member.sportName || member.sport || 'Chưa cập nhật',
            levelName: member.levelName || member.level || 'Chưa cập nhật',
            wins: member.wins || 0,
            losses: member.losses || 0,
          }]
        };
      }

      setProfileDetails(data);
    } catch (err) {
      setProfileError(err.message || 'Không thể tải thông tin hồ sơ.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!removingMember) return;
    try {
      await removeMember(teamId, removingMember.userId);
      setRemovingMember(null);
      refetchMembers();
    } catch (err) {
      console.error('Remove failed:', err);
    }
  };

  const handleAddMember = async () => {
    try {
      const data = await createInvite(teamId, { maxUses: 20, expirationHours: 168 });
      const token = data?.inviteToken;
      if (token) {
        const link = `${window.location.origin}/groups/invite/${token}`;
        setInviteLink(link);
        setShowInviteSuccess(true);
        try { await navigator.clipboard.writeText(link); } catch { /* ignore */ }
      }
    } catch (err) {
      console.error('Create invite failed:', err);
    }
  };

  const contentTabs = [
    { id: 'members', label: 'Tất cả thành viên' },
    { id: 'chat', label: 'Trò chuyện' },
    { id: 'matchmaking', label: 'Bắt kèo' },
  ];

  // Loading
  if ((teamLoading || membersLoading) && members.length === 0) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0b0f19] ${isDarkMode ? 'dark' : ''}`}>
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full border-2 border-gray-200 dark:border-border-dark border-t-emerald-500 dark:border-t-primary animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 font-label">Đang tải thông tin nhóm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">

        {/* ── Left Sidebar ── */}
        <Sidebar onCreateGroup={() => navigate('/groups')} activeMenu="teams" />

        {/* ── Right Content Area ── */}
        <main className="flex-1 overflow-y-auto h-screen p-6 lg:p-10 flex flex-col justify-between">
          <div className="space-y-8">

            {/* Back Link to Groups list */}
            <button
              onClick={() => navigate('/groups')}
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-primary hover:text-emerald-800 dark:hover:text-primary-dark transition-colors font-label cursor-pointer group/back"
            >
              <ArrowLeft className="h-4 w-4 group-hover/back:-translate-x-0.5 transition-transform" />
              Quay về trang tổng các nhóm
            </button>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/60 dark:border-border-dark/40 pb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
                  Quản lý Thành viên
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-label">
                  Quản lý danh sách và trình độ của các thành viên trong {team?.teamName || 'câu lạc bộ'}.
                </p>
              </div>

              <button
                onClick={handleAddMember}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 dark:bg-primary dark:hover:bg-primary-dark text-white dark:text-[#052e14] transition-all duration-200 shadow-md shadow-emerald-500/10 dark:shadow-primary/10 hover:-translate-y-0.5 font-label cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" />
                Thêm thành viên
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-border-dark/60">
              {contentTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 text-sm font-bold transition-all border-b-2 font-label cursor-pointer ${activeTab === tab.id
                    ? 'text-emerald-700 border-emerald-600 dark:text-primary dark:border-primary'
                    : 'text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-white'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'members' && (
              <>
                {members.length === 0 ? (
                  <div className="text-center py-20 bg-white dark:bg-card-dark/10 rounded-2xl border border-gray-200/80 dark:border-border-dark/60 p-8 space-y-4 max-w-lg mx-auto">
                    <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto" />
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white font-display">Chưa có thành viên nào</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-label">
                        Hãy mời bạn bè tham gia nhóm của bạn.
                      </p>
                    </div>
                    <button
                      onClick={handleAddMember}
                      className="mt-4 px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-primary dark:hover:bg-primary-dark dark:text-[#052e14] transition-all font-label cursor-pointer inline-flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" /> Thêm thành viên
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {members.map((m) => (
                      <MemberCard
                        key={m.userId}
                        member={m}
                        onRemove={(member) => setRemovingMember(member)}
                        onViewProfile={(member) => handleViewProfile(member)}
                      />
                    ))}

                    {/* Add Member Card */}
                    <button
                      onClick={handleAddMember}
                      className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-border-dark/60 bg-white/50 dark:bg-card-dark/10 hover:border-emerald-500/40 dark:hover:border-primary/30 hover:bg-emerald-50/30 dark:hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] cursor-pointer group/add"
                    >
                      <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover/add:bg-emerald-100 dark:group-hover/add:bg-primary/10 transition-colors">
                        <Plus className="h-5 w-5 text-gray-400 group-hover/add:text-emerald-600 dark:group-hover/add:text-primary transition-colors" />
                      </div>
                      <span className="mt-3 text-sm font-semibold text-gray-400 group-hover/add:text-emerald-600 dark:group-hover/add:text-primary transition-colors font-label">
                        Thêm thành viên mới
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === 'chat' && (
              <div className="animate-fade-in">
                <TeamChat teamId={teamId} teamName={team.teamName} memberCount={members?.length || team.members?.length || 0} />
              </div>
            )}

            {activeTab === 'matchmaking' && (
              <div className="text-center py-20 bg-white dark:bg-card-dark/10 rounded-2xl border border-gray-200/80 dark:border-border-dark/60 p-8 space-y-4 max-w-lg mx-auto">
                <Swords className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white font-display">Tính năng đang phát triển</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-label">
                  Bắt kèo sẽ sớm được ra mắt.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200/60 dark:border-border-dark/40 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 font-label">
            <span>© {new Date().getFullYear()} SmashClub. Mọi quyền được bảo lưu.</span>
            <div className="flex gap-4">
              <span className="hover:text-emerald-600 dark:hover:text-primary cursor-pointer transition-colors">Bảo mật</span>
              <span className="hover:text-emerald-600 dark:hover:text-primary cursor-pointer transition-colors">Điều khoản</span>
            </div>
          </div>
        </main>
      </div>

      {/* Remove Member Confirmation */}
      {removingMember && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDarkMode ? 'dark' : ''}`}>
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setRemovingMember(null)} />
          <div className="relative w-full max-w-sm animate-fade-in bg-white dark:bg-[#0d1117] rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-border-dark p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">Xóa Thành Viên?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-label">
              Bạn có chắc chắn muốn xóa <strong>{removingMember.fullName}</strong> khỏi nhóm? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setRemovingMember(null)}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 transition-colors font-label cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleRemoveMember}
                disabled={isRemoving}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 transition-colors font-label cursor-pointer flex items-center justify-center"
              >
                {isRemoving ? (
                  <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  'Xóa'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Link Success */}
      {showInviteSuccess && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDarkMode ? 'dark' : ''}`}>
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setShowInviteSuccess(false)} />
          <div className="relative w-full max-w-sm animate-fade-in bg-white dark:bg-[#0d1117] rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-border-dark p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-emerald-100 dark:bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-emerald-600 dark:text-primary" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">Link mời đã được tạo!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-label">
              Link đã được copy vào clipboard. Gửi cho bạn bè để mời tham gia nhóm.
            </p>
            <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 border border-gray-200 dark:border-border-dark">
              <p className="text-xs text-gray-600 dark:text-gray-300 font-mono break-all">{inviteLink}</p>
            </div>
            <button
              onClick={() => setShowInviteSuccess(false)}
              className="w-full px-4 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-primary dark:hover:bg-primary-dark dark:text-[#052e14] transition-colors font-label cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Viewing Profile Modal */}
      {viewingProfileMember && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDarkMode ? 'dark' : ''}`}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-300" onClick={() => setViewingProfileMember(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0d1117] rounded-3xl shadow-2xl border border-gray-200/80 dark:border-border-dark overflow-hidden animate-scale-up max-h-[85vh] flex flex-col z-10 transition-colors duration-300">

            {/* Modal Header */}
            <div className="relative px-6 py-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-primary/10 dark:to-primary/5 border-b border-gray-150 dark:border-border-dark/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 dark:bg-primary/20 flex items-center justify-center border border-emerald-500/20 dark:border-primary/30">
                  <UserCircle className="w-6 h-6 text-emerald-600 dark:text-primary animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">
                    Hồ Sơ Thành Viên
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-label">
                    Thông tin chi tiết của vận động viên
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingProfileMember(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-105 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Profile Card Header */}
              <div className="flex items-center gap-4 bg-gray-50/50 dark:bg-white/5 p-4 rounded-2xl border border-gray-150 dark:border-white/10 shrink-0">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 dark:from-primary dark:to-emerald-500 flex items-center justify-center text-white font-bold text-2xl shadow-md font-display select-none">
                  {viewingProfileMember.fullName?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xl font-extrabold text-gray-900 dark:text-white truncate font-display leading-tight">
                    {viewingProfileMember.fullName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider font-label ${viewingProfileMember.roleName === 'Leader'
                      ? 'bg-amber-105 text-amber-705 border-amber-205 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                      : 'bg-emerald-55 text-emerald-75 border-emerald-25 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                      }`}>
                      {viewingProfileMember.roleName === 'Leader' ? 'Admin' : 'Thành viên'}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-label">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-label">
                      Tham gia: {new Date(viewingProfileMember.joinedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* API Fetching States */}
              {profileLoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <div className="h-10 w-10 rounded-full border-2 border-gray-200 dark:border-border-dark border-t-emerald-500 dark:border-t-primary animate-spin" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-label animate-pulse">
                    Đang đồng bộ hồ sơ từ máy chủ...
                  </p>
                </div>
              ) : profileError ? (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20 flex gap-3 text-red-700 dark:text-red-400">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold font-display">Lỗi tải dữ liệu</p>
                    <p className="text-xs font-label opacity-90">{profileError}</p>
                  </div>
                </div>
              ) : profileDetails ? (
                <div className="space-y-6">
                  {profileDetails && (() => {
                    const fields = filterProfileData(profileDetails);
                    const ungrouped = fields.filter(f => !f.group);
                    const groupedMap = fields.reduce((acc, f) => {
                      if (f.group) {
                        if (!acc[f.group]) acc[f.group] = [];
                        acc[f.group].push(f);
                      }
                      return acc;
                    }, {});

                    return (
                      <>
                        {/* Information Grid */}
                        {ungrouped.length > 0 && (
                          <div className="space-y-3 animate-fade-in">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-primary font-label flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-primary" />
                              Thông tin tài khoản
                            </h4>
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-150 dark:border-white/10 shadow-inner">
                              {ungrouped.map((f, i) => (
                                <div key={i} className="space-y-1">
                                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold font-label uppercase tracking-wide">
                                    {f.key}
                                  </span>
                                  <p className="text-sm text-gray-900 dark:text-white font-bold font-label break-words leading-tight">
                                    {f.value}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Sport/Custom Profiles Sections */}
                        {Object.entries(groupedMap).map(([groupName, groupFields], i) => (
                          <div key={i} className="space-y-3 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-primary font-label flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-primary" />
                              {groupName}
                            </h4>
                            <div className="grid grid-cols-2 gap-4 bg-emerald-50/20 dark:bg-primary/5 rounded-2xl p-4 border border-emerald-100/30 dark:border-primary/10 shadow-inner">
                              {groupFields.map((f, j) => (
                                <div key={j} className="space-y-1">
                                  <span className="text-[10px] text-emerald-800/60 dark:text-primary/60 font-semibold font-label uppercase tracking-wide">
                                    {f.key}
                                  </span>
                                  <p className="text-sm text-gray-900 dark:text-white font-bold font-label break-words leading-tight">
                                    {f.value}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* Fallback if no details are returned except IDs */}
                        {fields.length === 0 && (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm font-label">
                            Không có thông tin bổ sung nào được cấu hình công khai.
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              ) : null}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-[#0c0f17] border-t border-gray-150 dark:border-border-dark/60 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-label">
                Hệ cơ sở dữ liệu SmashClub
              </span>
              <button
                onClick={() => setViewingProfileMember(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 dark:bg-primary dark:hover:bg-primary-dark text-white dark:text-[#052e14] transition-all duration-200 cursor-pointer hover:shadow-md"
              >
                Đóng hồ sơ
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
