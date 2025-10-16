<script>
    import { onMount } from 'svelte';
    import { dashboardApi } from '../services/api.js';
    import { showError } from '../stores/notifications.js';
    import { user } from '../stores/auth.js';

    let stats = {
        totalOwners: 0,
        totalPets: 0,
        todayAppointments: 0,
        pendingAppointments: 0,
        totalServices: 0
    };
    
    let recentAppointments = [];
    let isLoading = true;

    onMount(async () => {
        await loadDashboardData();
    });

    async function loadDashboardData() {
        isLoading = true;
        try {
            const data = await dashboardApi.getStats();
            stats = {
                totalOwners: data.totalOwners || 0,
                totalPets: data.totalPets || 0,
                todayAppointments: data.todayAppointments || 0,
                pendingAppointments: data.pendingAppointments || 0,
                totalServices: data.totalServices || 0
            };
            recentAppointments = data.recentAppointments || [];
        } catch (error) {
            console.error('Error loading dashboard:', error);
            showError('Error al cargar el dashboard');
        } finally {
            isLoading = false;
        }
    }

    function formatDate(dateString) {
        if (!dateString) return 'No especificada';
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function getStatusClass(status) {
        const classes = {
            'programada': 'status-scheduled',
            'confirmada': 'status-confirmed',
            'completada': 'status-completed',
            'cancelada': 'status-cancelled',
            'en_progreso': 'status-progress'
        };
        return classes[status] || 'status-default';
    }

    function getStatusLabel(status) {
        const labels = {
            'programada': 'Programada',
            'confirmada': 'Confirmada',
            'completada': 'Completada',
            'cancelada': 'Cancelada',
            'en_progreso': 'En Progreso'
        };
        return labels[status] || status;
    }
</script>

<div class="dashboard">
    <div class="dashboard-header">
        <h1>📊 Dashboard</h1>
        <p>Bienvenido, {$user?.name || 'Usuario'}</p>
    </div>

    {#if isLoading}
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Cargando estadísticas...</p>
        </div>
    {:else}
        <!-- Estadísticas principales -->
        <div class="stats-grid">
            <div class="stat-card stat-owners">
                <div class="stat-icon">👥</div>
                <div class="stat-content">
                    <h3>{stats.totalOwners}</h3>
                    <p>Propietarios</p>
                </div>
            </div>

            <div class="stat-card stat-pets">
                <div class="stat-icon">🐕</div>
                <div class="stat-content">
                    <h3>{stats.totalPets}</h3>
                    <p>Mascotas</p>
                </div>
            </div>

            <div class="stat-card stat-today">
                <div class="stat-icon">📅</div>
                <div class="stat-content">
                    <h3>{stats.todayAppointments}</h3>
                    <p>Citas Hoy</p>
                </div>
            </div>

            <div class="stat-card stat-pending">
                <div class="stat-icon">⏰</div>
                <div class="stat-content">
                    <h3>{stats.pendingAppointments}</h3>
                    <p>Citas Pendientes</p>
                </div>
            </div>

            <div class="stat-card stat-services">
                <div class="stat-icon">🏥</div>
                <div class="stat-content">
                    <h3>{stats.totalServices}</h3>
                    <p>Servicios</p>
                </div>
            </div>
        </div>

        <!-- Acciones rápidas -->
        <div class="quick-actions">
            <h2>⚡ Acciones Rápidas</h2>
            <div class="actions-grid">
                <a href="/owners/new" class="action-card">
                    <span class="action-icon">👥➕</span>
                    <h3>Nuevo Propietario</h3>
                    <p>Registrar un nuevo propietario</p>
                </a>

                <a href="/pets/new" class="action-card">
                    <span class="action-icon">🐕➕</span>
                    <h3>Nueva Mascota</h3>
                    <p>Registrar una nueva mascota</p>
                </a>

                <a href="/appointments/new" class="action-card">
                    <span class="action-icon">📅➕</span>
                    <h3>Nueva Cita</h3>
                    <p>Programar una nueva cita</p>
                </a>

                <a href="/medical-records/new" class="action-card">
                    <span class="action-icon">📋➕</span>
                    <h3>Nuevo Registro</h3>
                    <p>Crear registro médico</p>
                </a>
            </div>
        </div>

        <!-- Citas recientes -->
        <div class="recent-appointments">
            <div class="section-header">
                <h2>📅 Citas Recientes</h2>
                <a href="/appointments" class="view-all">Ver todas →</a>
            </div>

            {#if recentAppointments.length === 0}
                <div class="empty-state">
                    <p>No hay citas registradas</p>
                </div>
            {:else}
                <div class="appointments-list">
                    {#each recentAppointments as appointment}
                        <div class="appointment-item">
                            <div class="appointment-info">
                                <div class="appointment-pet">
                                    <span class="pet-icon">🐕</span>
                                    <strong>{appointment.pet?.name || 'Sin mascota'}</strong>
                                </div>
                                <div class="appointment-owner">
                                    <span class="owner-icon">👤</span>
                                    {appointment.pet?.owner?.first_name || 'Sin'} {appointment.pet?.owner?.last_name || 'propietario'}
                                </div>
                                <div class="appointment-date">
                                    <span class="date-icon">📅</span>
                                    {formatDate(appointment.appointment_date)}
                                </div>
                            </div>
                            <div class="appointment-status">
                                <span class="status-badge {getStatusClass(appointment.status)}">
                                    {getStatusLabel(appointment.status)}
                                </span>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .dashboard {
        width: 100%;
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

    .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px 20px;
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
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
    }

    .stat-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        display: flex;
        align-items: center;
        gap: 20px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
        transition: all 0.2s ease;
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
        border-radius: 10px;
    }

    .stat-owners .stat-icon { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
    .stat-pets .stat-icon { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
    .stat-today .stat-icon { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); }
    .stat-pending .stat-icon { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
    .stat-services .stat-icon { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }

    .stat-content h3 {
        margin: 0 0 4px 0;
        font-size: 2rem;
        font-weight: 700;
        color: #1e293b;
    }

    .stat-content p {
        margin: 0;
        color: #64748b;
        font-size: 0.9rem;
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
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
    }

    .action-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        text-decoration: none;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
        transition: all 0.2s ease;
        text-align: center;
    }

    .action-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-color: #3b82f6;
    }

    .action-icon {
        font-size: 2.5rem;
        display: block;
        margin-bottom: 12px;
    }

    .action-card h3 {
        margin: 0 0 8px 0;
        color: #1e293b;
        font-size: 1.1rem;
        font-weight: 600;
    }

    .action-card p {
        margin: 0;
        color: #64748b;
        font-size: 0.9rem;
    }

    .recent-appointments {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .section-header h2 {
        margin: 0;
        color: #1e293b;
        font-size: 1.5rem;
        font-weight: 600;
    }

    .view-all {
        color: #3b82f6;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s ease;
    }

    .view-all:hover {
        color: #1d4ed8;
    }

    .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: #64748b;
    }

    .appointments-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .appointment-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background: #f8fafc;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        transition: all 0.2s ease;
    }

    .appointment-item:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
    }

    .appointment-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
    }

    .appointment-pet,
    .appointment-owner,
    .appointment-date {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
    }

    .appointment-pet strong {
        color: #1e293b;
    }

    .appointment-owner {
        color: #64748b;
    }

    .appointment-date {
        color: #64748b;
    }

    .pet-icon,
    .owner-icon,
    .date-icon {
        font-size: 1rem;
    }

    .status-badge {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        white-space: nowrap;
    }

    .status-scheduled {
        background: #dbeafe;
        color: #1d4ed8;
    }

    .status-confirmed {
        background: #dcfce7;
        color: #166534;
    }

    .status-completed {
        background: #f0fdf4;
        color: #15803d;
    }

    .status-cancelled {
        background: #fee2e2;
        color: #dc2626;
    }

    .status-progress {
        background: #fef3c7;
        color: #d97706;
    }

    @media (max-width: 768px) {
        .stats-grid {
            grid-template-columns: 1fr;
        }

        .actions-grid {
            grid-template-columns: 1fr;
        }

        .appointment-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }

        .appointment-status {
            width: 100%;
            display: flex;
            justify-content: flex-start;
        }
    }

    @media (max-width: 480px) {
        .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }
    }
</style>