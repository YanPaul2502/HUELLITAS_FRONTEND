import api from './api.js';

class ServiceService {
    async getAll() {
        try {
            const response = await api.get('/services');
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener servicios'
            };
        }
    }

    async getById(id) {
        try {
            const response = await api.get(`/services/${id}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener servicio'
            };
        }
    }

    async getActive() {
        try {
            const response = await api.get('/services?status=active');
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener servicios activos'
            };
        }
    }

    async create(serviceData) {
        try {
            const response = await api.post('/services', serviceData);
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al crear servicio',
                errors: error.response?.data?.errors
            };
        }
    }

    async update(id, serviceData) {
        try {
            const response = await api.put(`/services/${id}`, serviceData);
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al actualizar servicio',
                errors: error.response?.data?.errors
            };
        }
    }

    async delete(id) {
        try {
            await api.delete(`/services/${id}`);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al eliminar servicio'
            };
        }
    }
}

export default new ServiceService();