import api from './api.js';

class OwnerService {
    async getAll() {
        try {
            const response = await api.get('/owners');
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener propietarios'
            };
        }
    }

    async getById(id) {
        try {
            const response = await api.get(`/owners/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener propietario'
            };
        }
    }

    async create(ownerData) {
        try {
            const response = await api.post('/owners', ownerData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al crear propietario',
                errors: error.response?.data?.errors
            };
        }
    }

    async update(id, ownerData) {
        try {
            const response = await api.put(`/owners/${id}`, ownerData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al actualizar propietario',
                errors: error.response?.data?.errors
            };
        }
    }

    async delete(id) {
        try {
            await api.delete(`/owners/${id}`);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al eliminar propietario'
            };
        }
    }
}

export default new OwnerService();