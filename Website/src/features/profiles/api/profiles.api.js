import api from "../../../config/axios";

// ─── Users ────────────────────────────────────────────────

/** Get user (GET /api/users/me) */
export const getAllUserAPI = async () => {
    const response = await api.get(`/users/me`);
    return response.data;
}

/** Get user (GET /api/user/{userId}) */
export const getAllUserByIdAPI = async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
}

/** PUT user (PUT /api/users/me) */
export const updateUserAPI = async (userData) => {
    const response = await api.put('/users/me', userData);
    return response.data;
}

// POST user avatar (POST /api/users/me/avatar)
export const uploadUserAvatarAPI = async (avatarData) => {
    const response = await api.post('/users/me/avatar', avatarData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
}

// GET user online status (GET /api/users/{userId}/online)
export const getUserOnlineAPI = async (userId) => {
    const response = await api.get(`/users/${userId}/online`);
    return response.data;
}

// ─── Users sports profiles  ────────────────────────────────────────────────

/** Get user (GET /api/users/me/sport-profiles) */
export const getAllUserSportProfilesAPI = async () => {
    const response = await api.get(`/users/me/sport-profiles`);
    return response.data;
}

/** Create sport profile (POST /api/users/me/sport-profiles) */
export const createUserSportProfilesAPI = async (data) => {
    const response = await api.post(`/users/me/sport-profiles`, data);
    return response.data;
}

/** Update sport profile (PUT /api/users/me/sport-profiles/{sportId}) */
export const updateUserSportProfilesAPI = async (sportId, data) => {
    const response = await api.put(`/users/me/sport-profiles/${sportId}`, data);
    return response.data;
}

/** Delete sport profile (DELETE /api/users/me/sport-profiles/{sportId}) */
export const deleteUserSportProfilesAPI = async (sportId) => {
    const response = await api.delete(`/users/me/sport-profiles/${sportId}`);
    return response.data;
}

// ─── Blocked Users ────────────────────────────────────────────────

// GET blocked users
export const getBlockedUsersAPI = async () => {
    const response = await api.get(`/users/me/blocked`);
    return response.data;
}

// DELETE block (unblock user)
export const unblockUserAPI = async (userId) => {
    const response = await api.delete(`/users/${userId}/block`);
    return response.data;
}

