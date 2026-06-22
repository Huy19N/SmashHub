import { useState, useEffect } from 'react';
import { CalendarDays, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTeamsAPI, getTeamSchedulesAPI, getScheduleParticipantsAPI, getTeamMembersAPI } from '../../groups/api/groups.api.js';
import { useAddScheduleParticipant, useRemoveScheduleParticipant, useDeleteSchedule } from '../../groups/hooks/useGroups.js';
import { useMatchmaking } from '../../groups/hooks/useMatchmaking.js';
import toast from 'react-hot-toast';
import SessionCard from '../../groups/components/SessionCard.jsx';
import MatchRequestsModal from '../../groups/components/MatchRequestsModal.jsx';
import ParticipantsModal from '../../groups/components/ParticipantsModal.jsx';
import CreateChallengeModal from '../../groups/components/CreateChallengeModal.jsx';
import Sidebar from '../../../components/layout/Sidebar';
import SportyWatermarks from '../../../components/ui/SportyWatermarks';
import { useTheme } from '../../../contexts/ThemeContext';

export default function SchedulesPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joinedScheduleIds, setJoinedScheduleIds] = useState(new Set());
  const [votingScheduleId, setVotingScheduleId] = useState(null);
  const [manageSchedule, setManageSchedule] = useState(null);
  const [userTeams, setUserTeams] = useState([]);
  const [deletingScheduleId, setDeletingScheduleId] = useState(null);
  const [viewingChallengeId, setViewingChallengeId] = useState(null);
  const [createChallengeConfig, setCreateChallengeConfig] = useState(null);

  const { addParticipant } = useAddScheduleParticipant();
  const { removeParticipant } = useRemoveScheduleParticipant();
  const { deleteSchedule } = useDeleteSchedule();
  const { createChallenge, challenges, fetchActiveChallenges } = useMatchmaking();

  const currentUserId = localStorage.getItem('userId');

  const fetchAllData = async () => {
    if (!currentUserId) return;
    setIsLoading(true);
    try {
      // 1. Get all teams
      const teamsRes = await getTeamsAPI();
      const allTeams = teamsRes?.data?.items || teamsRes?.data || [];

      // 2. Filter teams by membership
      const memberChecks = await Promise.allSettled(
        allTeams.map(async (team) => {
          const teamId = team.teamId || team.id;
          if (!teamId) return { team, isMember: false };
          try {
            const membersRes = await getTeamMembersAPI(teamId);
            const members = membersRes?.data ?? membersRes;
            const memberList = Array.isArray(members) ? members : [];
            const isMember = memberList.some((m) => {
              const memberUserId = m?.userId ?? m?.id ?? m?.user?.id ?? m?.user?.userId;
              return memberUserId && currentUserId && String(memberUserId) === String(currentUserId);
            });
            // Also store role info to determine leader status
            if (isMember) {
              const myMemberData = memberList.find(m => {
                const memberUserId = m?.userId ?? m?.id ?? m?.user?.id ?? m?.user?.userId;
                return memberUserId && currentUserId && String(memberUserId) === String(currentUserId);
              });
              team.roleName = myMemberData?.roleName || myMemberData?.userRole;
            }
            return { team, isMember };
          } catch {
            return { team, isMember: false };
          }
        })
      );

      const myTeams = memberChecks
        .filter((r) => r.status === 'fulfilled' && r.value.isMember)
        .map((r) => r.value.team);

      setUserTeams(myTeams);

      // 3. Fetch schedules for my teams
      const allSchedules = [];
      const joined = new Set();

      await Promise.allSettled(
        myTeams.map(async (team) => {
          const teamId = team.teamId || team.id;
          if (!teamId) return;

          try {
            const schedRes = await getTeamSchedulesAPI(teamId);
            const teamSchedules = schedRes?.data ?? [];

            // For each schedule, check if user is a participant
            await Promise.allSettled(
              teamSchedules.map(async (schedule) => {
                // Add the hostTeamName if it's not present
                schedule.hostTeamName = schedule.hostTeamName || team.teamName || team.name;
                schedule.teamId = teamId; // Keep reference to teamId
                allSchedules.push(schedule);

                try {
                  const partRes = await getScheduleParticipantsAPI(schedule.scheduleId);
                  const participants = Array.isArray(partRes?.data) ? partRes.data : [];
                  if (participants.some(p => String(p.userId) === String(currentUserId))) {
                    joined.add(schedule.scheduleId);
                  }
                } catch {
                  // ignore
                }
              })
            );
          } catch {
            // ignore
          }
        })
      );

      // Sort schedules by start time (newest first or upcoming first)
      allSchedules.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

      setSchedules(allSchedules);
      setJoinedScheduleIds(joined);
    } catch (err) {
      console.error('Failed to load schedules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchActiveChallenges({});
  }, [currentUserId]);

  const handleVoteJoin = async (scheduleId) => {
    try {
      setVotingScheduleId(scheduleId);
      await addParticipant(scheduleId);
      setJoinedScheduleIds(prev => new Set(prev).add(scheduleId));
    } catch (err) {
      toast.error(err || 'Không thể tham gia.');
    } finally {
      setVotingScheduleId(null);
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
    } catch (err) {
      toast.error(err || 'Không thể hủy tham gia.');
    } finally {
      setVotingScheduleId(null);
    }
  };

  const handleCreateChallenge = async (config) => {
    try {
      await createChallenge(config);
      toast.success('Đã đăng kèo ghép đấu lên hệ thống thành công!');
      fetchActiveChallenges({});
      setCreateChallengeConfig(null);
    } catch (err) {
      toast.error('Lỗi tạo kèo: ' + (err.message || 'Unknown'));
    }
  };

  // Check if current user is leader of the given teamId
  const isTeamLeader = (teamId) => {
    const team = userTeams.find(t => (t.teamId || t.id) === teamId);
    return team?.roleName === 'Leader' || team?.userRole === 'Leader';
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0c0f17]' : 'bg-gray-50'} flex relative overflow-hidden`}>
      <SportyWatermarks />
      <Sidebar activeMenu="sessions" />

      <div className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-page">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-xl hover:bg-gray-200 dark:hover:bg-white/5 text-gray-500 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white font-display tracking-tight">
                Lịch trình
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-label">
              Xem và tham gia các buổi chơi từ tất cả các nhóm của bạn.
            </p>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-label">Đang tải lịch trình...</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-card-dark/10 rounded-2xl border border-gray-200/80 dark:border-border-dark/60 p-8 space-y-4">
            <CalendarDays className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-display">Chưa có lịch trình nào</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-label">
              Bạn chưa có lịch trình giao lưu nào trong các nhóm của mình.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
            {schedules.map((schedule) => (
              <div key={schedule.scheduleId} className="relative">
                {/* Team Name Header above the card */}
                <div className="mb-2 pl-1">
                  <span className="text-xs font-bold text-emerald-600 dark:text-primary font-label">
                    Nhóm: {schedule.hostTeamName}
                  </span>
                </div>
                {(() => {
                  const activeChallenge = challenges?.find(c => c.scheduleId === schedule.scheduleId);
                  return (
                    <SessionCard
                      session={schedule}
                      isLeader={isTeamLeader(schedule.teamId)}
                      isDeleting={deletingScheduleId === schedule.scheduleId}
                      hasJoined={joinedScheduleIds.has(schedule.scheduleId)}
                      isVoting={votingScheduleId === schedule.scheduleId}
                      onVoteJoin={handleVoteJoin}
                      onVoteLeave={handleVoteLeave}
                      onCreateChallenge={(schedId, spId) => setCreateChallengeConfig({ scheduleId: schedId, sportId: spId, hostTeamId: schedule.teamId })}
                      activeChallengeId={activeChallenge?.challengeId}
                      onViewMatchRequests={(cid) => setViewingChallengeId(cid)}
                      onDelete={async () => {
                        if (!window.confirm('Bạn có chắc muốn xóa lịch trình này?')) return;
                        try {
                          setDeletingScheduleId(schedule.scheduleId);
                          await deleteSchedule(schedule.scheduleId);
                          fetchAllData();
                        } catch (err) {
                          toast.error(err || 'Không thể xóa lịch trình.');
                        } finally {
                          setDeletingScheduleId(null);
                        }
                      }}
                      onManage={() => setManageSchedule(schedule)}
                    />
                  );
                })()}
              </div>
            ))}
          </div>
        )}

        </div>
      </div>

      {/* Participants / Manage Modal */}
      <ParticipantsModal
        isOpen={!!manageSchedule}
        onClose={() => setManageSchedule(null)}
        schedule={manageSchedule}
        onSuccess={() => {
          fetchAllData(); // refresh
        }}
      />
      
      <MatchRequestsModal
        isOpen={!!viewingChallengeId}
        onClose={() => {
          setViewingChallengeId(null);
          fetchActiveChallenges({});
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
