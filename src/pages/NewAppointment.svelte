<script>
    import { navigate } from 'svelte-routing';
    import { onMount } from 'svelte';
    import { showError, showSuccess } from '../stores/notifications.js';
    import appointmentsApi from '../services/appointments.js';
    import petsApi from '../services/pets.js';
    import servicesApi from '../services/services.js';

    let formData = {
        pet_id: '',
        service_id: '',
        appointment_date: '',
        appointment_time: '',
        notes: ''
    };

    let pets = [];
    let services = [];
    let isSubmitting = false;
    let isLoading = true;

    onMount(async () => {
        try {
            const [petsData, servicesData] = await Promise.all([
                petsApi.getAll(),
                servicesApi.getAll()
            ]);
            pets = petsData;
            services = servicesData;
        } catch (error) {
            console.error('Error loading form data:', error);
            showError('Error al cargar datos del formulario');
        } finally {
            isLoading = false;
        }
    });

    async function handleSubmit() {
        if (isSubmitting) return;
        
        isSubmitting = true;
        try {
            const appointmentData = {
                ...formData,
                appointment_datetime: `${formData.appointment_date} ${formData.appointment_time}:00`
            };
            
            await appointmentsApi.create(appointmentData);
            showSuccess('Cita creada exitosamente');
            navigate('/appointments');
        } catch (error) {
            console.error('Error creating appointment:', error);
            showError(error.response?.data?.message || 'Error al crear cita');
        } finally {
            isSubmitting = false;
        }
    }

    function handleCancel() {
        navigate('/appointments');
    }

    // Obtener fecha mínima (hoy)
    const today = new Date().toISOString().split('T')[0];
</script>

<div class="new-appointment-page">
    <div class="page-header">
        <div class="header-content">
            <h1>📅 Nueva Cita</h1>
            <p>Programar una nueva cita veterinaria</p>
        </div>
    </div>

    {#if isLoading}
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Cargando formulario...</p>
        </div>
    {:else}
        <div class="form-container">
            <form on:submit|preventDefault={handleSubmit} class="appointment-form">
                <div class="form-grid">
                    <div class="form-group">
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
                                    {pet.name} - {pet.species} ({pet.owner?.first_name || ''} {pet.owner?.last_name || ''})
                                </option>
                            {/each}
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="service_id">Servicio *</label>
                        <select
                            id="service_id"
                            bind:value={formData.service_id}
                            required
                            class="form-select"
                        >
                            <option value="">Seleccione un servicio</option>
                            {#each services as service}
                                <option value={service.id}>
                                    {service.name} - ${service.price}
                                </option>
                            {/each}
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="appointment_date">Fecha de la Cita *</label>
                        <input
                            type="date"
                            id="appointment_date"
                            bind:value={formData.appointment_date}
                            min={today}
                            required
                            class="form-input"
                        />
                    </div>

                    <div class="form-group">
                        <label for="appointment_time">Hora de la Cita *</label>
                        <input
                            type="time"
                            id="appointment_time"
                            bind:value={formData.appointment_time}
                            required
                            class="form-input"
                        />
                    </div>

                    <div class="form-group full-width">
                        <label for="notes">Notas Adicionales</label>
                        <textarea
                            id="notes"
                            bind:value={formData.notes}
                            class="form-textarea"
                            placeholder="Ingrese cualquier información adicional sobre la cita..."
                            rows="4"
                        ></textarea>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" on:click={handleCancel} class="btn-cancel">
                        Cancelar
                    </button>
                    <button type="submit" disabled={isSubmitting} class="btn-submit">
                        {isSubmitting ? 'Guardando...' : 'Crear Cita'}
                    </button>
                </div>
            </form>
        </div>
    {/if}
</div>

<style>
    .new-appointment-page {
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

    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        text-align: center;
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