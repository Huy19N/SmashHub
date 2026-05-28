import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Attach auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && token !== 'undefined' && token !== 'null') {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            delete config.headers.Authorization;
        }
        console.log(`[Axios] ${config.method?.toUpperCase()} ${config.url}`,
            'Token:', token ? `${token.substring(0, 20)}...` : 'NONE');
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;