import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag to prevent multiple refresh calls
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

// Response interceptor for automatic token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const user = JSON.parse(localStorage.getItem('user'));

            if (!user?.refreshToken) {
                // No refresh token, redirect to login
                isRefreshing = false;
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const response = await axios.post(`${API_URL}/auth/refresh`, {
                    refreshToken: user.refreshToken
                });

                const { accessToken, refreshToken } = response.data;

                // Update stored tokens
                const updatedUser = { ...user, accessToken, refreshToken };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                // Update authorization header
                api.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
                originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;

                processQueue(null, accessToken);
                isRefreshing = false;

                // Retry original request
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const submitAppointmentRequest = async (data) => {
    try {
        const response = await api.post('/appointments/request', data);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const login = async (username, password) => {
    try {
        const response = await api.post('/auth/login', { username, password });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const refreshToken = async (refreshToken) => {
    try {
        const response = await api.post('/auth/refresh', { refreshToken });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const getAppointmentRequests = async (params) => {
    try {
        const token = JSON.parse(localStorage.getItem('user'))?.accessToken;
        const response = await api.get('/appointments', {
            params,
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const updateAppointmentStatus = async (requestId, status, patientDetails = null, appointmentDetails = null, patientHN = null) => {
    try {
        const token = JSON.parse(localStorage.getItem('user'))?.accessToken;
        const body = { status };
        if (patientDetails) {
            body.patientDetails = patientDetails;
        }
        if (appointmentDetails) {
            body.appointmentDetails = appointmentDetails;
        }
        if (patientHN) {
            body.patientHN = patientHN;
        }

        const response = await api.patch(`/appointments/${requestId}/status`,
            body,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};


// Patient API Methods
const getAuthDetails = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return { headers: { Authorization: `Bearer ${user?.accessToken}` } };
};

export const searchPatients = async (params) => {
    try {
        const response = await api.get('/patients', { ...getAuthDetails(), params });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const createPatient = async (data) => {
    try {
        const response = await api.post('/patients', data, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const getPatient = async (hn) => {
    try {
        const response = await api.get(`/patients/${hn}`, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const updatePatient = async (hn, data) => {
    try {
        const response = await api.patch(`/patients/${hn}`, data, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const deletePatient = async (hn) => {
    try {
        const response = await api.delete(`/patients/${hn}`, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Calendar API Methods
export const getCalendarAppointments = async (params) => {
    try {
        const response = await api.get('/appointments/calendar', { ...getAuthDetails(), params });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const createAppointment = async (data) => {
    try {
        const response = await api.post('/appointments', data, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const updateAppointment = async (id, data) => {
    try {
        const response = await api.patch(`/appointments/${id}`, data, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const deleteAppointment = async (id) => {
    try {
        const response = await api.delete(`/appointments/${id}`, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const getDentists = async () => {
    try {
        const response = await api.get('/users?role=dentist', getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Get dentist dashboard metrics
export const getDentistDashboardMetrics = async () => {
    try {
        const response = await api.get('/analytics/dentist', getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export default api;

// Treatment API Methods
export const getTreatments = async (params) => {
    try {
        const response = await api.get('/treatments', { ...getAuthDetails(), params });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const createTreatment = async (data) => {
    try {
        const response = await api.post('/treatments', data, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const updateTreatment = async (id, data) => {
    try {
        const response = await api.patch(`/treatments/${id}`, data, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const getTreatmentDetails = async (id) => {
    try {
        const response = await api.get(`/treatments/${id}`, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Invoice API Methods
export const getInvoices = async (params) => {
    try {
        const response = await api.get('/invoices', { ...getAuthDetails(), params });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const getInvoice = async (invoiceNumber) => {
    try {
        const response = await api.get(`/invoices/${invoiceNumber}`, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const createInvoice = async (data) => {
    try {
        const response = await api.post('/invoices', data, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const recordPayment = async (id, data) => {
    try {
        const response = await api.patch(`/invoices/${id}/payment`, data, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Analytics API Methods
export const getDashboardAnalytics = async (params) => {
    try {
        const response = await api.get('/analytics/dashboard', { ...getAuthDetails(), params });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Admin User Management API Methods
export const getAdminUsers = async (params) => {
    try {
        const response = await api.get('/admin/users', { ...getAuthDetails(), params });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const createAdminUser = async (data) => {
    try {
        const response = await api.post('/admin/users', data, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const updateAdminUser = async (id, data) => {
    try {
        const response = await api.patch(`/admin/users/${id}`, data, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const deactivateAdminUser = async (id) => {
    try {
        const response = await api.delete(`/admin/users/${id}`, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const activateAdminUser = async (id) => {
    try {
        const response = await api.post(`/admin/users/${id}/activate`, {}, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const resetAdminUserPassword = async (id, newPassword = null) => {
    try {
        const body = newPassword ? { newPassword } : {};
        const response = await api.post(`/admin/users/${id}/reset-password`, body, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const deleteAdminUser = async (id) => {
    try {
        const response = await api.delete(`/admin/users/${id}/hard-delete`, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Expense API Methods
export const getExpenses = async (params) => {
    try {
        const response = await api.get('/expenses', { ...getAuthDetails(), params });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const createExpense = async (data) => {
    try {
        const response = await api.post('/expenses', data, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const updateExpense = async (id, data) => {
    try {
        const response = await api.patch(`/expenses/${id}`, data, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const deleteExpense = async (id) => {
    try {
        const response = await api.delete(`/expenses/${id}`, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Inventory API Methods
export const getInventory = async (params) => {
    try {
        const response = await api.get('/inventory', { ...getAuthDetails(), params });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const createInventoryItem = async (data) => {
    try {
        const response = await api.post('/inventory', data, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const updateInventoryItem = async (id, data) => {
    try {
        const response = await api.patch(`/inventory/${id}`, data, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const deleteInventoryItem = async (id) => {
    try {
        const response = await api.delete(`/inventory/${id}`, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Service API Methods
export const getServices = async (params) => {
    try {
        const response = await api.get('/services', { ...getAuthDetails(), params });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const getPublicServices = async () => {
    try {
        const response = await api.get('/services/public');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const getServiceCategories = async () => {
    try {
        const response = await api.get('/services/categories');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const getServiceById = async (id) => {
    try {
        const response = await api.get(`/services/${id}`, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const createService = async (data) => {
    try {
        const response = await api.post('/services', data, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const updateService = async (id, data) => {
    try {
        const response = await api.put(`/services/${id}`, data, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const deleteService = async (id) => {
    try {
        const response = await api.delete(`/services/${id}`, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const toggleServiceStatus = async (id) => {
    try {
        const response = await api.patch(`/services/${id}/toggle`, {}, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Dentist Profile API Methods
export const getDentistProfiles = async () => {
    try {
        const response = await api.get('/dentist-profiles', getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const getDentistProfileByUserId = async (userId) => {
    try {
        const response = await api.get(`/dentist-profiles/user/${userId}`, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const getDentistProfileById = async (id) => {
    try {
        const response = await api.get(`/dentist-profiles/${id}`, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const upsertDentistProfile = async (userId, data) => {
    try {
        const config = getAuthDetails();
        if (data instanceof FormData) {
            config.headers['Content-Type'] = undefined;
        }
        const response = await api.put(`/dentist-profiles/user/${userId}`, data, config);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const updateDentistServices = async (profileId, data) => {
    try {
        const response = await api.put(`/dentist-profiles/${profileId}/services`, data, getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const getSpecializations = async () => {
    try {
        const response = await api.get('/dentist-profiles/specializations', getAuthDetails());
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// User Profile API Methods
export const updateUserProfile = async (userId, data) => {
    try {
        const config = getAuthDetails();
        if (data instanceof FormData) {
            config.headers['Content-Type'] = 'multipart/form-data';
        }
        const response = await api.patch(`/users/${userId}/profile`, data, config);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};
