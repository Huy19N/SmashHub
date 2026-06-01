import { useState, useEffect } from 'react';
import { loginAPI, registerAPI, logoutAPI, getUserAPI, updateUserAPI, getUserIdAPI, getUserProfileAPI, updateUserProfileAPI, createUserProfileAPI, deleteUserProfileAPI } from '../api/auth.api.js';
import api from '../../../config/axios.js';

export const useLogout = () => {
  const [isLoading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const refreshToken = localStorage.getItem('refreshToken');
      await logoutAPI({
        userId: userId || "",
        refreshToken: refreshToken || ""
      });
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.clear();
      delete api.defaults.headers.common['Authorization'];
      setLoading(false);
    }
  };

  return { logout, isLoading };
};

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const useLogin = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginAPI({ email, password });
      const userData = response?.data ?? response;

      const accessToken = userData.accessToken;
      const decoded = parseJwt(accessToken);

      const userId = decoded?.nameid || decoded?.sub || decoded?.userId || userData.userId;
      const roleId = decoded?.role || decoded?.roleId || userData.roleId;

      if (userId) localStorage.setItem('userId', userId);
      if (roleId) localStorage.setItem('roleId', roleId);
      localStorage.setItem('token', accessToken);
      if (userData.refreshToken) {
        localStorage.setItem('refreshToken', userData.refreshToken);
      }
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      return response;
    } catch (error) {
      let errorMsg = "Đăng nhập không thành công.";
      if (error.response) {
        const status = error.response.status;
        if (status === 401 || status === 400) {
          errorMsg = "Sai mật khẩu hoặc tài khoản.";
        } else {
          errorMsg = error.response.data?.message || `Lỗi hệ thống (${status}). Vui lòng thử lại sau.`;
        }
      } else if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
        errorMsg = "Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng!";
      } else if (error.message) {
        errorMsg = error.message;
      }
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    isLoading,
    error,
    login,
  };
};

export const useRegister = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = async (fullName, email, password, phoneNumber) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registerAPI({ fullName, email, password, phoneNumber });
      return response;
    } catch (error) {
      let errorMsg = error.response?.data?.message || error.message || "Đăng ký không thành công.";

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        if (firstErrorKey && errors[firstErrorKey].length > 0) {
          errorMsg = errors[firstErrorKey][0];
        }
      }

      if (errorMsg.includes("already exists") || errorMsg.includes("duplicate") || errorMsg.includes("đã tồn tại")) {
        errorMsg = "Email hoặc Số điện thoại đã được đăng ký sử dụng.";
      } else if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
        errorMsg = "Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng!";
      }

      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    isLoading,
    error,
    register,
  };
};

export default function useAuth() {
  const userId = localStorage.getItem('userId');
  const name = localStorage.getItem('name');
  const roleId = localStorage.getItem('roleId');
  const token = localStorage.getItem('token');

  const user = userId ? { userId, name, roleId, token } : null;

  const { login, isLoading: isLoginLoading, error: loginError } = useLogin();
  const { register, isLoading: isRegisterLoading, error: registerError } = useRegister();
  const { logout, isLoading: isLogoutLoading } = useLogout();

  return {
    user,
    login,
    register,
    logout,
    isLoading: isLoginLoading || isRegisterLoading || isLogoutLoading,
    error: loginError || registerError || null,
  };
}

export const useGetUser = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getUserAPI();
        setUser(response);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return {
    user,
    isLoading,
    error,
  };
};

export const useUpdateUser = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateUserAPI(userData);
      return response;
    } catch (error) {
      setError(error.message);
      throw error.message;
    } finally {
      setLoading(false);
    }
  };

  return {
    isLoading,
    error,
    updateUser,
  };
};

export const useGetUserId = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getUserIdAPI(localStorage.getItem('userId'));
        setUser(response);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return {
    user,
    isLoading,
    error,
  };
};

// User Profiles 

export const useGetUserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getUserProfileAPI();
        setUserProfile(response);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  return {
    userProfile,
    isLoading,
    error,
  };
};

export const useUpdateUserProfile = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateUserProfile = async (sportProfileData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateUserProfileAPI(sportProfileData);
      return response;
    } catch (error) {
      setError(error.message);
      throw error.message;
    } finally {
      setLoading(false);
    }
  };

  return {
    isLoading,
    error,
    updateUserProfile,
  };
};

export const useCreateUserProfile = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createUserProfile = async (sportProfileData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createUserProfileAPI(sportProfileData);
      return response;
    } catch (error) {
      setError(error.message);
      throw error.message;
    } finally {
      setLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createUserProfile,
  };
};

export const useDeleteUserProfile = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteUserProfile = async (sportProfileId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await deleteUserProfileAPI(sportProfileId);
      return response;
    } catch (error) {
      setError(error.message);
      throw error.message;
    } finally {
      setLoading(false);
    }
  };

  return {
    isLoading,
    error,
    deleteUserProfile,
  };
};