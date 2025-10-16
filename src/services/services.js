import api from './api.js';

class ServiceService {
    async getAll() {
        const response = await api.get('/services');
        return response.data;
    }

    async getById(id) {
        const response = await api.get(`/services/${id}`);
        return response.data;
    }

    async getActive() {
        const response = await api.get('/services?status=active');
        return response.data;
    }

    async create(serviceData) {
        const response = await api.post('/services', serviceData);
        return response.data;
    }

    async update(id, serviceData) {
        const response = await api.put(`/services/${id}`, serviceData);
        return response.data;
    }

    async delete(id) {
        const response = await api.delete(`/services/${id}`);
        return response.data;
    }
}

export default new ServiceService();