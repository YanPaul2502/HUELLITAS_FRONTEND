<script>
    import { onMount } from 'svelte';
    import { navigate } from 'svelte-routing';
    import { showError, showSuccess } from '../stores/notifications.js';
    import vaccinationsApi from '../services/vaccinations.js';
    import petsApi from '../services/pets.js';
    import { user } from '../stores/auth.js';

    let formData = {
        pet_id: '',
        veterinarian_id: '',
        medical_record_id: '',
        type: 'vacuna',
        name: '',
        brand: '',
        batch_number: '',
        application_date: new Date().toISOString().split('T')[0],
        expiration_date: '',
        next_dose_date: '',
        weight_at_application: '',
        adverse_reactions: '',
        notes: ''
    };

    let pets = [];
    let isLoading = true;
    let isSubmitting = false;

    onMount(async () => {
        await loadPets();
        // Obtener el ID del usuario actual (veterinario)
        const currentUser = $user;
        if (currentUser && currentUser.id) {
            formData.veterinarian_id = currentUser.id;
        }
    });

    async function loadPets() {
        isLoading = true;
        try {
            pets = await petsApi.getAll();
        } catch (error) {
            console.error('Error loading pets:', error);
            showError('Error al cargar las mascotas');
        } finally {
            isLoading = false;
        }
    }

    async function handleSubmit() {
        if (isSubmitting) return;
        
        // Validación básica
        if (!formData.pet_id) {
            showError('Debe seleccionar una mascota');
            return;
        }

        if (!formData.veterinarian_id) {
            showError('No se pudo identificar al veterinario');
            return;
        }

        isSubmitting = true;
        try {
            // Limpiar campos vacíos opcionales
            const dataToSubmit = { ...formData };
            if (!dataToSubmit.medical_record_id) delete dataToSubmit.medical_record_id;
            if (!dataToSubmit.brand) delete dataToSubmit.brand;
            if (!dataToSubmit.batch_number) delete dataToSubmit.batch_number;
            if (!dataToSubmit.expiration_date) delete dataToSubmit.expiration_date;
            if (!dataToSubmit.next_dose_date) delete dataToSubmit.next_dose_date;
            if (!dataToSubmit.weight_at_application) delete dataToSubmit.weight_at_application;
            if (!dataToSubmit.adverse_reactions) delete dataToSubmit.adverse_reactions;
            if (!dataToSubmit.notes) delete dataToSubmit.notes;

            await vaccinationsApi.create(dataToSubmit);
            showSuccess('Vacunación registrada exitosamente');
            navigate('/vaccinations');
        } catch (error) {
            console.error('Error creating vaccination:', error);
            showError(error.response?.data?.message || 'Error al registrar la vacunación');
        } finally {
            isSubmitting = false;
        }
    }

    function handleCancel() {
        navigate('/vaccinations');
    }

    // Calcular fecha de expiración sugerida basada en el tipo de vacuna
    function updateExpirationSuggestion() {
        if (formData.application_date && formData.name) {
            const appDate = new Date(formData.application_date);
            let monthsToAdd = 12; // Por defecto 1 año

            // Sugerencias basadas en vacunas comunes
            const vaccineName = formData.name.toLowerCase();
            if (vaccineName.includes('rabia')) {
                monthsToAdd = 12;
            } else if (vaccineName.includes('parvovirus') || vaccineName.includes('distemper')) {
                monthsToAdd = 12;
            } else if (vaccineName.includes('desparasit')) {
                monthsToAdd = 3;
            }

            const expDate = new Date(appDate);
            expDate.setMonth(expDate.getMonth() + monthsToAdd);
            formData.expiration_date = expDate.toISOString().split('T')[0];
        }
    }
</script>

<div class="new-vaccination-page">
    {#if isLoading}
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Cargando información...</p>
        </div>
    {:else}
        <div class="page-header">
            <div class="header-content">
                <button class="btn-back" on:click={() => navigate('/vaccinations')}>
                    ← Volver
                </button>
                <h1>💉 Nueva Vacunación</h1>
                <p>Registrar nueva vacunación o desparasitación</p>
            </div>
        </div>

        <div class="form-container">
            <form on:submit|preventDefault={handleSubmit} class="vaccination-form">
                <div class="form-section">
                    <h3>🐾 Información Básica</h3>
                    <div class="form-grid">
                        <div class="form-group full-width">
                            <label for="pet_id">Mascota *</label>
                            <select
                                id="pet_id"
                                bind:value={formData.pet_id}
                                required
                                class="form-select"
                            >
                                <option value="">Seleccione una mascota</option>
                                {#each pets as pet}
                                    <option value={pet.id}>
                                        {pet.name} - {pet.species} ({pet.owner?.first_name} {pet.owner?.last_name})
                                    </option>
                                {/each}
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="type">Tipo *</label>
                            <select
                                id="type"
                                bind:value={formData.type}
                                required
                                class="form-select"
                            >
                                <option value="vacuna">Vacuna</option>
                                <option value="desparasitacion">Desparasitación</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="application_date">Fecha de Aplicación *</label>
                            <input
                                type="date"
                                id="application_date"
                                bind:value={formData.application_date}
                                required
                                class="form-input"
                                on:change={updateExpirationSuggestion}
                            />
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3>💊 Detalles del Producto</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="name">Nombre de la Vacuna/Producto *</label>
                            <input
                                type="text"
                                id="name"
                                bind:value={formData.name}
                                required
                                class="form-input"
                                placeholder="Ej: Antirrábica, Sextuple, etc."
                                on:blur={updateExpirationSuggestion}
                            />
                        </div>

                        <div class="form-group">
                            <label for="brand">Marca</label>
                            <input
                                type="text"
                                id="brand"
                                bind:value={formData.brand}
                                class="form-input"
                                placeholder="Marca del producto"
                            />
                        </div>

                        <div class="form-group">
                            <label for="batch_number">Número de Lote</label>
                            <input
                                type="text"
                                id="batch_number"
                                bind:value={formData.batch_number}
                                class="form-input"
                                placeholder="Número de lote"
                            />
                        </div>

                        <div class="form-group">
                            <label for="weight_at_application">Peso al Aplicar (kg)</label>
                            <input
                                type="number"
                                id="weight_at_application"
                                bind:value={formData.weight_at_application}
                                step="0.01"
                                min="0"
                                class="form-input"
                                placeholder="Peso en kilogramos"
                            />
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3>📅 Fechas de Seguimiento</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="expiration_date">Fecha de Vencimiento</label>
                            <input
                                type="date"
                                id="expiration_date"
                                bind:value={formData.expiration_date}
                                class="form-input"
                            />
                            <small class="helper-text">Se calculará automáticamente según la vacuna</small>
                        </div>

                        <div class="form-group">
                            <label for="next_dose_date">Próxima Dosis</label>
                            <input
                                type="date"
                                id="next_dose_date"
                                bind:value={formData.next_dose_date}
                                class="form-input"
                            />
                            <small class="helper-text">Si requiere refuerzo</small>
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3>📝 Observaciones</h3>
                    <div class="form-group">
                        <label for="adverse_reactions">Reacciones Adversas</label>
                        <textarea
                            id="adverse_reactions"
                            bind:value={formData.adverse_reactions}
                            class="form-textarea"
                            placeholder="Registre cualquier reacción adversa observada"
                            rows="3"
                        ></textarea>
                    </div>

                    <div class="form-group">
                        <label for="notes">Notas Adicionales</label>
                        <textarea
                            id="notes"
                            bind:value={formData.notes}
                            class="form-textarea"
                            placeholder="Información adicional sobre la vacunación"
                            rows="3"
                        ></textarea>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" on:click={handleCancel} class="btn-cancel">
                        Cancelar
                    </button>
                    <button type="submit" disabled={isSubmitting} class="btn-submit">
                        {isSubmitting ? 'Guardando...' : 'Registrar Vacunación'}
                    </button>
                </div>
            </form>
        </div>
    {/if}
</div>

<style>
    .new-vaccination-page {
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
        border-top: 4px solid #f59e0b;
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
        color: #f59e0b;
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
        border-color: #f59e0b;
    }

    .form-textarea {
        resize: vertical;
        min-height: 80px;
    }

    .helper-text {
        margin-top: 4px;
        color: #64748b;
        font-size: 0.85rem;
        font-style: italic;
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
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
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
