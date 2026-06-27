import axios from "axios";
import { refreshAccessTokenAPI } from "../features/Auth/api/auth.api.js";

let inMemoryAccessToken = null;

export const setAccessToken = (token) => {
    inMemoryAccessToken = token;
};

export const getAccessToken = () => {
    return inMemoryAccessToken;
};

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Cho phép tự động gửi và nhận HttpOnly Cookie (RefreshToken)
});

// Attach auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            delete config.headers.Authorization;
        }

        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor để xử lý 401 và tự động gọi refresh token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Nếu lỗi 401 (Unauthorized) và chưa từng thử retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Đánh dấu là đã thử retry
            
            // Đừng cố refresh token nếu đang gọi API login hoặc chính API refresh
            if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh-token')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            isRefreshing = true;

            try {
                // Gọi API refresh token (Cookie sẽ tự động được gửi đi nhờ withCredentials)
                const refreshData = await refreshAccessTokenAPI();
                const newAccessToken = refreshData?.data?.accessToken || refreshData?.accessToken;
                
                if (newAccessToken) {
                    setAccessToken(newAccessToken);
                    processQueue(null, newAccessToken);
                    // Gắn token mới vào request bị lỗi ban đầu và gọi lại
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Nếu refresh thất bại (ví dụ: cookie hết hạn, không hợp lệ), clear thông tin
                setAccessToken(null);
                localStorage.clear(); // Xóa các config khác nếu có
                window.location.href = '/login'; // Chuyển về trang đăng nhập
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;