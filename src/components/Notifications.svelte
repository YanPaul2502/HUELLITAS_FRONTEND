<script>
    import { notifications, removeNotification } from '../stores/notifications.js';
    import { fade, fly } from 'svelte/transition';

    function getIcon(type) {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return 'ℹ️';
        }
    }

    function getTypeClass(type) {
        switch (type) {
            case 'success': return 'notification-success';
            case 'error': return 'notification-error';
            case 'warning': return 'notification-warning';
            case 'info': return 'notification-info';
            default: return 'notification-info';
        }
    }
</script>

<div class="notifications-container">
    {#each $notifications as notification (notification.id)}
        <div
            class="notification {getTypeClass(notification.type)}"
            in:fly="{{ y: -50, duration: 300 }}"
            out:fade="{{ duration: 200 }}"
        >
            <div class="notification-content">
                <span class="notification-icon">{getIcon(notification.type)}</span>
                <span class="notification-message">{notification.message}</span>
            </div>
            <button
                class="notification-close"
                on:click={() => removeNotification(notification.id)}
                aria-label="Cerrar notificación"
            >
                ×
            </button>
        </div>
    {/each}
</div>

<style>
    .notifications-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
        width: 100%;
    }

    .notification {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
    }

    .notification-icon {
        font-size: 18px;
        flex-shrink: 0;
    }

    .notification-message {
        color: white;
        font-weight: 500;
        line-height: 1.4;
    }

    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
        flex-shrink: 0;
        margin-left: 12px;
    }

    .notification-close:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }

    .notification-success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .notification-error {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }

    .notification-warning {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    .notification-info {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    }

    @media (max-width: 480px) {
        .notifications-container {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
        }

        .notification {
            padding: 12px;
        }

        .notification-message {
            font-size: 14px;
        }
    }
</style>