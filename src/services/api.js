import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Crear instancia de axios
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor para agregar token JWT a las requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Funciones específicas para el dashboard
export const dashboardApi = {
    async getStats() {
        try {
            const [ownersRes, petsRes, appointmentsRes, servicesRes] = await Promise.all([
                api.get('/owners'),
                api.get('/pets'),
                api.get('/appointments'),
                api.get('/services')
            ]);

            const today = new Date().toISOString().split('T')[0];
            const todayAppointments = appointmentsRes.data.filter(apt => 
                apt.appointment_date && apt.appointment_date.startsWith(today)
            );

            const pendingAppointments = appointmentsRes.data.filter(apt => 
                apt.status === 'programada' || apt.status === 'confirmada'
            );

            return {
                totalOwners: ownersRes.data.length,
                totalPets: petsRes.data.length,
                todayAppointments: todayAppointments.length,
                pendingAppointments: pendingAppointments.length,
                totalServices: servicesRes.data.length,
                recentAppointments: appointmentsRes.data.slice(0, 5)
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    async getTodayAppointments() {
        try {
            const response = await api.get('/appointments');
            const today = new Date().toISOString().split('T')[0];
            return response.data.filter(apt => 
                apt.appointment_date && apt.appointment_date.startsWith(today)
            );
        } catch (error) {
            console.error('Error fetching today appointments:', error);
            throw error;
        }
    }
};

// Funciones para cada entidad
export const ownersApi = {
    getAll: () => api.get('/owners'),
    getById: (id) => api.get(`/owners/${id}`),
    create: (data) => api.post('/owners', data),
    update: (id, data) => api.put(`/owners/${id}`, data),
    delete: (id) => api.delete(`/owners/${id}`)
};

export const petsApi = {
    getAll: () => api.get('/pets'),
    getById: (id) => api.get(`/pets/${id}`),
    create: (data) => api.post('/pets', data),
    update: (id, data) => api.put(`/pets/${id}`, data),
    delete: (id) => api.delete(`/pets/${id}`)
};

export const appointmentsApi = {
    getAll: () => api.get('/appointments'),
    getById: (id) => api.get(`/appointments/${id}`),
    create: (data) => api.post('/appointments', data),
    update: (id, data) => api.put(`/appointments/${id}`, data),
    delete: (id) => api.delete(`/appointments/${id}`)
};

export const servicesApi = {
    getAll: () => api.get('/services'),
    getById: (id) => api.get(`/services/${id}`),
    create: (data) => api.post('/services', data),
    update: (id, data) => api.put(`/services/${id}`, data),
    delete: (id) => api.delete(`/services/${id}`)
};

export const medicalRecordsApi = {
    getAll: () => api.get('/medical-records'),
    getById: (id) => api.get(`/medical-records/${id}`),
    create: (data) => api.post('/medical-records', data),
    update: (id, data) => api.put(`/medical-records/${id}`, data),
    delete: (id) => api.delete(`/medical-records/${id}`)
};

export const vaccinationsApi = {
    getAll: () => api.get('/vaccinations'),
    getById: (id) => api.get(`/vaccinations/${id}`),
    create: (data) => api.post('/vaccinations', data),
    update: (id, data) => api.put(`/vaccinations/${id}`, data),
    delete: (id) => api.delete(`/vaccinations/${id}`)
};

export const reportsApi = {
    appointments: (params) => api.get('/reports/appointments', { params }),
    owners: () => api.get('/reports/owners'),
    pets: () => api.get('/reports/pets'),
    medicalRecords: (params) => api.get('/reports/medical-records', { params }),
    vaccinations: (params) => api.get('/reports/vaccinations', { params }),
    services: () => api.get('/reports/services')
};

export const activityLogsApi = {
    getAll: (params) => api.get('/activity-logs', { params }),
    getById: (id) => api.get(`/activity-logs/${id}`)
};

export default api;