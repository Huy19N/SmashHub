import axios from '../../../config/axios';

const SOCIAL_URL = '/social';

export const createPostAPI = async (postData) => {
  const response = await axios.post(`${SOCIAL_URL}/posts`, postData);
  return response.data;
};

export const getPostsAPI = async (params) => {
  const response = await axios.get(`${SOCIAL_URL}/posts`, { params });
  return response.data;
};

export const getPostsByFacilityAPI = async (facilityId, params) => {
  const response = await axios.get(`${SOCIAL_URL}/facilities/${facilityId}/posts`, { params });
  return response.data;
};

export const getPostsByTeamAPI = async (teamId, params) => {
  const response = await axios.get(`${SOCIAL_URL}/teams/${teamId}/posts`, { params });
  return response.data;
};

export const getPostDetailAPI = async (postId) => {
  const response = await axios.get(`${SOCIAL_URL}/posts/${postId}`);
  return response.data;
};

export const likePostAPI = async (postId) => {
  const response = await axios.post(`${SOCIAL_URL}/posts/${postId}/like`);
  return response.data;
};

export const unlikePostAPI = async (postId) => {
  const response = await axios.delete(`${SOCIAL_URL}/posts/${postId}/like`);
  return response.data;
};

export const addCommentAPI = async (postId, content) => {
  const response = await axios.post(`${SOCIAL_URL}/posts/${postId}/comments`, { content });
  return response.data;
};

export const getCommentsAPI = async (postId, params) => {
  const response = await axios.get(`${SOCIAL_URL}/posts/${postId}/comments`, { params });
  return response.data;
};

// Moderation
export const deletePostAPI = async (postId) => {
  const response = await axios.delete(`${SOCIAL_URL}/posts/${postId}`);
  return response.data;
};

export const deleteCommentAPI = async (commentId) => {
  const response = await axios.delete(`${SOCIAL_URL}/comments/${commentId}`);
  return response.data;
};

export const reportPostAPI = async (postId, reason) => {
  const response = await axios.post(`${SOCIAL_URL}/posts/${postId}/report`, { reason });
  return response.data;
};

export const blockUserAPI = async (userId) => {
  const response = await axios.post(`/users/${userId}/block`);
  return response.data;
};
