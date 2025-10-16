<script>
    import { login, isLoading } from '../stores/auth.js';
    import { showError, showSuccess } from '../stores/notifications.js';

    let email = 'admin@huellitas.com';
    let password = 'admin123';
    let errors = {};

    async function handleSubmit() {
        // Limpiar errores previos
        errors = {};

        // Validaciones básicas
        if (!email) {
            errors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'El email no es válido';
        }

        if (!password) {
            errors.password = 'La contraseña es requerida';
        } else if (password.length < 6) {
            errors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        // Si hay errores, no continuar
        if (Object.keys(errors).length > 0) {
            return;
        }

        // Intentar login
        const result = await login(email, password);

        if (result.success) {
            showSuccess('¡Bienvenido al sistema!');
            // La navegación se manejará automáticamente por el cambio de estado de autenticación
        } else {
            showError(result.message || 'Error al iniciar sesión');
        }
    }
</script>

<div class="login-container">
    <div class="login-card">
        <div class="login-header">
            <h1>🐾 HUELLITAS</h1>
            <p>Sistema de Gestión Veterinaria</p>
        </div>

        <form on:submit|preventDefault={handleSubmit} class="login-form">
            <div class="form-group">
                <label for="email">Email</label>
                <input
                    type="email"
                    id="email"
                    bind:value={email}
                    class:error={errors.email}
                    placeholder="Ingresa tu email"
                    disabled={$isLoading}
                />
                {#if errors.email}
                    <span class="error-message">{errors.email}</span>
                {/if}
            </div>

            <div class="form-group">
                <label for="password">Contraseña</label>
                <input
                    type="password"
                    id="password"
                    bind:value={password}
                    class:error={errors.password}
                    placeholder="Ingresa tu contraseña"
                    disabled={$isLoading}
                />
                {#if errors.password}
                    <span class="error-message">{errors.password}</span>
                {/if}
            </div>

            <button type="submit" class="login-button" disabled={$isLoading}>
                {#if $isLoading}
                    <span class="spinner"></span>
                    Iniciando sesión...
                {:else}
                    Iniciar Sesión
                {/if}
            </button>
        </form>

        <div class="login-footer">
            <p>Usuarios de prueba:</p>
            <small>
                Admin: admin@huellitas.com / password<br>
                Veterinario: vet1@huellitas.com / password<br>
                Recepcionista: rec1@huellitas.com / password
            </small>
        </div>
    </div>
</div>

<style>
    .login-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
    }

    .login-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        padding: 40px;
        width: 100%;
        max-width: 400px;
    }

    .login-header {
        text-align: center;
        margin-bottom: 30px;
    }

    .login-header h1 {
        color: #333;
        margin: 0 0 10px 0;
        font-size: 2.5rem;
        font-weight: bold;
    }

    .login-header p {
        color: #666;
        margin: 0;
        font-size: 1rem;
    }

    .login-form {
        margin-bottom: 20px;
    }

    .form-group {
        margin-bottom: 20px;
    }

    .form-group label {
        display: block;
        margin-bottom: 5px;
        color: #333;
        font-weight: 500;
    }

    .form-group input {
        width: 100%;
        padding: 12px;
        border: 2px solid #e1e5e9;
        border-radius: 8px;
        font-size: 16px;
        transition: border-color 0.3s ease;
        box-sizing: border-box;
    }

    .form-group input:focus {
        outline: none;
        border-color: #667eea;
    }

    .form-group input.error {
        border-color: #e74c3c;
    }

    .form-group input:disabled {
        background-color: #f8f9fa;
        cursor: not-allowed;
    }

    .error-message {
        color: #e74c3c;
        font-size: 14px;
        margin-top: 5px;
        display: block;
    }

    .login-button {
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }

    .login-button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .login-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
    }

    .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .login-footer {
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid #e1e5e9;
    }

    .login-footer p {
        margin: 0 0 10px 0;
        color: #666;
        font-weight: 500;
    }

    .login-footer small {
        color: #999;
        line-height: 1.4;
    }

    @media (max-width: 480px) {
        .login-card {
            padding: 30px 20px;
        }

        .login-header h1 {
            font-size: 2rem;
        }
    }
</style>