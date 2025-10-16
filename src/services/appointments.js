import api from './api.js';

class AppointmentService {
    async getAll() {
        const response = await api.get('/appointments');
        return response.data;
    }

    async getById(id) {
        const response = await api.get(`/appointments/${id}`);
        return response.data;
    }

    async getByDate(date) {
        const response = await api.get(`/appointments?date=${date}`);
        return response.data;
    }

    async getByVeterinarian(veterinarianId, date = null) {
        let url = `/appointments?veterinarian_id=${veterinarianId}`;
        if (date) url += `&date=${date}`;
        const response = await api.get(url);
        return response.data;
    }

    async create(appointmentData) {
        const response = await api.post('/appointments', appointmentData);
        return response.data;
    }

    async update(id, appointmentData) {
        const response = await api.put(`/appointments/${id}`, appointmentData);
        return response.data;
    }

    async cancel(id) {
        const response = await api.delete(`/appointments/${id}`);
        return response.data;
    }

    async reschedule(id, newDateTime) {
        const response = await api.put(`/appointments/${id}`, {
            appointment_date: newDateTime
        });
        return response.data;
    }
}

export default new AppointmentService();