import { useState, useCallback, useEffect } from 'react';
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
  Trophy,
  Activity,
  Dumbbell,
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTeamDetail, useTeamMembers, useRemoveMember, useCreateInvite, useTeamSchedules, useDeleteSchedule, useAddScheduleParticipant, useRemoveScheduleParticipant, useUpdateTeamMember, useDeleteGroup } from '../hooks/useGroups';
import { getScheduleParticipantsAPI } from '../api/groups.api.js';
import { getActiveChallengesAPI, getTeamChallengesAPI } from '../api/matchmaking.api.js';
import { useMatchmaking } from '../hooks/useMatchmaking';
import toast from 'react-hot-toast';
import MemberCard from '../components/MemberCard';
import TeamChat from '../components/TeamChat';
import SessionCard from '../components/SessionCard';
import CreateScheduleModal from '../components/CreateScheduleModal';
import ParticipantsModal from '../components/ParticipantsModal';
import MatchRequestsModal from '../components/MatchRequestsModal';
import CreateChallengeModal from '../components/CreateChallengeModal';
import Sidebar from '../../../components/layout/Sidebar';
import SportyWatermarks from '../../../components/ui/SportyWatermarks';
import { getUserIdAPI } from '../../Auth/api/auth.api.js';
import MediaImage from '../../../components/ui/MediaImage';
import Button from '../../../components/ui/Button';

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
  const { schedules, isLoading: schedulesLoading, refetch: refetchSchedules } = useTeamSchedules(teamId);
  const { removeMember, isLoading: isRemoving } = useRemoveMember();
  const { deleteGroup, isLoading: isDeletingGroup } = useDeleteGroup();
  const { updateMember, isLoading: isUpdatingMember } = useUpdateTeamMember();
  const { deleteSchedule, isLoading: isDeletingSchedule } = useDeleteSchedule();
  const { addParticipant } = useAddScheduleParticipant();
  const { removeParticipant } = useRemoveScheduleParticipant();
  const { createInvite } = useCreateInvite();
  const { createChallenge, challenges, fetchActiveChallenges } = useMatchmaking();

  const [activeTab, setActiveTab] = useState('members');
  const [removingMember, setRemovingMember] = useState(null);
  const [showInviteSuccess, setShowInviteSuccess] = useState(false);
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);
  const [scheduleModalKey, setScheduleModalKey] = useState(0);
  const [deletingScheduleId, setDeletingScheduleId] = useState(null);
  const [votingScheduleId, setVotingScheduleId] = useState(null);
  const [joinedScheduleIds, setJoinedScheduleIds] = useState(new Set());
  const [manageSchedule, setManageSchedule] = useState(null); // full schedule object
  const [inviteLink, setInviteLink] = useState('');
  const [viewingProfileMember, setViewingProfileMember] = useState(null);
  const [profileDetails, setProfileDetails] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [viewingChallengeId, setViewingChallengeId] = useState(null);
  const [createChallengeConfig, setCreateChallengeConfig] = useState(null);
  const [teamChallenges, setTeamChallenges] = useState([]);
  const [challengesLoading, setChallengesLoading] = useState(false);

  // Fetch active challenges when schedule tab is active
  useEffect(() => {
    if (activeTab === 'schedule') {
      fetchActiveChallenges({});
    }
  }, [activeTab, fetchActiveChallenges]);

  // Fetch challenges related to this team
  useEffect(() => {
    if (activeTab === 'challenges' && teamId) {
      const loadTeamChallenges = async () => {
        setChallengesLoading(true);
        try {
          const response = await getTeamChallengesAPI(teamId);
          setTeamChallenges(response?.data || []);
        } catch (err) {
          console.error('Failed to load team challenges:', err);
        } finally {
          setChallengesLoading(false);
        }
      };
      loadTeamChallenges();
    }
  }, [activeTab, teamId]);

  // Load which schedules the current user has joined
  const currentUserId = localStorage.getItem('userId');
  useEffect(() => {
    if (!schedules || schedules.length === 0 || !currentUserId) return;
    let cancelled = false;
    const loadParticipation = async () => {
      const joined = new Set();
      await Promise.allSettled(
        schedules.map(async (s) => {
          try {
            const res = await getScheduleParticipantsAPI(s.scheduleId);
            const data = res?.data ?? res;
            const list = Array.isArray(data) ? data : [];
            if (list.some(p => String(p.userId) === String(currentUserId))) {
              joined.add(s.scheduleId);
            }
          } catch { /* ignore */ }
        })
      );
      if (!cancelled) setJoinedScheduleIds(joined);
    };
    loadParticipation();
    return () => { cancelled = true; };
  }, [schedules, currentUserId]);

  // Vote handlers
  const handleVoteJoin = async (scheduleId) => {
    try {
      setVotingScheduleId(scheduleId);
      await addParticipant(scheduleId);
      setJoinedScheduleIds(prev => new Set(prev).add(scheduleId));
      refetchSchedules();
    } catch (err) {
      toast.error(err || 'Không thể tham gia.');
    } finally {
      setVotingScheduleId(null);
    }
  };

  const handleCreateChallenge = async (config) => {
    try {
      await createChallenge(config);
      toast.success('Đã đăng kèo ghép đấu lên hệ thống thành công!');
      fetchActiveChallenges({ teamId });
      setCreateChallengeConfig(null);
    } catch (err) {
      toast.error('Lỗi tạo kèo: ' + (err.message || 'Unknown'));
    }
  };

  const handleVoteLeave = async (scheduleId) => {
    try {
      setVotingScheduleId(scheduleId);
      await removeParticipant(scheduleId);
      setJoinedScheduleIds(prev => {
        const next = new Set(prev);
        next.delete(scheduleId);
        return next;
      });
      refetchSchedules();
    } catch (err) {
      toast.error(err || 'Không thể hủy tham gia.');
    } finally {
      setVotingScheduleId(null);
    }
  };

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

  const handleDeleteGroup = async () => {
    try {
      await deleteGroup(teamId);
      toast.success('Giải tán nhóm thành công!');
      navigate('/groups');
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await removeMember(teamId, currentUserId);
      toast.success('Rời nhóm thành công!');
      navigate('/groups');
    } catch (err) {
      // Error handled by hook
    }
  };

  const handlePromote = async (member) => {
    if (!window.confirm(`Bạn có chắc chắn muốn chuyển quyền Trưởng Nhóm cho ${member.fullName}? Bạn sẽ trở thành thành viên thường.`)) return;
    try {
      await updateMember(teamId, member.userId, { teamRoleId: 1 });
      toast.success(`Đã chuyển quyền trưởng nhóm cho ${member.fullName}!`);
      // Demote current user
      await updateMember(teamId, currentUserId, { teamRoleId: 2 });
      refetchMembers();
    } catch (err) {
      // Error handled by hook
    }
  };

  const contentTabs = [
    { id: 'members', label: 'Tất cả thành viên' },
    { id: 'chat', label: 'Trò chuyện' },
    { id: 'schedule', label: 'Lịch Chơi' },
    { id: 'challenges', label: 'Kèo' },
  ];

  // Helper: check if current user is Leader
  const isLeader = members.some(m => String(m.userId) === String(currentUserId) && m.roleName === 'Leader');

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
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans relative overflow-hidden">
        <SportyWatermarks />
        {/* ── Left Sidebar ── */}
        <Sidebar onCreateGroup={() => navigate('/groups')} activeMenu="teams" />

        {/* ── Right Content Area ── */}
        <main className="flex-1 overflow-y-auto h-screen p-6 lg:p-10 flex flex-col justify-between animate-page">
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
              <div className="flex items-center gap-4">
                {team?.avatarFileId ? (
                  <img 
                    src={`${import.meta.env.VITE_API_URL}/files/${team.avatarFileId}/stream`} 
                    alt={team.teamName} 
                    className="h-14 w-14 rounded-full object-cover border-2 border-emerald-500 dark:border-primary shrink-0" 
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-primary/20 flex items-center justify-center shrink-0 border-2 border-emerald-500 dark:border-primary/50">
                    <Users className="h-7 w-7 text-emerald-600 dark:text-primary" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
                    {team?.teamName || 'Đang tải...'}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-label">
                    Quản lý danh sách và trình độ của các thành viên trong nhóm.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isLeader ? (
                  <button
                    onClick={() => {
                      if (window.confirm("Bạn có chắc chắn muốn xóa nhóm này không? Toàn bộ dữ liệu sẽ bị mất.")) {
                        handleDeleteGroup();
                      }
                    }}
                    disabled={isDeletingGroup}
                    className="shrink-0 py-2.5 px-5 text-sm font-bold rounded-lg transition-all duration-300 font-label bg-red-500 hover:bg-red-600 text-white shadow-md hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {isDeletingGroup ? 'Đang xóa...' : 'Xóa nhóm'}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (window.confirm("Bạn có chắc chắn muốn rời nhóm này không?")) {
                        handleLeaveGroup();
                      }
                    }}
                    disabled={isRemoving}
                    className="shrink-0 py-2.5 px-5 text-sm font-bold rounded-lg transition-all duration-300 font-label bg-red-500 hover:bg-red-600 text-white shadow-md hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {isRemoving ? 'Đang rời...' : 'Rời nhóm'}
                  </button>
                )}

                {isLeader && (
                  <Button
                    variant="primary"
                    onClick={handleAddMember}
                    className="shrink-0 py-2.5 px-5 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm thành viên
                  </Button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-border-dark/60 gap-1">
              {contentTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 text-sm font-bold transition-all duration-200 border-b-2 font-label cursor-pointer active:scale-95 hover:scale-[1.02] ${activeTab === tab.id
                    ? 'text-emerald-700 border-emerald-600 dark:text-primary dark:border-primary bg-emerald-500/5 dark:bg-primary/5 rounded-t-xl'
                    : 'text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-white'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div key={activeTab} className="animate-tab-panel">
              {activeTab === 'members' && (
                <>
                  {members.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-card-dark/10 rounded-2xl border border-gray-200/80 dark:border-border-dark/60 p-8 space-y-4 max-w-lg mx-auto animate-fade-in">
                      <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto" />
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white font-display">Chưa có thành viên nào</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-label">
                          Hãy mời bạn bè tham gia nhóm của bạn.
                        </p>
                      </div>
                      {isLeader && (
                        <Button
                          variant="primary"
                          onClick={handleAddMember}
                          className="mt-4 py-2.5 px-5 text-sm"
                        >
                          <Plus className="h-4 w-4" /> Thêm thành viên
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {members.map((m) => (
                        <MemberCard
                          key={m.userId}
                          member={m}
                          isLeader={isLeader} // pass isLeader to control button visibility inside MemberCard
                          currentUserId={currentUserId}
                          onRemove={(member) => setRemovingMember(member)}
                          onViewProfile={(member) => handleViewProfile(member)}
                          onPromote={(member) => handlePromote(member)}
                        />
                      ))}

                      {/* Add Member Card */}
                      {isLeader && (
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
                      )}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'chat' && (
                <div className="animate-fade-in">
                  <TeamChat teamId={teamId} teamName={team.teamName} memberCount={members?.length || team.members?.length || 0} />
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="animate-fade-in space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">Lịch trình nhóm</h3>
                      <p className="text-sm text-gray-500 font-label">Xem và tham gia các buổi chơi của nhóm.</p>
                    </div>
                    {isLeader && (
                      <Button
                        variant="primary"
                        onClick={() => {
                          setScheduleModalKey(prev => prev + 1);
                          setShowCreateSchedule(true);
                        }}
                        className="py-2 px-4 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Tạo lịch trình
                      </Button>
                    )}
                  </div>

                  {schedulesLoading ? (
                    <div className="text-center py-20">
                      <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto mb-4" />
                      <p className="text-sm text-gray-500">Đang tải lịch trình...</p>
                    </div>
                  ) : schedules.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-card-dark/10 rounded-2xl border border-gray-200/80 dark:border-border-dark/60 p-8 space-y-4 animate-fade-in">
                      <CalendarDays className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto" />
                      <h3 className="text-base font-bold text-gray-900 dark:text-white font-display">Chưa có lịch trình nào</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-label">
                        {isLeader ? 'Nhấn nút tạo lịch trình ở góc trên để bắt đầu giao lưu.' : 'Đợi trưởng nhóm tạo kèo giao lưu nhé.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
                      {schedules.map(schedule => {
                        const activeChallenge = challenges?.find(c => c.scheduleId === schedule.scheduleId);
                        return (
                          <SessionCard
                            key={schedule.scheduleId}
                            session={schedule}
                            isLeader={isLeader}
                            isDeleting={deletingScheduleId === schedule.scheduleId}
                            hasJoined={joinedScheduleIds.has(schedule.scheduleId)}
                            isVoting={votingScheduleId === schedule.scheduleId}
                            onVoteJoin={handleVoteJoin}
                            onVoteLeave={handleVoteLeave}
                            onCreateChallenge={(schedId, spId) => setCreateChallengeConfig({ scheduleId: schedId, sportId: spId || team?.sportId || 1, hostTeamId: teamId })}
                            activeChallengeId={activeChallenge?.challengeId}
                            onViewMatchRequests={(cid) => setViewingChallengeId(cid)}
                            onDelete={async () => {
                              if (!window.confirm('Bạn có chắc muốn xóa lịch trình này?')) return;
                              try {
                                setDeletingScheduleId(schedule.scheduleId);
                                await deleteSchedule(schedule.scheduleId);
                                refetchSchedules();
                              } catch (err) {
                                toast.error(err || 'Không thể xóa lịch trình.');
                              } finally {
                                setDeletingScheduleId(null);
                              }
                            }}
                            onManage={() => setManageSchedule(schedule)}
                          />
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'challenges' && (
                <div className="animate-fade-in space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">Kèo ghép đấu</h3>
                      <p className="text-sm text-gray-500 font-label">Xem danh sách kèo của nhóm bạn đã tạo.</p>
                    </div>
                  </div>

                  {challengesLoading ? (
                    <div className="text-center py-20">
                      <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto mb-4" />
                      <p className="text-sm text-gray-500">Đang tải danh sách kèo...</p>
                    </div>
                  ) : teamChallenges.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-card-dark/10 rounded-2xl border border-gray-200/80 dark:border-border-dark/60 p-8 space-y-4 animate-fade-in">
                      <Swords className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto" />
                      <h3 className="text-base font-bold text-gray-900 dark:text-white font-display">Chưa có kèo nào</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-label">
                        Nhóm chưa tạo kèo nào hoặc tất cả các kèo đã kết thúc.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
                      {teamChallenges.map(c => {
                        const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
                        const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
                        const statusColors = {
                          1: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
                          2: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
                          3: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
                          4: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
                        };
                        return (
                          <div key={c.challengeId} className="bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-border-dark p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                  {c.hostTeamName}
                                  {String(c.hostTeamId) === String(teamId) ? (
                                    <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-700">Chủ nhà</span>
                                  ) : (
                                    <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-700">Đội khách</span>
                                  )}
                                  {String(c.hostTeamId) !== String(teamId) && c.challengerStatus && (
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                                      c.challengerStatus === 'Accepted'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                        : c.challengerStatus === 'Rejected'
                                          ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                                          : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                                    }`}>
                                      {c.challengerStatus === 'Accepted' ? 'Đã ghép' : c.challengerStatus === 'Rejected' ? 'Từ chối' : 'Chờ duyệt'}
                                    </span>
                                  )}
                                  {c.priority > 0 && (
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${c.priority === 2 ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'}`}>
                                      {c.priority === 2 ? 'VIP PRO' : 'VIP'}
                                    </span>
                                  )}
                                </h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <span className="text-xs font-bold px-2 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                    {c.sportName || 'Thể thao'}
                                  </span>
                                  <span className={`text-xs font-bold px-2 py-1 rounded border ${statusColors[c.statusId] || statusColors[1]}`}>
                                    {c.statusName || 'Open'}
                                  </span>
                                </div>
                              </div>
                              <Swords className="text-gray-400" size={20}/>
                            </div>
                            
                            <div className="space-y-3 mb-6 bg-gray-50/50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-border-dark/50">
                              <div className="text-sm text-gray-600 dark:text-gray-300 flex flex-col gap-1">
                                <span className="font-bold text-gray-900 dark:text-white">{c.scheduleTitle}</span>
                                <span>📍 Sân: {c.facilityName} - {c.courtName}</span>
                                <span>⏰ T.gian: {formatDateTime(c.startTime)} - {formatDateTime(c.endTime).split(' ')[1]}</span>
                                <span className="flex items-center gap-2">
                                  💰 Phí sân: <strong className="text-emerald-600 dark:text-emerald-400">{formatVND(c.totalCost)}</strong>
                                  {c.isCostSplit && (
                                    <span className="text-[10px] uppercase font-bold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">Chia đôi</span>
                                  )}
                                </span>
                              </div>
                              {c.message && (
                                <div className="text-sm text-gray-500 italic mt-2 border-t border-gray-200 dark:border-border-dark pt-2">
                                  "{c.message}"
                                </div>
                              )}
                            </div>
                            
                            {c.statusId === 1 && isLeader && (
                              <div className="mt-auto">
                                <Button 
                                  variant="outline"
                                  onClick={() => setViewingChallengeId(c.challengeId)} 
                                  className="w-full font-bold py-2 px-4 text-sm"
                                >
                                  Xem yêu cầu ghép
                                </Button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200/60 dark:border-border-dark/40 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 font-label">
            <span>© {new Date().getFullYear()} SmashHub. Mọi quyền được bảo lưu.</span>
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
              <Button
                variant="secondary"
                onClick={() => setRemovingMember(null)}
                className="flex-1 py-2.5 px-4 text-sm"
              >
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                onClick={handleRemoveMember}
                isLoading={isRemoving}
                className="flex-1 py-2.5 px-4 text-sm bg-red-600 hover:bg-red-700 text-white border-none shadow-none"
              >
                Xóa
              </Button>
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
            <Button
              variant="primary"
              onClick={() => setShowInviteSuccess(false)}
              className="w-full py-2.5 px-4 text-sm"
            >
              Đóng
            </Button>
          </div>
        </div>
      )}

      {/* Viewing Profile Modal */}
      {viewingProfileMember && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDarkMode ? 'dark' : ''}`}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300" onClick={() => setViewingProfileMember(null)} />
          
          {/* Modal Container with Sporty double border & shadow */}
          <div className="relative w-full max-w-lg bg-gradient-to-b from-white to-gray-50 dark:from-[#0f141f] dark:to-[#090b10] rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-2 border-emerald-500/80 dark:border-primary/80 overflow-hidden animate-scale-up max-h-[85vh] flex flex-col z-10 transition-colors duration-300">
            
            {/* Watermark Background Symbols */}
            <Trophy className="absolute -top-10 -left-12 w-48 h-48 text-emerald-500/[0.04] dark:text-primary/[0.02] pointer-events-none transform -rotate-12 select-none" />
            <Activity className="absolute bottom-16 -right-16 w-64 h-64 text-emerald-500/[0.04] dark:text-primary/[0.02] pointer-events-none transform rotate-12 select-none" />
            <Swords className="absolute top-1/3 -left-12 w-40 h-40 text-emerald-500/[0.03] dark:text-primary/[0.015] pointer-events-none transform rotate-45 select-none" />
            <Dumbbell className="absolute bottom-1/3 -right-10 w-36 h-36 text-emerald-500/[0.03] dark:text-primary/[0.015] pointer-events-none transform -rotate-12 select-none" />
            <Flame className="absolute top-10 right-10 w-32 h-32 text-orange-500/[0.03] dark:text-orange-500/[0.015] pointer-events-none transform rotate-12 select-none" />

            {/* Modal Header */}
            <div className="relative px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-[#0e1b15] dark:to-[#09110d] border-b border-emerald-500/20 dark:border-primary/20 flex items-center justify-between shrink-0 overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.06)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.06)_50%,rgba(0,0,0,0.06)_75%,transparent_75%,transparent)] bg-[length:12px_12px] opacity-30"></div>
              <div className="relative flex items-center gap-3 z-10">
                <div className="h-10 w-10 rounded-xl bg-white/10 dark:bg-primary/20 flex items-center justify-center border border-white/20 dark:border-primary/30">
                  <Trophy className="w-5 h-5 text-white dark:text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wider text-white font-display">
                    Hồ Sơ Thành Viên
                  </h3>
                  <p className="text-xs text-emerald-100 dark:text-primary/70 font-label">
                    Thông tin chi tiết của vận động viên
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingProfileMember(null)}
                className="relative z-10 p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">

              {/* Profile Card Header */}
              <div className="flex items-center gap-4 bg-white/40 dark:bg-[#111723]/40 p-4 rounded-2xl border border-gray-200/60 dark:border-white/5 shadow-sm shrink-0">
                
                {/* Sporty Avatar Container */}
                <div className="relative group shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-500 dark:from-primary dark:to-emerald-400 rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative h-16 w-16 rounded-2xl bg-white dark:bg-[#1a202c] p-0.5 border-2 border-emerald-500 dark:border-primary flex items-center justify-center text-emerald-600 dark:text-primary font-bold text-2xl shadow-md font-display select-none overflow-hidden">
                    {profileDetails?.avatarFileId ? (
                      <MediaImage fileId={profileDetails.avatarFileId} alt="avatar" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <span className="bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-primary dark:to-emerald-500 bg-clip-text text-transparent font-extrabold uppercase">
                        {viewingProfileMember.fullName?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-xl font-black text-gray-900 dark:text-white truncate font-display leading-tight tracking-wide">
                    {viewingProfileMember.fullName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider font-label ${
                      viewingProfileMember.roleName === 'Leader'
                        ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
                    }`}>
                      {viewingProfileMember.roleName === 'Leader' ? 'Chủ nhóm' : 'Thành viên'}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-label">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold font-label">
                      Tham gia: {new Date(viewingProfileMember.joinedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* API Fetching States */}
              {profileLoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <div className="h-10 w-10 rounded-full border-2 border-gray-200 dark:border-border-dark border-t-emerald-500 dark:border-t-primary animate-spin" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-label animate-pulse font-semibold">
                    Đang đồng bộ hồ sơ từ máy chủ...
                  </p>
                </div>
              ) : profileError ? (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-200 dark:border-red-500/20 flex gap-3 text-red-700 dark:text-red-400">
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
                            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-primary font-display flex items-center gap-1.5 border-l-4 border-emerald-500 dark:border-primary pl-2">
                              Thông tin tài khoản
                            </h4>
                            <div className="grid grid-cols-2 gap-3.5 bg-gray-50/50 dark:bg-[#111723]/30 rounded-2xl p-4 border border-gray-200/60 dark:border-white/5">
                              {ungrouped.map((f, i) => (
                                <div key={i} className="bg-white/85 dark:bg-[#151c28]/60 p-3.5 rounded-xl border border-gray-200/60 dark:border-white/5 hover:border-emerald-500/30 dark:hover:border-primary/20 transition-all duration-300 group/card relative overflow-hidden shadow-sm">
                                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                                  <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider font-label">
                                    {f.key}
                                  </span>
                                  <p className="text-sm text-gray-900 dark:text-white font-extrabold font-display break-words mt-0.5 relative z-10 leading-tight">
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
                            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-primary font-display flex items-center gap-1.5 border-l-4 border-emerald-500 dark:border-primary pl-2">
                              {groupName}
                            </h4>
                            <div className="grid grid-cols-2 gap-3.5 bg-emerald-50/10 dark:bg-primary/5 rounded-2xl p-4 border border-emerald-500/10 dark:border-primary/10">
                              {groupFields.map((f, j) => {
                                const isWins = f.key === 'Số trận thắng';
                                const isLosses = f.key === 'Số trận thua';

                                if (isWins) {
                                  return (
                                    <div key={j} className="bg-emerald-500/5 dark:bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 relative overflow-hidden group/wins shadow-sm">
                                      <div className="absolute -right-2 -bottom-2 opacity-10 group-hover/wins:scale-110 transition-transform duration-300">
                                        <Trophy className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                                      </div>
                                      <span className="block text-[10px] text-emerald-800/80 dark:text-emerald-400/80 font-bold uppercase tracking-wider font-label">
                                        {f.key}
                                      </span>
                                      <p className="text-xl text-emerald-600 dark:text-emerald-400 font-black font-display mt-0.5">
                                        {f.value}
                                      </p>
                                    </div>
                                  );
                                }

                                if (isLosses) {
                                  return (
                                    <div key={j} className="bg-red-500/5 dark:bg-red-500/10 p-3.5 rounded-xl border border-red-500/20 hover:border-red-500/30 transition-all duration-300 relative overflow-hidden group/losses shadow-sm">
                                      <span className="block text-[10px] text-red-800/80 dark:text-red-400/80 font-bold uppercase tracking-wider font-label">
                                        {f.key}
                                      </span>
                                      <p className="text-xl text-red-600 dark:text-red-400 font-black font-display mt-0.5">
                                        {f.value}
                                      </p>
                                    </div>
                                  );
                                }

                                return (
                                  <div key={j} className="bg-white/85 dark:bg-[#151c28]/60 p-3.5 rounded-xl border border-gray-200/60 dark:border-white/5 hover:border-emerald-500/30 dark:hover:border-primary/20 transition-all duration-300 group/card relative overflow-hidden shadow-sm">
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                                    <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider font-label">
                                      {f.key}
                                    </span>
                                    <p className="text-sm text-gray-900 dark:text-white font-extrabold font-display break-words mt-0.5 relative z-10 leading-tight">
                                      {f.value}
                                    </p>
                                  </div>
                                );
                              })}
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
            <div className="relative px-6 py-4 bg-gray-50 dark:bg-[#0c0f17]/90 border-t border-gray-200 dark:border-border-dark/60 flex items-center justify-between shrink-0 z-10">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider font-label">
                Hệ cơ sở dữ liệu SmashHub
              </span>
              <Button
                variant="primary"
                onClick={() => setViewingProfileMember(null)}
                className="px-6 py-2.5 text-xs uppercase tracking-wider"
              >
                Đóng hồ sơ
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Create Schedule Modal */}
      <CreateScheduleModal
        key={scheduleModalKey}
        isOpen={showCreateSchedule}
        onClose={() => setShowCreateSchedule(false)}
        teamId={teamId}
        onSuccess={() => {
          refetchSchedules();
        }}
      />

      {/* Participants Modal (Manage) */}
      <ParticipantsModal
        isOpen={!!manageSchedule}
        onClose={() => setManageSchedule(null)}
        schedule={manageSchedule}
        onSuccess={() => {
          refetchSchedules();
        }}
      />

      <MatchRequestsModal
        isOpen={!!viewingChallengeId}
        onClose={() => {
          setViewingChallengeId(null);
          fetchActiveChallenges({ teamId });
        }}
        challengeId={viewingChallengeId}
      />

      <CreateChallengeModal
        isOpen={!!createChallengeConfig}
        onClose={() => setCreateChallengeConfig(null)}
        scheduleId={createChallengeConfig?.scheduleId}
        sportId={createChallengeConfig?.sportId}
        hostTeamId={createChallengeConfig?.hostTeamId}
        onSubmit={handleCreateChallenge}
        isDarkMode={theme === 'dark'}
      />
    </div>
  );
}
