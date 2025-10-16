<script>
    import { isAuthenticated, hasAnyRole } from '../stores/auth.js';
    import { navigate } from 'svelte-routing';
    import { onMount } from 'svelte';

    export let roles = []; // Roles permitidos para acceder a esta ruta
    export let redirectTo = '/login'; // Ruta de redirección si no está autenticado

    let isAuthorized = false;
    let isLoading = true;

    onMount(() => {
        checkAuthorization();
    });

    function checkAuthorization() {
        // Verificar si está autenticado
        if (!$isAuthenticated) {
            navigate(redirectTo);
            return;
        }

        // Si no se especifican roles, solo verificar autenticación
        if (roles.length === 0) {
            isAuthorized = true;
            isLoading = false;
            return;
        }

        // Verificar si tiene alguno de los roles requeridos
        if (hasAnyRole(roles)) {
            isAuthorized = true;
        } else {
            // Redirigir al dashboard si no tiene permisos
            navigate('/dashboard');
            return;
        }

        isLoading = false;
    }

    // Reactivar cuando cambie el estado de autenticación
    $: if ($isAuthenticated !== undefined) {
        checkAuthorization();
    }
</script>

{#if isLoading}
    <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Verificando permisos...</p>
    </div>
{:else if isAuthorized}
    <slot />
{:else}
    <div class="unauthorized-container">
        <div class="unauthorized-content">
            <h2>🚫 Acceso Denegado</h2>
            <p>No tienes permisos para acceder a esta página.</p>
            <button on:click={() => navigate('/dashboard')} class="back-button">
                Volver al Dashboard
            </button>
        </div>
    </div>
{/if}

<style>
    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        color: #64748b;
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e2e8f0;
        border-top: 4px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .unauthorized-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        padding: 20px;
    }

    .unauthorized-content {
        text-align: center;
        background: white;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        max-width: 400px;
        width: 100%;
    }

    .unauthorized-content h2 {
        color: #ef4444;
        margin: 0 0 16px 0;
        font-size: 1.5rem;
    }

    .unauthorized-content p {
        color: #64748b;
        margin: 0 0 24px 0;
        line-height: 1.6;
    }

    .back-button {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .back-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
    }
</style>