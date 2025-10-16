import api from './api.js';
import { jwtDecode } from 'jwt-decode';

class AuthService {
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', {
                email,
                password
            });

            const { access_token, user } = response.data;
            
            // Guardar token y usuario en localStorage
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));
            
            return { success: true, user, token: access_token };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al iniciar sesión'
            };
        }
    }

    async logout() {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            // Limpiar localStorage independientemente del resultado
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }

    async refreshToken() {
        try {
            const response = await api.post('/auth/refresh');
            const { access_token } = response.data;
            
            localStorage.setItem('token', access_token);
            return access_token;
        } catch (error) {
            this.logout();
            throw error;
        }
    }

    isAuthenticated() {
        const token = localStorage.getItem('token');
        if (!token) return false;

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            
            // Verificar si el token ha expirado
            if (decoded.exp < currentTime) {
                this.logout();
                return false;
            }
            
            return true;
        } catch (error) {
            this.logout();
            return false;
        }
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    getToken() {
        return localStorage.getItem('token');
    }

    hasRole(role) {
        const user = this.getCurrentUser();
        return user?.role?.name === role;
    }

    hasAnyRole(roles) {
        const user = this.getCurrentUser();
        return roles.includes(user?.role?.name);
    }
}

export default new AuthService();