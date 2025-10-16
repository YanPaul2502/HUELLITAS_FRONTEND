import { writable } from 'svelte/store';
import authService from '../services/auth.js';

// Store para el usuario autenticado
export const user = writable(null);

// Store para el estado de autenticación
export const isAuthenticated = writable(false);

// Store para el estado de carga
export const isLoading = writable(false);

// Función para inicializar el estado de autenticación
export function initAuth() {
    if (authService.isAuthenticated()) {
        const currentUser = authService.getCurrentUser();
        user.set(currentUser);
        isAuthenticated.set(true);
    }
}

// Función para login
export async function login(email, password) {
    isLoading.set(true);
    
    try {
        const result = await authService.login(email, password);
        
        if (result.success) {
            user.set(result.user);
            isAuthenticated.set(true);
        }
        
        isLoading.set(false);
        return result;
    } catch (error) {
        isLoading.set(false);
        return { success: false, message: 'Error de conexión' };
    }
}

// Función para logout
export async function logout() {
    isLoading.set(true);
    
    try {
        await authService.logout();
    } finally {
        user.set(null);
        isAuthenticated.set(false);
        isLoading.set(false);
    }
}

// Función para verificar roles
export function hasRole(role) {
    return authService.hasRole(role);
}

export function hasAnyRole(roles) {
    return authService.hasAnyRole(roles);
}