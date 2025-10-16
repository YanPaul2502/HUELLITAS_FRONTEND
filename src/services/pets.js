import api from './api.js';

class PetService {
    async getAll() {
        const response = await api.get('/pets');
        return response.data;
    }

    async getById(id) {
        const response = await api.get(`/pets/${id}`);
        return response.data;
    }

    async getByOwner(ownerId) {
        const response = await api.get(`/pets?owner_id=${ownerId}`);
        return response.data;
    }

    async create(petData) {
        const response = await api.post('/pets', petData);
        return response.data;
    }

    async update(id, petData) {
        const response = await api.put(`/pets/${id}`, petData);
        return response.data;
    }

    async delete(id) {
        const response = await api.delete(`/pets/${id}`);
        return response.data;
    }
}

export default new PetService();