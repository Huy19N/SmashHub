import { useState, useEffect, useCallback } from 'react';
import {
  createGroupAPI,
  getTeamsAPI,
  getTeamDetailAPI,
  createInviteAPI,
  getInviteInfoAPI,
  acceptInviteAPI,
  getTeamSchedulesAPI,
  updateTeamAPI,
  deleteTeamAPI,
  getTeamMembersAPI,
  removeTeamMemberAPI,
  getMessagesAPI,
  sendMessageAPI,
  deleteMessageAPI,
} from '../api/groups.api.js';

/**
 * Groups/Teams Custom Hooks
 * Wraps API calls with loading/error state management following the
 * same pattern as the Auth hooks (useLogin, useRegister, useLogout).
 */

// ─── useCreateGroup ───────────────────────────────────────────

export const useCreateGroup = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createGroup = async ({ teamName, description }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createGroupAPI({ teamName, description });
      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Không thể tạo nhóm.';
      setError(errorMsg);
      throw errorMsg;
    } finally {
      setLoading(false);
    }
  };

  return { createGroup, isLoading, error };
};

// ─── useUpdateGroup ───────────────────────────────────────────

export const useUpdateGroup = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateGroup = async (teamId, { teamName, description }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateTeamAPI(teamId, { teamName, description });
      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Không thể cập nhật nhóm.';
      setError(errorMsg);
      throw errorMsg;
    } finally {
      setLoading(false);
    }
  };

  return { updateGroup, isLoading, error };
};

// ─── useDeleteGroup ───────────────────────────────────────────

export const useDeleteGroup = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteGroup = async (teamId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await deleteTeamAPI(teamId);
      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Không thể xóa nhóm.';
      setError(errorMsg);
      throw errorMsg;
    } finally {
      setLoading(false);
    }
  };

  return { deleteGroup, isLoading, error };
};

// ─── useTeams ─────────────────────────────────────────────────
// Fetches only teams where the current logged-in user is a member.
// Strategy: fetch all teams → fetch members for each → filter by userId.

export const useTeams = () => {
  const [teams, setTeams] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeams = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setTeams([]);
        return;
      }

      // 1. Fetch all teams
      const response = await getTeamsAPI(params);
      const data = response?.data ?? response;
      const allTeams = data?.items ?? data ?? [];

      if (!Array.isArray(allTeams) || allTeams.length === 0) {
        setTeams([]);
        return;
      }

      // 2. For each team, fetch members in parallel and check if user belongs
      const memberChecks = await Promise.allSettled(
        allTeams.map(async (team) => {
          const teamId = team.teamId || team.id;
          if (!teamId) return { team, isMember: false };

          try {
            const membersRes = await getTeamMembersAPI(teamId);
            const members = membersRes?.data ?? membersRes;
            const memberList = Array.isArray(members) ? members : [];

            // Check if current user is in this team's member list (robust property mapping)
            const isMember = memberList.some((m) => {
              const memberUserId = m?.userId ?? m?.id ?? m?.user?.id ?? m?.user?.userId;
              return memberUserId && userId && String(memberUserId) === String(userId);
            });
            return { team, isMember };
          } catch {
            // If we can't fetch members, don't include team
            return { team, isMember: false };
          }
        })
      );

      // 3. Filter to only teams where user is a member
      const myTeams = memberChecks
        .filter((r) => r.status === 'fulfilled' && r.value.isMember)
        .map((r) => r.value.team);

      setTeams(myTeams);
      return myTeams;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Không thể tải danh sách nhóm.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return { teams, isLoading, error, refetch: fetchTeams };
};

// ─── useTeamDetail ────────────────────────────────────────────

export const useTeamDetail = (teamId) => {
  const [team, setTeam] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeam = useCallback(async () => {
    if (!teamId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getTeamDetailAPI(teamId);
      setTeam(response?.data ?? response);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Không thể tải thông tin nhóm.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  return { team, isLoading, error, refetch: fetchTeam };
};

// ─── useCreateInvite ──────────────────────────────────────────

export const useCreateInvite = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inviteData, setInviteData] = useState(null);

  const createInvite = async (teamId, options) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createInviteAPI(teamId, options);
      const data = response?.data ?? response;
      setInviteData(data);
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Không thể tạo lời mời.';
      setError(errorMsg);
      throw errorMsg;
    } finally {
      setLoading(false);
    }
  };

  return { createInvite, isLoading, error, inviteData };
};

// ─── useInviteInfo ────────────────────────────────────────────

export const useInviteInfo = (token) => {
  const [inviteInfo, setInviteInfo] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const fetchInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getInviteInfoAPI(token);
        if (!cancelled) setInviteInfo(response?.data ?? response);
      } catch (err) {
        if (!cancelled) {
          const errorMsg = err.response?.data?.message || err.message || 'Lời mời không hợp lệ.';
          setError(errorMsg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchInfo();
    return () => { cancelled = true; };
  }, [token]);

  return { inviteInfo, isLoading, error };
};

// ─── useAcceptInvite ──────────────────────────────────────────

export const useAcceptInvite = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const acceptInvite = async (inviteToken) => {
    setLoading(true);
    setError(null);
    try {
      const response = await acceptInviteAPI(inviteToken);
      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Không thể tham gia nhóm.';
      setError(errorMsg);
      throw errorMsg;
    } finally {
      setLoading(false);
    }
  };

  return { acceptInvite, isLoading, error };
};

// ─── useTeamSchedules ─────────────────────────────────────────

export const useTeamSchedules = (teamId) => {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSchedules = useCallback(async () => {
    if (!teamId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getTeamSchedulesAPI(teamId);
      const data = response?.data ?? response;
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Không thể tải lịch chơi.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return { schedules, isLoading, error, refetch: fetchSchedules };
};

// ─── useTeamMembers ───────────────────────────────────────────

export const useTeamMembers = (teamId) => {
  const [members, setMembers] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMembers = useCallback(async () => {
    if (!teamId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getTeamMembersAPI(teamId);
      const data = response?.data ?? response;
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Không thể tải danh sách thành viên.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return { members, isLoading, error, refetch: fetchMembers };
};

// ─── useRemoveMember ──────────────────────────────────────────

export const useRemoveMember = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const removeMember = async (teamId, userId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await removeTeamMemberAPI(teamId, userId);
      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Không thể xóa thành viên.';
      setError(errorMsg);
      throw errorMsg;
    } finally {
      setLoading(false);
    }
  };

  return { removeMember, isLoading, error };
};

// ─── useMessages ──────────────────────────────────────────

export const useGetMessages = (teamId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async () => {
    if (!teamId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getMessagesAPI(teamId);
      const data = response?.data ?? response;
      // Backend returns PagedResult { items: [...], totalCount, ... } or a flat array
      const items = data?.items ?? (Array.isArray(data) ? data : []);
      setMessages(Array.isArray(items) ? items : []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Không thể tải tin nhắn.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return { messages, isLoading, error, refetch: fetchMessages };
};

// ─── useSendMessage ──────────────────────────────────────────

export const useSendMessage = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (teamId, message) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sendMessageAPI(teamId, message);
      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Không thể gửi tin nhắn.';
      setError(errorMsg);
      throw errorMsg;
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, isLoading, error };
};

// ─── useDeleteMessage ──────────────────────────────────────────

export const useDeleteMessage = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteMessage = async (teamId, messageId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await deleteMessageAPI(teamId, messageId);
      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Không thể xóa tin nhắn.';
      setError(errorMsg);
      throw errorMsg;
    } finally {
      setLoading(false);
    }
  };

  return { deleteMessage, isLoading, error };
};