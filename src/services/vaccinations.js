import api from './api.js';

class VaccinationService {
    async getAll() {
        try {
            const response = await api.get('/vaccinations');
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener vacunaciones'
            };
        }
    }

    async getById(id) {
        try {
            const response = await api.get(`/vaccinations/${id}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener vacunación'
            };
        }
    }

    async getByPet(petId) {
        try {
            const response = await api.get(`/vaccinations?pet_id=${petId}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener vacunaciones de la mascota'
            };
        }
    }

    async getDueVaccinations() {
        try {
            const response = await api.get('/vaccinations?status=due');
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener vacunaciones pendientes'
            };
        }
    }

    async create(vaccinationData) {
        try {
            const response = await api.post('/vaccinations', vaccinationData);
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al crear vacunación',
                errors: error.response?.data?.errors
            };
        }
    }

    async update(id, vaccinationData) {
        try {
            const response = await api.put(`/vaccinations/${id}`, vaccinationData);
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al actualizar vacunación',
                errors: error.response?.data?.errors
            };
        }
    }

    async delete(id) {
        try {
            await api.delete(`/vaccinations/${id}`);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al eliminar vacunación'
            };
        }
    }
}

export default new VaccinationService();