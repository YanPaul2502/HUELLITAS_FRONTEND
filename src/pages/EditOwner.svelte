<script>
    import { onMount } from 'svelte';
    import { navigate } from 'svelte-routing';
    import { showError, showSuccess } from '../stores/notifications.js';
    import ownersApi from '../services/owners.js';

    export let id;

    let formData = {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        document_type: 'CC',
        document_number: '',
        address: '',
        city: '',
        birth_date: '',
        gender: '',
        notes: ''
    };

    let isLoading = true;
    let isSubmitting = false;

    onMount(async () => {
        await loadOwner();
    });

    async function loadOwner() {
        isLoading = true;
        try {
            const owner = await ownersApi.getById(id);
            formData = {
                first_name: owner.first_name || '',
                last_name: owner.last_name || '',
                email: owner.email || '',
                phone: owner.phone || '',
                document_type: owner.document_type || 'CC',
                document_number: owner.document_number || '',
                address: owner.address || '',
                city: owner.city || '',
                birth_date: owner.birth_date || '',
                gender: owner.gender || '',
                notes: owner.notes || ''
            };
        } catch (error) {
            console.error('Error loading owner:', error);
            showError('Error al cargar el propietario');
            navigate('/owners');
        } finally {
            isLoading = false;
        }
    }

    async function handleSubmit() {
        if (isSubmitting) return;
        
        isSubmitting = true;
        try {
            await ownersApi.update(id, formData);
            showSuccess('Propietario actualizado exitosamente');
            navigate(`/owners/${id}`);
        } catch (error) {
            console.error('Error updating owner:', error);
            showError(error.response?.data?.message || 'Error al actualizar propietario');
        } finally {
            isSubmitting = false;
        }
    }

    function handleCancel() {
        navigate(`/owners/${id}`);
    }
</script>

<div class="edit-owner-page">
    {#if isLoading}
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Cargando información...</p>
        </div>
    {:else}
        <div class="page-header">
            <div class="header-content">
                <button class="btn-back" on:click={() => navigate(`/owners/${id}`)}>
                    ← Volver
                </button>
                <h1>✏️ Editar Propietario</h1>
                <p>Actualizar información del propietario</p>
            </div>
        </div>

        <div class="form-container">
            <form on:submit|preventDefault={handleSubmit} class="owner-form">
                <div class="form-section">
                    <h3>📋 Información Personal</h3>
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
                                <option value="TI">Tarjeta de Identidad</option>
                                <option value="PP">Pasaporte</option>
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
                            <label for="gender">Género</label>
                            <select
                                id="gender"
                                bind:value={formData.gender}
                                class="form-select"
                            >
                                <option value="">Seleccione</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="birth_date">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                id="birth_date"
                                bind:value={formData.birth_date}
                                class="form-input"
                            />
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3>📞 Información de Contacto</h3>
                    <div class="form-grid">
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
                </div>

                <div class="form-section">
                    <h3>📝 Notas Adicionales</h3>
                    <div class="form-group">
                        <label for="notes">Notas</label>
                        <textarea
                            id="notes"
                            bind:value={formData.notes}
                            class="form-textarea"
                            placeholder="Información adicional sobre el propietario"
                            rows="4"
                        ></textarea>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" on:click={handleCancel} class="btn-cancel">
                        Cancelar
                    </button>
                    <button type="submit" disabled={isSubmitting} class="btn-submit">
                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    {/if}
</div>

<style>
    .edit-owner-page {
        width: 100%;
        max-width: 1000px;
        margin: 0 auto;
    }

    .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
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

    .page-header {
        margin-bottom: 32px;
    }

    .btn-back {
        background: transparent;
        color: #64748b;
        border: none;
        padding: 8px 0;
        font-size: 1rem;
        cursor: pointer;
        margin-bottom: 8px;
        transition: color 0.2s ease;
    }

    .btn-back:hover {
        color: #3b82f6;
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

    .form-section {
        margin-bottom: 32px;
    }

    .form-section:last-of-type {
        margin-bottom: 0;
    }

    .form-section h3 {
        margin: 0 0 20px 0;
        color: #1e293b;
        font-size: 1.3rem;
        font-weight: 600;
        padding-bottom: 12px;
        border-bottom: 2px solid #e2e8f0;
    }

    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
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
    .form-select,
    .form-textarea {
        padding: 12px 16px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.2s ease;
        font-family: inherit;
    }

    .form-input:focus,
    .form-select:focus,
    .form-textarea:focus {
        outline: none;
        border-color: #3b82f6;
    }

    .form-textarea {
        resize: vertical;
        min-height: 100px;
    }

    .form-actions {
        display: flex;
        gap: 16px;
        justify-content: flex-end;
        margin-top: 32px;
        padding-top: 32px;
        border-top: 2px solid #e2e8f0;
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

        .form-container {
            padding: 20px;
        }
    }
</style>
