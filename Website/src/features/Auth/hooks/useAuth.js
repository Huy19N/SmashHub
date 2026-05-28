import { useState } from 'react';
import { loginAPI, registerAPI, logoutAPI } from '../api/auth.api.js';
import api from '../../../config/axios.js';

export const useLogout = () => {
  const [isLoading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const refreshToken = localStorage.getItem('refreshToken');
      await logoutAPI({
        userId: userId ? parseInt(userId) : 0,
        refeshToken: refreshToken || ""
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

export const useLogin = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginAPI({ email, password });
      const userData = response?.data ?? response;

      localStorage.setItem('userId', userData.userId);
      localStorage.setItem('roleId', userData.roleId);
      localStorage.setItem('name', userData.userName);
      localStorage.setItem('token', userData.accessToken);
      localStorage.setItem('refreshToken', userData.refreshToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${userData.accessToken}`;

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
      let errorMsg = error.response?.data?.message || error.message || "Đã xảy ra lỗi";

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        if (firstErrorKey && errors[firstErrorKey].length > 0) {
          errorMsg = errors[firstErrorKey][0];
        }
      }

      setError(errorMsg);
      throw errorMsg;
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
