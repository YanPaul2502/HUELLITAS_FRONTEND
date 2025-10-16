<script>
    import { navigate } from 'svelte-routing';
    import { showError, showSuccess } from '../stores/notifications.js';
    import ownersApi from '../services/owners.js';

    let formData = {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        document_type: 'CC',
        document_number: '',
        address: '',
        city: ''
    };

    let isSubmitting = false;

    async function handleSubmit() {
        if (isSubmitting) return;
        
        isSubmitting = true;
        try {
            await ownersApi.create(formData);
            showSuccess('Propietario creado exitosamente');
            navigate('/owners');
        } catch (error) {
            console.error('Error creating owner:', error);
            showError(error.response?.data?.message || 'Error al crear propietario');
        } finally {
            isSubmitting = false;
        }
    }

    function handleCancel() {
        navigate('/owners');
    }
</script>

<div class="new-owner-page">
    <div class="page-header">
        <div class="header-content">
            <h1>👤 Nuevo Propietario</h1>
            <p>Registrar un nuevo propietario de mascota</p>
        </div>
    </div>

    <div class="form-container">
        <form on:submit|preventDefault={handleSubmit} class="owner-form">
            <div class="form-grid">
                <div class="form-group">
                    <label for="first_name">Nombre *</label>
                    <input
                        type="text"
                        id="first_name"
                        bind:value={formData.first_name}
                        required
                        class="form-input"
                        placeholder="Ingrese el nombre"
                    />
                </div>

                <div class="form-group">
                    <label for="last_name">Apellido *</label>
                    <input
                        type="text"
                        id="last_name"
                        bind:value={formData.last_name}
                        required
                        class="form-input"
                        placeholder="Ingrese el apellido"
                    />
                </div>

                <div class="form-group">
                    <label for="document_type">Tipo de Documento *</label>
                    <select
                        id="document_type"
                        bind:value={formData.document_type}
                        required
                        class="form-select"
                    >
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="PA">Pasaporte</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="document_number">Número de Documento *</label>
                    <input
                        type="text"
                        id="document_number"
                        bind:value={formData.document_number}
                        required
                        class="form-input"
                        placeholder="Ingrese el número de documento"
                    />
                </div>

                <div class="form-group">
                    <label for="email">Email *</label>
                    <input
                        type="email"
                        id="email"
                        bind:value={formData.email}
                        required
                        class="form-input"
                        placeholder="ejemplo@correo.com"
                    />
                </div>

                <div class="form-group">
                    <label for="phone">Teléfono *</label>
                    <input
                        type="tel"
                        id="phone"
                        bind:value={formData.phone}
                        required
                        class="form-input"
                        placeholder="Ingrese el teléfono"
                    />
                </div>

                <div class="form-group full-width">
                    <label for="address">Dirección</label>
                    <input
                        type="text"
                        id="address"
                        bind:value={formData.address}
                        class="form-input"
                        placeholder="Ingrese la dirección"
                    />
                </div>

                <div class="form-group">
                    <label for="city">Ciudad</label>
                    <input
                        type="text"
                        id="city"
                        bind:value={formData.city}
                        class="form-input"
                        placeholder="Ingrese la ciudad"
                    />
                </div>
            </div>

            <div class="form-actions">
                <button type="button" on:click={handleCancel} class="btn-cancel">
                    Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} class="btn-submit">
                    {isSubmitting ? 'Guardando...' : 'Guardar Propietario'}
                </button>
            </div>
        </form>
    </div>
</div>

<style>
    .new-owner-page {
        width: 100%;
        max-width: 900px;
        margin: 0 auto;
    }

    .page-header {
        margin-bottom: 32px;
    }

    .header-content h1 {
        margin: 0 0 8px 0;
        color: #1e293b;
        font-size: 2rem;
        font-weight: 700;
    }

    .header-content p {
        margin: 0;
        color: #64748b;
        font-size: 1.1rem;
    }

    .form-container {
        background: white;
        border-radius: 12px;
        padding: 32px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
    }

    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-bottom: 32px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
    }

    .form-group.full-width {
        grid-column: 1 / -1;
    }

    .form-group label {
        margin-bottom: 8px;
        color: #374151;
        font-weight: 500;
        font-size: 0.9rem;
    }

    .form-input,
    .form-select {
        padding: 12px 16px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.2s ease;
    }

    .form-input:focus,
    .form-select:focus {
        outline: none;
        border-color: #3b82f6;
    }

    .form-actions {
        display: flex;
        gap: 16px;
        justify-content: flex-end;
    }

    .btn-cancel {
        background: transparent;
        color: #64748b;
        border: 1px solid #e2e8f0;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-cancel:hover {
        background: #f8fafc;
        color: #1e293b;
    }

    .btn-submit {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-submit:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }

    .btn-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    @media (max-width: 768px) {
        .form-grid {
            grid-template-columns: 1fr;
        }

        .form-actions {
            flex-direction: column;
        }
    }
</style>