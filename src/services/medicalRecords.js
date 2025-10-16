import api from './api.js';

class MedicalRecordService {
    async getAll() {
        const response = await api.get('/medical-records');
        return response.data;
    }

    async getById(id) {
        const response = await api.get(`/medical-records/${id}`);
        return response.data;
    }

    async getByPet(petId) {
        const response = await api.get(`/medical-records?pet_id=${petId}`);
        return response.data;
    }

    async create(recordData) {
        const response = await api.post('/medical-records', recordData);
        return response.data;
    }

    async update(id, recordData) {
        const response = await api.put(`/medical-records/${id}`, recordData);
        return response.data;
    }

    async delete(id) {
        const response = await api.delete(`/medical-records/${id}`);
        return response.data;
    }
}

export default new MedicalRecordService();