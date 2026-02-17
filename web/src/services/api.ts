import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for auth token
api.interceptors.request.use(
    (config) => {
        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const { refreshToken, setAuth, clearAuth } = useAuthStore.getState();

            if (refreshToken) {
                try {
                    const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken });

                    if (data.success) {
                        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data;
                        const state = useAuthStore.getState();
                        if (state.user) {
                            setAuth(state.user, newAccessToken, newRefreshToken);
                        }

                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    clearAuth();
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    register: (data: { fullName: string; email?: string; phone?: string; password: string; role?: string }) =>
        api.post('/auth/register', data),

    login: (data: { identifier: string; password: string }) =>
        api.post('/auth/login', data),

    verifyOtp: (data: { contact: string; otp: string; purpose: string }) =>
        api.post('/auth/verify-otp', data),

    sendOtp: (data: { contact: string; purpose: string }) =>
        api.post('/auth/send-otp', data),

    logout: (data?: { refreshToken?: string; allDevices?: boolean }) =>
        api.post('/auth/logout', data),
};

// User API
export const userApi = {
    getMe: () => api.get('/users/me'),
    updateProfile: (data: Record<string, unknown>) => api.patch('/users/me/profile', data),
};

// Service Request API
export const serviceRequestApi = {
    create: (data: { serviceType: string; date: string; time: string; location?: string; notes?: string }) =>
        api.post('/service-requests', data),

    getAll: () => api.get('/service-requests'),

    accept: (id: string) => api.post(`/service-requests/${id}/accept`),

    complete: (id: string) => api.post(`/service-requests/${id}/complete`),
};

// Notification API
export const notificationApi = {
    getAll: () => api.get('/notifications'),

    markAsRead: (id: string) => api.post(`/notifications/${id}/read`),

    markAllAsRead: () => api.post('/notifications/read-all'),
};

// Household API
export const householdApi = {
    create: (data: { name: string; address?: Record<string, unknown> }) =>
        api.post('/households', data),

    get: (id: string) => api.get(`/households/${id}`),

    invite: (id: string, data: { contact: string; role: string }) =>
        api.post(`/households/${id}/invites`, data),

    getInvites: (id: string) => api.get(`/households/${id}/invites`),

    updateMember: (householdId: string, userId: string, data: { role: string }) =>
        api.patch(`/households/${householdId}/members/${userId}`, data),

    removeMember: (householdId: string, userId: string) =>
        api.delete(`/households/${householdId}/members/${userId}`),

    leave: (id: string) => api.post(`/households/${id}/leave`),
};

export default api;
