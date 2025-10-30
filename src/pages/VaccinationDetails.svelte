<script>
    import { onMount } from 'svelte';
    import { navigate } from 'svelte-routing';
    import { showError, showSuccess } from '../stores/notifications.js';
    import vaccinationsApi from '../services/vaccinations.js';

    export let id;

    let vaccination = null;
    let isLoading = true;
    let showDeleteConfirm = false;

    onMount(async () => {
        await loadVaccination();
    });

    async function loadVaccination() {
        isLoading = true;
        try {
            vaccination = await vaccinationsApi.getById(id);
        } catch (error) {
            console.error('Error loading vaccination:', error);
            showError('Error al cargar la vacunación');
            navigate('/vaccinations');
        } finally {
            isLoading = false;
        }
    }

    async function handleDelete() {
        try {
            await vaccinationsApi.delete(id);
            showSuccess('Vacunación eliminada exitosamente');
            navigate('/vaccinations');
        } catch (error) {
            console.error('Error deleting vaccination:', error);
            showError('Error al eliminar la vacunación');
        }
        showDeleteConfirm = false;
    }

    function formatDate(dateString) {
        if (!dateString) return 'No especificada';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function getVaccinationStatus(vaccination) {
        const today = new Date();
        const applicationDate = new Date(vaccination.application_date);
        const expirationDate = vaccination.expiration_date ? new Date(vaccination.expiration_date) : null;
        const nextDoseDate = vaccination.next_dose_date ? new Date(vaccination.next_dose_date) : null;

        if (nextDoseDate && nextDoseDate > today) {
            return { status: 'pending', label: 'Pendiente próxima dosis', color: 'status-pending' };
        } else if (expirationDate && expirationDate < today) {
            return { status: 'expired', label: 'Vencida', color: 'status-expired' };
        } else if (expirationDate && expirationDate <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)) {
            return { status: 'expiring', label: 'Por vencer', color: 'status-expiring' };
        } else {
            return { status: 'active', label: 'Vigente', color: 'status-active' };
        }
    }

    function getDaysUntilExpiration(expirationDate) {
        if (!expirationDate) return null;
        const today = new Date();
        const expDate = new Date(expirationDate);
        const diffTime = expDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    function getVaccineIcon(type) {
        return type === 'vacuna' ? '💉' : '💊';
    }
</script>

<div class="vaccination-details-page">
    {#if isLoading}
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Cargando información...</p>
        </div>
    {:else if vaccination}
        {@const status = getVaccinationStatus(vaccination)}
        {@const daysUntilExpiration = getDaysUntilExpiration(vaccination.expiration_date)}

        <div class="page-header">
            <div class="header-content">
                <button class="btn-back" on:click={() => navigate('/vaccinations')}>
                    ← Volver
                </button>
                <h1>💉 Detalles de Vacunación</h1>
            </div>
            <div class="header-actions">
                <button class="btn-edit" on:click={() => navigate(`/vaccinations/${id}/edit`)}>
                    ✏️ Editar
                </button>
                <button class="btn-delete" on:click={() => showDeleteConfirm = true}>
                    🗑️ Eliminar
                </button>
            </div>
        </div>

        <div class="details-container">
            <div class="vaccination-header-card {status.color}">
                <div class="vaccine-icon-large">
                    {getVaccineIcon(vaccination.type)}
                </div>
                <div class="header-info">
                    <h2>{vaccination.name}</h2>
                    <p class="vaccine-type">{vaccination.type === 'vacuna' ? 'Vacuna' : 'Desparasitación'}</p>
                    <div class="status-badge {status.color}">
                        {status.label}
                    </div>
                </div>
            </div>

            <div class="info-section">
                <h3>🐾 Información de la Mascota</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Mascota</span>
                        <span class="info-value">{vaccination.pet?.name || 'No especificada'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Especie</span>
                        <span class="info-value">{vaccination.pet?.species || 'No especificada'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Propietario</span>
                        <span class="info-value">
                            {vaccination.pet?.owner?.first_name || ''} {vaccination.pet?.owner?.last_name || 'No especificado'}
                        </span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Veterinario</span>
                        <span class="info-value">Dr. {vaccination.veterinarian?.name || 'No especificado'}</span>
                    </div>
                </div>
            </div>

            <div class="info-section">
                <h3>💊 Detalles del Producto</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Nombre</span>
                        <span class="info-value">{vaccination.name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Tipo</span>
                        <span class="info-value">{vaccination.type === 'vacuna' ? 'Vacuna' : 'Desparasitación'}</span>
                    </div>
                    {#if vaccination.brand}
                        <div class="info-item">
                            <span class="info-label">Marca</span>
                            <span class="info-value">{vaccination.brand}</span>
                        </div>
                    {/if}
                    {#if vaccination.batch_number}
                        <div class="info-item">
                            <span class="info-label">Número de Lote</span>
                            <span class="info-value">{vaccination.batch_number}</span>
                        </div>
                    {/if}
                    {#if vaccination.weight_at_application}
                        <div class="info-item">
                            <span class="info-label">Peso al Aplicar</span>
                            <span class="info-value">{vaccination.weight_at_application} kg</span>
                        </div>
                    {/if}
                </div>
            </div>

            <div class="info-section">
                <h3>📅 Fechas Importantes</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Fecha de Aplicación</span>
                        <span class="info-value date-value">{formatDate(vaccination.application_date)}</span>
                    </div>
                    {#if vaccination.expiration_date}
                        <div class="info-item">
                            <span class="info-label">Fecha de Vencimiento</span>
                            <span class="info-value date-value">
                                {formatDate(vaccination.expiration_date)}
                                {#if daysUntilExpiration !== null}
                                    <br>
                                    <small class="days-info">
                                        {#if daysUntilExpiration > 0}
                                            ({daysUntilExpiration} días restantes)
                                        {:else if daysUntilExpiration === 0}
                                            (Vence hoy)
                                        {:else}
                                            (Vencida hace {Math.abs(daysUntilExpiration)} días)
                                        {/if}
                                    </small>
                                {/if}
                            </span>
                        </div>
                    {/if}
                    {#if vaccination.next_dose_date}
                        <div class="info-item">
                            <span class="info-label">Próxima Dosis</span>
                            <span class="info-value next-dose">{formatDate(vaccination.next_dose_date)}</span>
                        </div>
                    {/if}
                </div>
            </div>

            {#if vaccination.adverse_reactions}
                <div class="info-section alert-section">
                    <h3>⚠️ Reacciones Adversas</h3>
                    <p class="adverse-reactions">{vaccination.adverse_reactions}</p>
                </div>
            {/if}

            {#if vaccination.notes}
                <div class="info-section">
                    <h3>📝 Notas</h3>
                    <p class="notes">{vaccination.notes}</p>
                </div>
            {/if}

            {#if vaccination.next_dose_date}
                <div class="action-card">
                    <div class="action-info">
                        <h4>🔄 Próxima Dosis Programada</h4>
                        <p>Fecha: {formatDate(vaccination.next_dose_date)}</p>
                    </div>
                    <button class="btn-schedule" on:click={() => navigate(`/appointments/new?vaccination=${id}`)}>
                        Agendar Cita
                    </button>
                </div>
            {/if}
        </div>

        {#if showDeleteConfirm}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="modal-overlay" on:click={() => showDeleteConfirm = false}>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div class="modal" on:click|stopPropagation>
                    <h3>¿Confirmar eliminación?</h3>
                    <p>¿Estás seguro de que deseas eliminar este registro de vacunación? Esta acción no se puede deshacer.</p>
                    <div class="modal-actions">
                        <button class="btn-cancel" on:click={() => showDeleteConfirm = false}>
                            Cancelar
                        </button>
                        <button class="btn-confirm-delete" on:click={handleDelete}>
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        {/if}
    {/if}
</div>

<style>
    .vaccination-details-page {
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
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 32px;
        gap: 20px;
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
        margin: 0;
        color: #1e293b;
        font-size: 2rem;
        font-weight: 700;
    }

    .header-actions {
        display: flex;
        gap: 12px;
    }

    .btn-edit {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-edit:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
    }

    .btn-delete {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-delete:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    }

    .details-container {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
    }

    .vaccination-header-card {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        padding: 40px;
        display: flex;
        align-items: center;
        gap: 24px;
        border-left: 6px solid;
    }

    .vaccination-header-card.status-active {
        border-left-color: #10b981;
    }

    .vaccination-header-card.status-expiring {
        border-left-color: #fbbf24;
    }

    .vaccination-header-card.status-expired {
        border-left-color: #ef4444;
    }

    .vaccination-header-card.status-pending {
        border-left-color: #3b82f6;
    }

    .vaccine-icon-large {
        width: 80px;
        height: 80px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        border: 3px solid rgba(255, 255, 255, 0.3);
    }

    .header-info {
        flex: 1;
    }

    .header-info h2 {
        margin: 0 0 8px 0;
        font-size: 2rem;
    }

    .vaccine-type {
        margin: 0 0 12px 0;
        opacity: 0.9;
        font-size: 1.1rem;
        text-transform: capitalize;
    }

    .status-badge {
        display: inline-block;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 600;
    }

    .status-badge.status-active {
        background: #dcfce7;
        color: #166534;
    }

    .status-badge.status-expiring {
        background: #fef3c7;
        color: #d97706;
    }

    .status-badge.status-expired {
        background: #fee2e2;
        color: #dc2626;
    }

    .status-badge.status-pending {
        background: #dbeafe;
        color: #1d4ed8;
    }

    .info-section {
        padding: 32px 40px;
        border-bottom: 1px solid #e2e8f0;
    }

    .info-section:last-child {
        border-bottom: none;
    }

    .info-section.alert-section {
        background: #fef2f2;
        border-left: 4px solid #ef4444;
    }

    .info-section h3 {
        margin: 0 0 20px 0;
        color: #1e293b;
        font-size: 1.3rem;
    }

    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
    }

    .info-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .info-label {
        color: #64748b;
        font-size: 0.85rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .info-value {
        color: #1e293b;
        font-size: 1rem;
        font-weight: 500;
    }

    .date-value {
        color: #3b82f6;
        font-weight: 600;
    }

    .next-dose {
        color: #10b981;
        font-weight: 600;
    }

    .days-info {
        color: #64748b;
        font-size: 0.85rem;
        font-weight: 400;
    }

    .adverse-reactions {
        margin: 0;
        color: #dc2626;
        line-height: 1.6;
        font-weight: 500;
        white-space: pre-wrap;
    }

    .notes {
        margin: 0;
        color: #475569;
        line-height: 1.6;
        white-space: pre-wrap;
    }

    .action-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        padding: 24px;
        margin: 20px;
        background: #dbeafe;
        border-radius: 12px;
        border: 2px solid #93c5fd;
    }

    .action-info h4 {
        margin: 0 0 4px 0;
        color: #1e293b;
        font-size: 1.1rem;
    }

    .action-info p {
        margin: 0;
        color: #1d4ed8;
        font-weight: 500;
    }

    .btn-schedule {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
    }

    .btn-schedule:hover {
        background: #2563eb;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal {
        background: white;
        border-radius: 12px;
        padding: 32px;
        max-width: 400px;
        width: 90%;
    }

    .modal h3 {
        margin: 0 0 12px 0;
        color: #1e293b;
        font-size: 1.5rem;
    }

    .modal p {
        margin: 0 0 24px 0;
        color: #64748b;
        line-height: 1.5;
    }

    .modal-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
    }

    .btn-cancel {
        background: transparent;
        color: #64748b;
        border: 1px solid #e2e8f0;
        padding: 10px 20px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-cancel:hover {
        background: #f8fafc;
        color: #1e293b;
    }

    .btn-confirm-delete {
        background: #ef4444;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s ease;
    }

    .btn-confirm-delete:hover {
        background: #dc2626;
    }

    @media (max-width: 768px) {
        .page-header {
            flex-direction: column;
            align-items: stretch;
        }

        .header-actions {
            width: 100%;
        }

        .btn-edit,
        .btn-delete {
            flex: 1;
        }

        .vaccination-header-card,
        .info-section {
            padding: 24px 20px;
        }

        .info-grid {
            grid-template-columns: 1fr;
        }

        .action-card {
            flex-direction: column;
            align-items: stretch;
        }

        .btn-schedule {
            width: 100%;
        }
    }
</style>
