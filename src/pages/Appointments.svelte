<script>
    import { onMount } from 'svelte';
    import { showError, showSuccess } from '../stores/notifications.js';
    import appointmentsApi from '../services/appointments.js';

    let appointments = [];
    let isLoading = true;
    let searchTerm = '';
    let statusFilter = 'all';

    onMount(async () => {
        await loadAppointments();
    });

    async function loadAppointments() {
        isLoading = true;
        try {
            appointments = await appointmentsApi.getAll();
        } catch (error) {
            console.error('Error loading appointments:', error);
            showError('Error al cargar las citas');
        } finally {
            isLoading = false;
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function getStatusBadge(status) {
        const badges = {
            'programada': { class: 'badge-scheduled', text: 'Programada', icon: '📅' },
            'confirmada': { class: 'badge-confirmed', text: 'Confirmada', icon: '✅' },
            'completada': { class: 'badge-completed', text: 'Completada', icon: '✔️' },
            'cancelada': { class: 'badge-cancelled', text: 'Cancelada', icon: '❌' },
            'en_progreso': { class: 'badge-progress', text: 'En Progreso', icon: '⏳' }
        };
        return badges[status] || { class: 'badge-default', text: status, icon: '📋' };
    }

    function getPriorityColor(date) {
        const appointmentDate = new Date(date);
        const today = new Date();
        const diffTime = appointmentDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'overdue';
        if (diffDays === 0) return 'today';
        if (diffDays <= 1) return 'tomorrow';
        return 'normal';
    }

    $: filteredAppointments = appointments.filter(appointment => {
        const matchesSearch = 
            appointment?.pet?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment?.pet?.owner?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment?.pet?.owner?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment?.reason?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || appointment?.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
</script>

<div class="appointments-page">
    <div class="page-header">
        <div class="header-content">
            <h1>📅 Citas</h1>
            <p>Gestión de citas veterinarias</p>
        </div>
        <div class="header-actions">
            <button class="btn-primary" on:click={() => window.location.href = '/appointments/new'}>
                ➕ Nueva Cita
            </button>
        </div>
    </div>

    <div class="filters-section">
        <div class="search-box">
            <input
                type="text"
                placeholder="Buscar por mascota, propietario o motivo..."
                bind:value={searchTerm}
                class="search-input"
            />
        </div>
        <div class="status-filter">
            <select bind:value={statusFilter} class="status-select">
                <option value="all">Todos los estados</option>
                <option value="programada">Programadas</option>
                <option value="confirmada">Confirmadas</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completada">Completadas</option>
                <option value="cancelada">Canceladas</option>
            </select>
        </div>
    </div>

    {#if isLoading}
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Cargando citas...</p>
        </div>
    {:else if filteredAppointments.length === 0}
        <div class="empty-state">
            <div class="empty-icon">📅</div>
            <h3>No hay citas registradas</h3>
            <p>Comienza programando la primera cita</p>
            <button class="btn-primary" on:click={() => window.location.href = '/appointments/new'}>
                Programar Cita
            </button>
        </div>
    {:else}
        <div class="appointments-list">
            {#each filteredAppointments as appointment}
                <div class="appointment-card" class:priority-today={getPriorityColor(appointment.appointment_date) === 'today'} class:priority-tomorrow={getPriorityColor(appointment.appointment_date) === 'tomorrow'} class:priority-overdue={getPriorityColor(appointment.appointment_date) === 'overdue'}>
                    <div class="appointment-header">
                        <div class="appointment-info">
                            <h3>{appointment.pet?.name || 'Mascota no especificada'}</h3>
                            <p class="owner-name">
                                Propietario: {appointment.pet?.owner?.first_name} {appointment.pet?.owner?.last_name}
                            </p>
                        </div>
                        <div class="appointment-status">
                            <span class="badge {getStatusBadge(appointment.status).class}">
                                {getStatusBadge(appointment.status).icon} {getStatusBadge(appointment.status).text}
                            </span>
                        </div>
                    </div>

                    <div class="appointment-details">
                        <div class="detail-row">
                            <div class="detail-item">
                                <span class="detail-label">📅 Fecha y Hora:</span>
                                <span class="detail-value">{formatDate(appointment.appointment_date)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">⏱️ Duración:</span>
                                <span class="detail-value">{appointment.duration_minutes} min</span>
                            </div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="detail-item">
                                <span class="detail-label">🏥 Servicio:</span>
                                <span class="detail-value">{appointment.service?.name || 'No especificado'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">👨‍⚕️ Veterinario:</span>
                                <span class="detail-value">{appointment.veterinarian?.name || 'No asignado'}</span>
                            </div>
                        </div>

                        {#if appointment.reason}
                            <div class="detail-item full-width">
                                <span class="detail-label">📝 Motivo:</span>
                                <span class="detail-value">{appointment.reason}</span>
                            </div>
                        {/if}

                        {#if appointment.notes}
                            <div class="detail-item full-width">
                                <span class="detail-label">📋 Notas:</span>
                                <span class="detail-value">{appointment.notes}</span>
                            </div>
                        {/if}
                    </div>

                    <div class="appointment-actions">
                        <button class="btn-secondary" on:click={() => window.location.href = `/appointments/${appointment.id}`}>
                            Ver Detalles
                        </button>
                        {#if appointment.status === 'programada' || appointment.status === 'confirmada'}
                            <button class="btn-outline" on:click={() => window.location.href = `/appointments/${appointment.id}/edit`}>
                                Editar
                            </button>
                        {/if}
                        {#if appointment.status === 'programada'}
                            <button class="btn-success">
                                Confirmar
                            </button>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .appointments-page {
        width: 100%;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 32px;
        gap: 20px;
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

    .btn-primary {
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
    }

    .filters-section {
        display: flex;
        gap: 20px;
        margin-bottom: 32px;
        align-items: center;
    }

    .search-box {
        flex: 1;
        max-width: 400px;
    }

    .search-input {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.2s ease;
    }

    .search-input:focus {
        outline: none;
        border-color: #8b5cf6;
    }

    .status-select {
        padding: 12px 16px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 1rem;
        background: white;
        cursor: pointer;
        transition: border-color 0.2s ease;
    }

    .status-select:focus {
        outline: none;
        border-color: #8b5cf6;
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
        border-top: 4px solid #8b5cf6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .empty-state {
        text-align: center;
        padding: 60px 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .empty-icon {
        font-size: 4rem;
        margin-bottom: 16px;
    }

    .empty-state h3 {
        margin: 0 0 8px 0;
        color: #1e293b;
        font-size: 1.5rem;
    }

    .empty-state p {
        margin: 0 0 24px 0;
        color: #64748b;
    }

    .appointments-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .appointment-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
        transition: all 0.2s ease;
    }

    .appointment-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .appointment-card.priority-today {
        border-left: 4px solid #f59e0b;
        background: linear-gradient(90deg, #fef3c7 0%, white 10%);
    }

    .appointment-card.priority-tomorrow {
        border-left: 4px solid #3b82f6;
        background: linear-gradient(90deg, #dbeafe 0%, white 10%);
    }

    .appointment-card.priority-overdue {
        border-left: 4px solid #ef4444;
        background: linear-gradient(90deg, #fee2e2 0%, white 10%);
    }

    .appointment-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
        gap: 16px;
    }

    .appointment-info h3 {
        margin: 0 0 4px 0;
        color: #1e293b;
        font-size: 1.3rem;
        font-weight: 600;
    }

    .owner-name {
        margin: 0;
        color: #64748b;
        font-size: 0.9rem;
    }

    .appointment-details {
        margin-bottom: 20px;
    }

    .detail-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 12px;
    }

    .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
    }

    .detail-item.full-width {
        grid-column: 1 / -1;
        border-top: 1px solid #f1f5f9;
        margin-top: 8px;
        padding-top: 12px;
    }

    .detail-label {
        color: #64748b;
        font-size: 0.9rem;
        font-weight: 500;
    }

    .detail-value {
        color: #1e293b;
        font-weight: 500;
        text-align: right;
    }

    .badge {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .badge-scheduled {
        background: #dbeafe;
        color: #1d4ed8;
    }

    .badge-confirmed {
        background: #dcfce7;
        color: #166534;
    }

    .badge-completed {
        background: #f0fdf4;
        color: #15803d;
    }

    .badge-cancelled {
        background: #fee2e2;
        color: #dc2626;
    }

    .badge-progress {
        background: #fef3c7;
        color: #d97706;
    }

    .appointment-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
    }

    .btn-secondary {
        background: #f8fafc;
        color: #8b5cf6;
        border: 1px solid #e2e8f0;
        padding: 10px 16px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-secondary:hover {
        background: #f1f5f9;
        border-color: #8b5cf6;
    }

    .btn-outline {
        background: transparent;
        color: #64748b;
        border: 1px solid #e2e8f0;
        padding: 10px 16px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-outline:hover {
        background: #f8fafc;
        color: #1e293b;
    }

    .btn-success {
        background: #dcfce7;
        color: #166534;
        border: 1px solid #bbf7d0;
        padding: 10px 16px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-success:hover {
        background: #bbf7d0;
    }

    @media (max-width: 768px) {
        .page-header {
            flex-direction: column;
            align-items: stretch;
        }

        .filters-section {
            flex-direction: column;
            gap: 16px;
        }

        .detail-row {
            grid-template-columns: 1fr;
            gap: 8px;
        }

        .appointment-actions {
            flex-direction: column;
        }
    }
</style>