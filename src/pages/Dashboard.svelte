<script>
    import { onMount } from 'svelte';
    import { user, hasRole } from '../stores/auth.js';
    import { showError } from '../stores/notifications.js';
    import appointmentService from '../services/appointments.js';
    import petService from '../services/pets.js';
    import ownerService from '../services/owners.js';

    let stats = {
        totalPets: 0,
        totalOwners: 0,
        todayAppointments: 0,
        pendingAppointments: 0
    };

    let recentAppointments = [];
    let isLoading = true;

    onMount(async () => {
        await loadDashboardData();
    });

    async function loadDashboardData() {
        isLoading = true;
        
        try {
            // Cargar estadísticas básicas
            const [petsResult, ownersResult, appointmentsResult] = await Promise.all([
                petService.getAll(),
                ownerService.getAll(),
                appointmentService.getAll()
            ]);

            if (petsResult.success) {
                stats.totalPets = petsResult.data.length;
            }

            if (ownersResult.success) {
                stats.totalOwners = ownersResult.data.length;
            }

            if (appointmentsResult.success) {
                const appointments = appointmentsResult.data;
                const today = new Date().toISOString().split('T')[0];
                
                stats.todayAppointments = appointments.filter(apt => 
                    apt.appointment_date.startsWith(today)
                ).length;

                stats.pendingAppointments = appointments.filter(apt => 
                    apt.status === 'scheduled'
                ).length;

                // Obtener las últimas 5 citas
                recentAppointments = appointments
                    .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
                    .slice(0, 5);
            }

        } catch (error) {
            showError('Error al cargar datos del dashboard');
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
            'scheduled': { class: 'badge-scheduled', text: 'Programada' },
            'completed': { class: 'badge-completed', text: 'Completada' },
            'cancelled': { class: 'badge-cancelled', text: 'Cancelada' },
            'in_progress': { class: 'badge-progress', text: 'En Progreso' }
        };
        return badges[status] || { class: 'badge-default', text: status };
    }
</script>

<div class="dashboard">
    <div class="dashboard-header">
        <h1>Dashboard</h1>
        <p>Bienvenido de vuelta, {$user?.name || 'Usuario'}</p>
    </div>

    {#if isLoading}
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Cargando datos...</p>
        </div>
    {:else}
        <!-- Tarjetas de estadísticas -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">🐕</div>
                <div class="stat-content">
                    <h3>{stats.totalPets}</h3>
                    <p>Mascotas Registradas</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-content">
                    <h3>{stats.totalOwners}</h3>
                    <p>Propietarios</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">📅</div>
                <div class="stat-content">
                    <h3>{stats.todayAppointments}</h3>
                    <p>Citas Hoy</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">⏰</div>
                <div class="stat-content">
                    <h3>{stats.pendingAppointments}</h3>
                    <p>Citas Pendientes</p>
                </div>
            </div>
        </div>

        <!-- Accesos rápidos -->
        <div class="quick-actions">
            <h2>Accesos Rápidos</h2>
            <div class="actions-grid">
                {#if hasRole('receptionist') || hasRole('admin')}
                    <a href="/appointments/new" class="action-card">
                        <div class="action-icon">➕</div>
                        <div class="action-content">
                            <h3>Nueva Cita</h3>
                            <p>Programar una nueva cita</p>
                        </div>
                    </a>

                    <a href="/owners/new" class="action-card">
                        <div class="action-icon">👤</div>
                        <div class="action-content">
                            <h3>Nuevo Propietario</h3>
                            <p>Registrar propietario</p>
                        </div>
                    </a>
                {/if}

                <a href="/pets/new" class="action-card">
                    <div class="action-icon">🐾</div>
                    <div class="action-content">
                        <h3>Nueva Mascota</h3>
                        <p>Registrar nueva mascota</p>
                    </div>
                </a>

                {#if hasRole('veterinarian') || hasRole('admin')}
                    <a href="/medical-records/new" class="action-card">
                        <div class="action-icon">📋</div>
                        <div class="action-content">
                            <h3>Registro Médico</h3>
                            <p>Crear ficha clínica</p>
                        </div>
                    </a>
                {/if}
            </div>
        </div>

        <!-- Citas recientes -->
        {#if recentAppointments.length > 0}
            <div class="recent-appointments">
                <h2>Citas Recientes</h2>
                <div class="appointments-list">
                    {#each recentAppointments as appointment}
                        <div class="appointment-item">
                            <div class="appointment-info">
                                <h4>{appointment.pet?.name || 'Mascota'}</h4>
                                <p class="appointment-owner">
                                    Propietario: {appointment.pet?.owner?.name || 'N/A'}
                                </p>
                                <p class="appointment-date">
                                    {formatDate(appointment.appointment_date)}
                                </p>
                            </div>
                            <div class="appointment-status">
                                <span class="badge {getStatusBadge(appointment.status).class}">
                                    {getStatusBadge(appointment.status).text}
                                </span>
                            </div>
                        </div>
                    {/each}
                </div>
                <div class="view-all">
                    <a href="/appointments" class="view-all-link">Ver todas las citas →</a>
                </div>
            </div>
        {/if}
    {/if}
</div>

<style>
    .dashboard {
        max-width: 1200px;
        margin: 0 auto;
    }

    .dashboard-header {
        margin-bottom: 32px;
    }

    .dashboard-header h1 {
        margin: 0 0 8px 0;
        color: #1e293b;
        font-size: 2rem;
        font-weight: 700;
    }

    .dashboard-header p {
        margin: 0;
        color: #64748b;
        font-size: 1.1rem;
    }

    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 300px;
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

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 24px;
        margin-bottom: 40px;
    }

    .stat-card {
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        gap: 16px;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .stat-icon {
        font-size: 2.5rem;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        border-radius: 12px;
        color: white;
    }

    .stat-content h3 {
        margin: 0 0 4px 0;
        font-size: 2rem;
        font-weight: 700;
        color: #1e293b;
    }

    .stat-content p {
        margin: 0;
        color: #64748b;
        font-weight: 500;
    }

    .quick-actions {
        margin-bottom: 40px;
    }

    .quick-actions h2 {
        margin: 0 0 20px 0;
        color: #1e293b;
        font-size: 1.5rem;
        font-weight: 600;
    }

    .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
    }

    .action-card {
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        gap: 16px;
        text-decoration: none;
        color: inherit;
        transition: all 0.2s ease;
    }

    .action-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-color: #3b82f6;
    }

    .action-icon {
        font-size: 2rem;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border-radius: 10px;
        color: white;
    }

    .action-content h3 {
        margin: 0 0 4px 0;
        color: #1e293b;
        font-size: 1.1rem;
        font-weight: 600;
    }

    .action-content p {
        margin: 0;
        color: #64748b;
        font-size: 0.9rem;
    }

    .recent-appointments h2 {
        margin: 0 0 20px 0;
        color: #1e293b;
        font-size: 1.5rem;
        font-weight: 600;
    }

    .appointments-list {
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
        overflow: hidden;
    }

    .appointment-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #e2e8f0;
    }

    .appointment-item:last-child {
        border-bottom: none;
    }

    .appointment-info h4 {
        margin: 0 0 4px 0;
        color: #1e293b;
        font-weight: 600;
    }

    .appointment-owner {
        margin: 0 0 4px 0;
        color: #64748b;
        font-size: 0.9rem;
    }

    .appointment-date {
        margin: 0;
        color: #64748b;
        font-size: 0.85rem;
    }

    .badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .badge-scheduled {
        background: #dbeafe;
        color: #1d4ed8;
    }

    .badge-completed {
        background: #dcfce7;
        color: #166534;
    }

    .badge-cancelled {
        background: #fee2e2;
        color: #dc2626;
    }

    .badge-progress {
        background: #fef3c7;
        color: #d97706;
    }

    .view-all {
        padding: 16px 20px;
        text-align: center;
        border-top: 1px solid #e2e8f0;
    }

    .view-all-link {
        color: #3b82f6;
        text-decoration: none;
        font-weight: 600;
        transition: color 0.2s ease;
    }

    .view-all-link:hover {
        color: #1d4ed8;
    }

    @media (max-width: 768px) {
        .stats-grid {
            grid-template-columns: 1fr;
            gap: 16px;
        }

        .actions-grid {
            grid-template-columns: 1fr;
            gap: 16px;
        }

        .appointment-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }

        .appointment-status {
            align-self: flex-end;
        }
    }
</style>