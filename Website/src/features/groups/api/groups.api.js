import api from '../../../config/axios.js';

// ─── Team CRUD ────────────────────────────────────────────────

/** Create a new team (POST /api/teams) — creator becomes Leader */
export const createGroupAPI = async ({ teamName, description }) => {
  const response = await api.post('/teams', { teamName, description });
  return response.data;
};

/** Get paginated list of teams (GET /api/teams) */
export const getTeamsAPI = async ({ search = '', pageNumber = 1, pageSize = 20 } = {}) => {
  const response = await api.get('/teams', {
    params: { search, pageNumber, pageSize },
  });
  return response.data;
};

/** Get team detail with members (GET /api/teams/{teamId}) */
export const getTeamDetailAPI = async (teamId) => {
  const response = await api.get(`/teams/${teamId}`);
  return response.data;
};

/** Update team info — Leader only (PUT /api/teams/{teamId}) */
export const updateTeamAPI = async (teamId, { teamName, description }) => {
  const response = await api.put(`/teams/${teamId}`, { teamName, description });
  return response.data;
};

/** Delete/disband team — Leader only (DELETE /api/teams/{teamId}) */
export const deleteTeamAPI = async (teamId) => {
  const response = await api.delete(`/teams/${teamId}`);
  return response.data;
};

// ─── Invites ──────────────────────────────────────────────────

/** Create invite link for a team (POST /api/teams/{teamId}/invites) */
export const createInviteAPI = async (teamId, { maxUses = 1, expirationHours = 24 } = {}) => {
  const response = await api.post(`/teams/${teamId}/invites`, { maxUses, expirationHours });
  return response.data;
};

/** Get invite info — public (GET /api/invites/{inviteToken}) */
export const getInviteInfoAPI = async (inviteToken) => {
  const response = await api.get(`/invites/${inviteToken}`);
  return response.data;
};

/** Accept invite & join team (POST /api/invites/{inviteToken}/accept) */
export const acceptInviteAPI = async (inviteToken) => {
  const response = await api.post(`/invites/${inviteToken}/accept`);
  return response.data;
};

// ─── Schedules ────────────────────────────────────────────────

/** Get team schedules (GET /api/teams/{teamId}/schedules) */
export const getTeamSchedulesAPI = async (teamId) => {
  const response = await api.get(`/teams/${teamId}/schedules`);
  return response.data;
};
