import api from './api.js';

class MedicalRecordService {
    async getAll() {
        try {
            const response = await api.get('/medical-records');
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener registros médicos'
            };
        }
    }

    async getById(id) {
        try {
            const response = await api.get(`/medical-records/${id}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener registro médico'
            };
        }
    }

    async getByPet(petId) {
        try {
            const response = await api.get(`/medical-records?pet_id=${petId}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener registros médicos de la mascota'
            };
        }
    }

    async create(recordData) {
        try {
            const response = await api.post('/medical-records', recordData);
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al crear registro médico',
                errors: error.response?.data?.errors
            };
        }
    }

    async update(id, recordData) {
        try {
            const response = await api.put(`/medical-records/${id}`, recordData);
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al actualizar registro médico',
                errors: error.response?.data?.errors
            };
        }
    }

    async delete(id) {
        try {
            await api.delete(`/medical-records/${id}`);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al eliminar registro médico'
            };
        }
    }
}

export default new MedicalRecordService();