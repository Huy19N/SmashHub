import { useState, useEffect, useCallback } from 'react';
import {
    getAllUserAPI,
    getAllUserByIdAPI,
    updateUserAPI,
    getUserOnlineAPI,
    uploadUserAvatarAPI,
    getAllUserSportProfilesAPI,
    createUserSportProfilesAPI,
    updateUserSportProfilesAPI,
    deleteUserSportProfilesAPI
} from '../api/profiles.api.js';


// ─── useGetMyProfile ───────────────────────────────────────────
export const useGetMyProfile = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getAllUserAPI();
            setUser(response?.data ?? response);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);
    return { user, isLoading, error, refetch: fetchProfile };
}

// ─── useGetAllUserById ───────────────────────────────────────────
export const useGetAllUserById = (userId) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchUser = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getAllUserByIdAPI(userId);
            setUser(response?.data ?? response);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);
    return { user, isLoading, error, refetch: fetchUser };
}

// ─── useUpdateUser ───────────────────────────────────────────
export const useUpdateUser = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const updateUser = async (userData) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await updateUserAPI(userData);
            return response?.data ?? response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };
    return { updateUser, isLoading, error };
}

// ─── useGetAllUserSportProfiles ───────────────────────────────────────────
export const useGetAllUserSportProfiles = () => {
    const [userSportProfiles, setUserSportProfiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchUserSportProfiles = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getAllUserSportProfilesAPI();
            setUserSportProfiles(response?.data ?? response ?? []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchUserSportProfiles();
    }, [fetchUserSportProfiles]);
    return { userSportProfiles, isLoading, error, refetch: fetchUserSportProfiles };
}

// ─── useCreateUserSportProfile ───────────────────────────────────────────
export const useCreateUserSportProfile = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const createUserSportProfile = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await createUserSportProfilesAPI(data);
            return response?.data ?? response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };
    return { createUserSportProfile, isLoading, error };
}

// ─── useUpdateUserSportProfile ───────────────────────────────────────────
export const useUpdateUserSportProfile = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const updateUserSportProfile = async (sportId, data) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await updateUserSportProfilesAPI(sportId, data);
            return response?.data ?? response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };
    return { updateUserSportProfile, isLoading, error };
}

// ─── useDeleteUserSportProfile ───────────────────────────────────────────
export const useDeleteUserSportProfile = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const deleteUserSportProfile = async (sportId) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await deleteUserSportProfilesAPI(sportId);
            return response?.data ?? response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };
    return { deleteUserSportProfile, isLoading, error };
}

// ─── useGetUserOnline ───────────────────────────────────────────
export const useGetUserOnline = (userId) => {
    const [userOnline, setUserOnline] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchUserOnline = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await getUserOnlineAPI(userId);
            setUserOnline(response?.data ?? response ?? null);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);
    useEffect(() => {
        if (userId) {
            fetchUserOnline();
        }
    }, [userId, fetchUserOnline]);
    return { userOnline, isLoading, error, refetch: fetchUserOnline };
}

// ─── useUploadUserAvatar ───────────────────────────────────────────
export const useUploadUserAvatar = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const uploadUserAvatar = async (avatarData) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await uploadUserAvatarAPI(avatarData);
            return response?.data ?? response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };
    return { uploadUserAvatar, isLoading, error };
}