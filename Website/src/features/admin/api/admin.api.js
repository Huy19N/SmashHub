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
  const response = await axios.get('/admin/system-settings');
  return response.data;
};

// Update a system setting
export const updateSystemSettingAPI = async (key, value) => {
  const response = await axios.put(`/admin/system-settings/${key}`, { settingValue: value });
  return response.data;
};
