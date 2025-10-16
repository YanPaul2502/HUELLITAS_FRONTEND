<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';

  let stats = {
    totalPets: 0,
    totalOwners: 0,
    todayAppointments: 0,
    pendingAppointments: 0
  };

  let recentAppointments = [];
  let loading = true;

  onMount(async () => {
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      stats = {
        totalPets: 156,
        totalOwners: 89,
        todayAppointments: 12,
        pendingAppointments: 5
      };

      recentAppointments = [
        {
          id: 1,
          petName: 'Max',
          ownerName: 'Juan Pérez',
          service: 'Consulta General',
          date: '2024-01-15',
          time: '10:00',
          status: 'confirmed'
        },
        {
          id: 2,
          petName: 'Luna',
          ownerName: 'María García',
          service: 'Vacunación',
          date: '2024-01-15',
          time: '11:30',
          status: 'pending'
        },
        {
          id: 3,
          petName: 'Rocky',
          ownerName: 'Carlos López',
          service: 'Cirugía',
          date: '2024-01-14',
          time: '09:00',
          status: 'completed'
        }
      ];

      loading = false;
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      loading = false;
    }
  });

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  function getStatusBadge(status) {
    const badges = {
      confirmed: 'badge-confirmed',
      pending: 'badge-pending',
      completed: 'badge-completed',
      cancelled: 'badge-cancelled'
    };
    return badges[status] || 'badge-default';
  }

  function getStatusText(status) {
    const texts = {
      confirmed: 'Confirmada',
      pending: 'Pendiente',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };
    return texts[status] || status;
  }
</script>

<div class="dashboard">
  <div class="dashboard-header">
    <h1>Dashboard</h1>
    <p>Bienvenido al sistema de gestión veterinaria</p>
  </div>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Cargando datos...</p>
    </div>
  {:else}
    <!-- Estadísticas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon pets">🐕</div>
        <div class="stat-content">
          <h3>{stats.totalPets}</h3>
          <p>Mascotas Registradas</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon owners">👥</div>
        <div class="stat-content">
          <h3>{stats.totalOwners}</h3>
          <p>Propietarios</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon appointments">📅</div>
        <div class="stat-content">
          <h3>{stats.todayAppointments}</h3>
          <p>Citas Hoy</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon pending">⏰</div>
        <div class="stat-content">
          <h3>{stats.pendingAppointments}</h3>
          <p>Citas Pendientes</p>
        </div>
      </div>
    </div>

    <!-- Acciones Rápidas -->
    <div class="quick-actions">
      <h2>Acciones Rápidas</h2>
      <div class="actions-grid">
        <button class="action-btn" on:click={() => navigate('/pets/new')}>
          <span class="action-icon">🐾</span>
          <span>Nueva Mascota</span>
        </button>
        
        <button class="action-btn" on:click={() => navigate('/owners/new')}>
          <span class="action-icon">👤</span>
          <span>Nuevo Propietario</span>
        </button>
        
        <button class="action-btn" on:click={() => navigate('/appointments/new')}>
          <span class="action-icon">📅</span>
          <span>Nueva Cita</span>
        </button>
        
        <button class="action-btn" on:click={() => navigate('/services')}>
          <span class="action-icon">🏥</span>
          <span>Servicios</span>
        </button>
      </div>
    </div>

    <!-- Citas Recientes -->
    <div class="recent-appointments">
      <h2>Citas Recientes</h2>
      <div class="appointments-table">
        <div class="table-header">
          <div>Mascota</div>
          <div>Propietario</div>
          <div>Servicio</div>
          <div>Fecha</div>
          <div>Hora</div>
          <div>Estado</div>
        </div>
        
        {#each recentAppointments as appointment}
          <div class="table-row">
            <div class="pet-name">{appointment.petName}</div>
            <div class="owner-name">{appointment.ownerName}</div>
            <div class="service">{appointment.service}</div>
            <div class="date">{formatDate(appointment.date)}</div>
            <div class="time">{appointment.time}</div>
            <div class="status">
              <span class="badge {getStatusBadge(appointment.status)}">
                {getStatusText(appointment.status)}
              </span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .dashboard {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .dashboard-header {
    margin-bottom: 2rem;
  }

  .dashboard-header h1 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
    font-size: 2.5rem;
  }

  .dashboard-header p {
    color: #7f8c8d;
    font-size: 1.1rem;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: transform 0.2s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
  }

  .stat-icon {
    font-size: 2.5rem;
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-icon.pets { background: #e8f5e8; }
  .stat-icon.owners { background: #e8f0ff; }
  .stat-icon.appointments { background: #fff3e0; }
  .stat-icon.pending { background: #ffeaa7; }

  .stat-content h3 {
    font-size: 2rem;
    font-weight: bold;
    color: #2c3e50;
    margin: 0;
  }

  .stat-content p {
    color: #7f8c8d;
    margin: 0.25rem 0 0 0;
    font-size: 0.9rem;
  }

  .quick-actions {
    margin-bottom: 3rem;
  }

  .quick-actions h2 {
    color: #2c3e50;
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .action-btn {
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    color: #2c3e50;
  }

  .action-btn:hover {
    border-color: #3498db;
    background: #f8f9fa;
    transform: translateY(-2px);
  }

  .action-icon {
    font-size: 2rem;
  }

  .recent-appointments h2 {
    color: #2c3e50;
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
  }

  .appointments-table {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .table-header {
    display: grid;
    grid-template-columns: 1fr 1fr 1.5fr 1fr 1fr 1fr;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: #f8f9fa;
    font-weight: bold;
    color: #2c3e50;
    border-bottom: 1px solid #e9ecef;
  }

  .table-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1.5fr 1fr 1fr 1fr;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #f1f3f4;
    align-items: center;
  }

  .table-row:last-child {
    border-bottom: none;
  }

  .table-row:hover {
    background: #f8f9fa;
  }

  .badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    text-align: center;
    display: inline-block;
  }

  .badge-confirmed {
    background: #d4edda;
    color: #155724;
  }

  .badge-pending {
    background: #fff3cd;
    color: #856404;
  }

  .badge-completed {
    background: #d1ecf1;
    color: #0c5460;
  }

  .badge-cancelled {
    background: #f8d7da;
    color: #721c24;
  }

  .badge-default {
    background: #e2e3e5;
    color: #383d41;
  }

  @media (max-width: 768px) {
    .dashboard {
      padding: 1rem;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .actions-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .table-header,
    .table-row {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .table-header {
      display: none;
    }

    .table-row {
      display: flex;
      flex-direction: column;
      text-align: left;
    }
  }
</style>