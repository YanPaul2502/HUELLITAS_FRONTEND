import api from './api.js';

class OwnerService {
    async getAll() {
        const response = await api.get('/owners');
        return response.data;
    }

    async getById(id) {
        const response = await api.get(`/owners/${id}`);
        return response.data;
    }

    async create(ownerData) {
        const response = await api.post('/owners', ownerData);
        return response.data;
    }

    async update(id, ownerData) {
        const response = await api.put(`/owners/${id}`, ownerData);
        return response.data;
    }

    async delete(id) {
        const response = await api.delete(`/owners/${id}`);
        return response.data;
    }
}

export default new OwnerService();