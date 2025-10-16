import api from './api.js';

class AppointmentService {
    async getAll() {
        try {
            const response = await api.get('/appointments');
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener citas'
            };
        }
    }

    async getById(id) {
        try {
            const response = await api.get(`/appointments/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener cita'
            };
        }
    }

    async getByDate(date) {
        try {
            const response = await api.get(`/appointments?date=${date}`);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener citas por fecha'
            };
        }
    }

    async getByVeterinarian(veterinarianId, date = null) {
        try {
            let url = `/appointments?veterinarian_id=${veterinarianId}`;
            if (date) url += `&date=${date}`;
            const response = await api.get(url);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener citas del veterinario'
            };
        }
    }

    async create(appointmentData) {
        try {
            const response = await api.post('/appointments', appointmentData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al crear cita',
                errors: error.response?.data?.errors
            };
        }
    }

    async update(id, appointmentData) {
        try {
            const response = await api.put(`/appointments/${id}`, appointmentData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al actualizar cita',
                errors: error.response?.data?.errors
            };
        }
    }

    async cancel(id) {
        try {
            const response = await api.delete(`/appointments/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al cancelar cita'
            };
        }
    }

    async reschedule(id, newDateTime) {
        try {
            const response = await api.put(`/appointments/${id}`, {
                appointment_date: newDateTime
            });
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al reprogramar cita',
                errors: error.response?.data?.errors
            };
        }
    }
}

export default new AppointmentService();