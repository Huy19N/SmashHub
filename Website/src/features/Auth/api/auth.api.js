import axios from "../../../config/axios.js";


export const loginAPI = async (credentials) => {
  const response = await axios.post('/auth/login', credentials);
  return response.data;
};

export const registerAPI = async (userData) => {
  const response = await axios.post('/auth/register', userData);
  return response.data;
};

export const refreshAccessTokenAPI = async (refreshToken) => {
  const response = await axios.post('/auth/refresh-token', { refreshToken });
  return response.data;
};

export const logoutAPI = async (logoutData) => {
  const response = await axios.post('/auth/logout', logoutData);
  return response.data;
};

// user API

export const getUserAPI = async () => {
  const response = await axios.get('/user/me');
  return response.data;
};

export const updateUserAPI = async (userData) => {
  const response = await axios.put('/users/me', userData);
  return response.data;
};

export const getUserIdAPI = async (userId) => {
  const response = await axios.get(`/users/${userId}`);
  return response.data;
};

// user profile API

export const getUserProfileAPI = async () => {
  const response = await axios.get('/users/me/sport-profiles');
  return response.data;
};

export const updateUserProfileAPI = async (sportProfileId, sportProfileData) => {
  const response = await axios.put(`/users/me/sport-profiles/${sportProfileId}`, sportProfileData);
  return response.data;
};

export const createUserProfileAPI = async (sportProfileData) => {
  const response = await axios.post('/users/me/sport-profiles', sportProfileData);
  return response.data;
};

export const deleteUserProfileAPI = async (sportProfileId) => {
  const response = await axios.delete(`/users/me/sport-profiles/${sportProfileId}`);
  return response.data;
};