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

export const useTeams = () => {
  const [teams, setTeams] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeams = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTeamsAPI(params);
      const data = response?.data ?? response;
      setTeams(data?.items ?? data ?? []);
      return data;
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
