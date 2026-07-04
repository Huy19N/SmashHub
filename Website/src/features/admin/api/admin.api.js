import axios from '../../../config/axios';

// Fetch overall system statistics
export const getAdminStatisticsAPI = async () => {
  const response = await axios.get('/admin/statistics');
  return response.data;
};

// Fetch all users list
export const getAdminUsersAPI = async () => {
  const response = await axios.get('/admin/users');
  return response.data;
};

// Change a user's role
export const changeUserRoleAPI = async (userId, roleId) => {
  const response = await axios.put(`/admin/users/${userId}/role`, { roleId });
  return response.data;
};

// Toggle a user's active/inactive status
export const toggleUserStatusAPI = async (userId) => {
  const response = await axios.put(`/admin/users/${userId}/status`);
  return response.data;
};

// Fetch all facilities list
export const getAdminFacilitiesAPI = async () => {
  const response = await axios.get('/admin/facilities');
  return response.data;
};

// Approve a facility registration
export const approveFacilityAPI = async (facilityId) => {
  const response = await axios.put(`/admin/facilities/${facilityId}/approve`);
  return response.data;
};

// Reject a facility registration
export const rejectFacilityAPI = async (facilityId) => {
  const response = await axios.put(`/admin/facilities/${facilityId}/reject`);
  return response.data;
};

// Fetch all payout requests
export const getPayoutRequestsAPI = async () => {
  const response = await axios.get('/admin/payout-requests');
  return response.data;
};

// Approve a payout request
export const approvePayoutAPI = async (payoutId, payoutData) => {
  const response = await axios.put(`/admin/payout-requests/${payoutId}/approve`, payoutData);
  return response.data;
};

// Reject a payout request
export const rejectPayoutAPI = async (payoutId, payoutData) => {
  const response = await axios.put(`/admin/payout-requests/${payoutId}/reject`, payoutData);
  return response.data;
};

// Fetch all system settings
export const getSystemSettingsAPI = async () => {
  const response = await axios.get('/admin/settings');
  return response.data;
};

// Update a system setting
export const updateSystemSettingAPI = async (key, value) => {
  const response = await axios.put(`/admin/settings/${key}`, { settingValue: value });
  return response.data;
};

// Delete (soft delete) a facility
export const deleteFacilityAPI = async (facilityId) => {
  const response = await axios.delete(`/admin/facilities/${facilityId}`);
  return response.data;
};

// Moderation
export const getPendingPostsAPI = async (params) => {
  const response = await axios.get('/admin/posts/pending', { params });
  return response.data;
};

export const approvePostAPI = async (postId) => {
  const response = await axios.post(`/admin/posts/${postId}/approve`);
  return response.data;
};

export const rejectPostAPI = async (postId) => {
  const response = await axios.post(`/admin/posts/${postId}/reject`);
  return response.data;
};

export const banUserAPI = async (userId, until, reason) => {
  const response = await axios.post(`/admin/users/${userId}/ban`, { until, reason });
  return response.data;
};

export const unbanUserAPI = async (userId) => {
  const response = await axios.post(`/admin/users/${userId}/unban`);
  return response.data;
};

export const getPendingReportsAPI = async (params) => {
  const response = await axios.get('/admin/reports/pending', { params });
  return response.data;
};

export const resolveReportAPI = async (reportId, action) => {
  const response = await axios.post(`/admin/reports/${reportId}/resolve`, { action });
  return response.data;
};

export const dismissReportAPI = async (reportId) => {
  const response = await axios.post(`/admin/reports/${reportId}/dismiss`);
  return response.data;
};
