import api from './api.js';

class VaccinationService {
    async getAll() {
        const response = await api.get('/vaccinations');
        return response.data;
    }

    async getById(id) {
        const response = await api.get(`/vaccinations/${id}`);
        return response.data;
    }

    async getByPet(petId) {
        const response = await api.get(`/vaccinations?pet_id=${petId}`);
        return response.data;
    }

    async getDueVaccinations() {
        const response = await api.get('/vaccinations?status=due');
        return response.data;
    }

    async create(vaccinationData) {
        const response = await api.post('/vaccinations', vaccinationData);
        return response.data;
    }

    async update(id, vaccinationData) {
        const response = await api.put(`/vaccinations/${id}`, vaccinationData);
        return response.data;
    }

    async delete(id) {
        const response = await api.delete(`/vaccinations/${id}`);
        return response.data;
    }
}

export default new VaccinationService();