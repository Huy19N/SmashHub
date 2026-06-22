import axios from "../../../config/axios.js";


export const loginAPI = async (credentials) => {
  const response = await axios.post('/auth/login', credentials);
  return response.data;
};

export const registerAPI = async (userData) => {
  const response = await axios.post('/auth/register', userData);
  return response.data;
};

export const refreshAccessTokenAPI = async () => {
  const response = await axios.post('/auth/refresh-token');
  return response.data;
};

export const logoutAPI = async () => {
  const response = await axios.post('/auth/logout');
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

// Forgot password API
export const forgotPasswordAPI = async (email) => {
  const response = await axios.post('/auth/forgot-password', { email });
  return response.data;
};

// Reset password API
export const resetPasswordAPI = async (data) => {
  const response = await axios.post('/auth/reset-password', data);
  return response.data;
};

// Verify OTP API
export const verifyOTPInProfileandNoDeleteCodeOTPAPI = async (data) => {
  const response = await axios.post(`/email/verifycodenodelete`, data);
  return response.data;
};

export const verifyEmailInProfileAPI = async (data) => {
  const response = await axios.post(`/email/sendconfirmationemail`, JSON.stringify(data.email), {
    headers: { 'Content-Type': 'application/json' }
  });
  return response.data;
}

export const verifyOTPInProfileandDeleteCodeOTPAPI = async (data) => {
  const response = await axios.post(`/email/verifycode`, data);
  return response.data;
};

// Verify email code API 
export const verifyEmailRegisterAPI = async (data) => {
  const response = await axios.post(`/auth/verify-registration`, data);
  return response.data;
};

// resend verify email code API 
export const resendVerifyEmailAPI = async (data) => {
  const response = await axios.post(`/auth/resend-verification-code`, JSON.stringify(data.email), {
    headers: { 'Content-Type': 'application/json' }
  });
  return response.data;
};