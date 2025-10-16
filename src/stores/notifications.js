import { writable } from 'svelte/store';

// Store para las notificaciones
export const notifications = writable([]);

let notificationId = 0;

// Función para agregar una notificación
export function addNotification(message, type = 'info', duration = 5000) {
    const id = ++notificationId;
    const notification = {
        id,
        message,
        type, // 'success', 'error', 'warning', 'info'
        duration
    };

    notifications.update(items => [...items, notification]);

    // Auto-remover después del tiempo especificado
    if (duration > 0) {
        setTimeout(() => {
            removeNotification(id);
        }, duration);
    }

    return id;
}

// Función para remover una notificación
export function removeNotification(id) {
    notifications.update(items => items.filter(item => item.id !== id));
}

// Funciones de conveniencia
export function showSuccess(message, duration = 5000) {
    return addNotification(message, 'success', duration);
}

export function showError(message, duration = 7000) {
    return addNotification(message, 'error', duration);
}

export function showWarning(message, duration = 6000) {
    return addNotification(message, 'warning', duration);
}

export function showInfo(message, duration = 5000) {
    return addNotification(message, 'info', duration);
}

// Limpiar todas las notificaciones
export function clearNotifications() {
    notifications.set([]);
}