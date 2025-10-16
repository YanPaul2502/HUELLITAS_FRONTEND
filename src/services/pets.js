import api from './api.js';

class PetService {
    async getAll() {
        try {
            const response = await api.get('/pets');
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener mascotas'
            };
        }
    }

    async getById(id) {
        try {
            const response = await api.get(`/pets/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener mascota'
            };
        }
    }

    async getByOwner(ownerId) {
        try {
            const response = await api.get(`/pets?owner_id=${ownerId}`);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener mascotas del propietario'
            };
        }
    }

    async create(petData) {
        try {
            const response = await api.post('/pets', petData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al crear mascota',
                errors: error.response?.data?.errors
            };
        }
    }

    async update(id, petData) {
        try {
            const response = await api.put(`/pets/${id}`, petData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al actualizar mascota',
                errors: error.response?.data?.errors
            };
        }
    }

    async delete(id) {
        try {
            await api.delete(`/pets/${id}`);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al eliminar mascota'
            };
        }
    }
}

export default new PetService();