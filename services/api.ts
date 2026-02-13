// API Configuration
// Use environment variable for production, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('https://', 'wss://').replace('http://', 'ws://')
    : 'ws://localhost:8000';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
    return localStorage.getItem('token');
};

// API Client with authentication
export const apiClient = {
    async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = getAuthToken();
        console.log('[API] Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null');

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        };

        console.log('[API] Request to:', `${API_BASE_URL}/api${endpoint}`, 'with auth:', !!token);

        const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Request failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    },

    get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    },

    post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    put<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    },
};

// Auth API
export const authAPI = {
    login: (email: string, password: string) =>
        apiClient.post<{ access_token: string; token_type: string }>('/auth/login', {
            email,
            password,
        }),

    register: (data: { email: string; password: string; name: string; role?: string }) =>
        apiClient.post('/auth/register', data),

    getCurrentUser: () => apiClient.get('/auth/me'),

    refreshToken: () => apiClient.post('/auth/refresh'),
};

// Services API
export const servicesAPI = {
    list: (activeOnly = true) =>
        apiClient.get(`/services?active_only=${activeOnly}`),

    get: (id: number) => apiClient.get(`/services/${id}`),

    create: (data: { name: string; description?: string; avg_duration_minutes: number }) =>
        apiClient.post('/services', data),

    update: (id: number, data: any) => apiClient.put(`/services/${id}`, data),

    delete: (id: number) => apiClient.delete(`/services/${id}`),
};

// Slots API
export const slotsAPI = {
    list: (params?: { service_id?: number; date?: string; status?: string }) => {
        const query = new URLSearchParams(
            Object.entries(params || {}).filter(([_, v]) => v != null) as [string, string][]
        ).toString();
        return apiClient.get(`/slots?${query}`);
    },

    get: (id: number) => apiClient.get(`/slots/${id}`),

    getAvailability: (id: number) => apiClient.get(`/slots/${id}/availability`),

    create: (data: any) => apiClient.post('/slots', data),

    update: (id: number, data: any) => apiClient.put(`/slots/${id}`, data),
};

// Appointments API
export const appointmentsAPI = {
    book: (data: { slot_id: number; service_id: number }) =>
        apiClient.post('/appointments/book', data),

    myBookings: () => apiClient.get('/appointments/my-bookings'),

    get: (id: number) => apiClient.get(`/appointments/${id}`),

    cancel: (id: number) => apiClient.put(`/appointments/${id}/cancel`, {}),

    getQueueStatus: (id: number) => apiClient.get(`/appointments/${id}/queue-status`),
};

// Predictions API
export const predictionsAPI = {
    getSlotPrediction: (slotId: number) =>
        apiClient.get(`/predictions/slot/${slotId}`),

    getPeakHours: (serviceId: number) =>
        apiClient.get(`/predictions/peak-hours?service_id=${serviceId}`),
};

// Recommendations API
export const recommendationsAPI = {
    getAlternativeSlots: (slotId: number, limit = 5) =>
        apiClient.get(`/recommendations/alternative-slots/${slotId}?limit=${limit}`),

    getBestTimes: (serviceId: number, date?: string, limit = 10) => {
        const query = date ? `&date=${date}` : '';
        return apiClient.get(`/recommendations/best-times?service_id=${serviceId}${query}&limit=${limit}`);
    },
};

// Admin API
export const adminAPI = {
    getMetrics: () => apiClient.get('/admin/metrics'),

    getSlotUtilization: (startDate: string, endDate: string) =>
        apiClient.get(`/admin/slot-utilization?start_date=${startDate}&end_date=${endDate}`),

    bulkCreateSlots: (data: {
        service_id: number;
        start_date: string;
        end_date: string;
        time_slots: [string, string][];
        capacity: number;
    }) => apiClient.post('/admin/slots/bulk-create', data),
};

// Analytics API
export const analyticsAPI = {
    getOverview: (startDate?: string, endDate?: string) => {
        const query = new URLSearchParams();
        if (startDate) query.append('start_date', startDate);
        if (endDate) query.append('end_date', endDate);
        return apiClient.get(`/analytics/overview?${query}`);
    },

    getServicePerformance: (startDate?: string, endDate?: string) => {
        const query = new URLSearchParams();
        if (startDate) query.append('start_date', startDate);
        if (endDate) query.append('end_date', endDate);
        return apiClient.get(`/analytics/service-performance?${query}`);
    },

    getDailyStats: (startDate: string, endDate: string) =>
        apiClient.get(`/analytics/daily-stats?start_date=${startDate}&end_date=${endDate}`),

    exportServicePerformance: (startDate?: string, endDate?: string) => {
        const query = new URLSearchParams();
        if (startDate) query.append('start_date', startDate);
        if (endDate) query.append('end_date', endDate);
        return `${API_BASE_URL}/api/analytics/export/service-performance?${query}`;
    },

    exportDailyStats: (startDate: string, endDate: string) =>
        `${API_BASE_URL}/api/analytics/export/daily-stats?start_date=${startDate}&end_date=${endDate}`,
};

// WebSocket URLs
export const wsURLs = {
    queue: `${WS_BASE_URL}/ws/queue`,
    slots: `${WS_BASE_URL}/ws/slots`,
    admin: `${WS_BASE_URL}/ws/admin`,
    user: (userId: number) => `${WS_BASE_URL}/ws/user/${userId}`,
};
