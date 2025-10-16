<script>
    import { onMount } from 'svelte';
    import { showError, showSuccess } from '../stores/notifications.js';
    import vaccinationsApi from '../services/vaccinations.js';

    let vaccinations = [];
    let isLoading = true;
    let searchTerm = '';
    let petFilter = 'all';
    let statusFilter = 'all';

    onMount(async () => {
        await loadVaccinations();
    });

    async function loadVaccinations() {
        isLoading = true;
        try {
            vaccinations = await vaccinationsApi.getAll();
        } catch (error) {
            console.error('Error loading vaccinations:', error);
            showError('Error al cargar las vacunaciones');
        } finally {
            isLoading = false;
        }
    }

    function formatDate(dateString) {
        if (!dateString) return 'No especificada';
        return new Date(dateString).toLocaleDateString('es-CO', {
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

    function getVaccineIcon(type) {
        const icons = {
            'rabia': '🦠',
            'parvovirus': '🔴',
            'distemper': '🟡',
            'hepatitis': '🟠',
            'parainfluenza': '🔵',
            'coronavirus': '🟣',
            'leptospirosis': '🟤',
            'bordetella': '⚪',
            'giardia': '🟢'
        };
        return icons[type?.toLowerCase()] || '💉';
    }

    function getDaysUntilExpiration(expirationDate) {
        if (!expirationDate) return null;
        const today = new Date();
        const expDate = new Date(expirationDate);
        const diffTime = expDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    $: pets = [...new Set(vaccinations.map(vaccination => vaccination.pet?.name).filter(Boolean))];

    $: filteredVaccinations = vaccinations.filter(vaccination => {
        const matchesSearch = 
            vaccination?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vaccination?.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vaccination?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vaccination?.pet?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesPet = petFilter === 'all' || vaccination?.pet?.name === petFilter;
        
        const vaccinationStatus = getVaccinationStatus(vaccination);
        const matchesStatus = statusFilter === 'all' || vaccinationStatus?.status === statusFilter;
        
        return matchesSearch && matchesPet && matchesStatus;
    });
</script>

<div class="vaccinations-page">
    <div class="page-header">
        <div class="header-content">
            <h1>💉 Vacunaciones</h1>
            <p>Control de vacunas y esquemas de inmunización</p>
        </div>
        <div class="header-actions">
            <button class="btn-primary" on:click={() => window.location.href = '/vaccinations/new'}>
                ➕ Nueva Vacunación
            </button>
        </div>
    </div>

    <div class="filters-section">
        <div class="search-box">
            <input
                type="text"
                placeholder="Buscar por vacuna, tipo, marca o mascota..."
                bind:value={searchTerm}
                class="search-input"
            />
        </div>
        <div class="filter-group">
            <select bind:value={petFilter} class="filter-select">
                <option value="all">Todas las mascotas</option>
                {#each pets as pet}
                    <option value={pet}>{pet}</option>
                {/each}
            </select>
            <select bind:value={statusFilter} class="filter-select">
                <option value="all">Todos los estados</option>
                <option value="active">Vigentes</option>
                <option value="expiring">Por vencer</option>
                <option value="expired">Vencidas</option>
                <option value="pending">Pendientes</option>
            </select>
        </div>
    </div>

    {#if isLoading}
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Cargando vacunaciones...</p>
        </div>
    {:else if filteredVaccinations.length === 0}
        <div class="empty-state">
            <div class="empty-icon">💉</div>
            <h3>No hay vacunaciones registradas</h3>
            <p>Comienza agregando la primera vacunación</p>
            <button class="btn-primary" on:click={() => window.location.href = '/vaccinations/new'}>
                Agregar Vacunación
            </button>
        </div>
    {:else}
        <div class="vaccinations-grid">
            {#each filteredVaccinations as vaccination}
                {@const status = getVaccinationStatus(vaccination)}
                {@const daysUntilExpiration = getDaysUntilExpiration(vaccination.expiration_date)}
                
                <div class="vaccination-card {status.color}">
                    <div class="vaccination-header">
                        <div class="vaccine-icon">
                            {getVaccineIcon(vaccination.type)}
                        </div>
                        <div class="vaccination-info">
                            <h3>{vaccination.name || 'Vacuna sin nombre'}</h3>
                            <span class="vaccine-type">{vaccination.type || 'Tipo no especificado'}</span>
                        </div>
                        <div class="status-badge {status.color}">
                            {status.label}
                        </div>
                    </div>

                    <div class="pet-info">
                        <h4>🐕 {vaccination.pet?.name || 'Mascota no especificada'}</h4>
                        <span class="veterinarian">👨‍⚕️ Dr. {vaccination.veterinarian?.name || 'No especificado'}</span>
                    </div>

                    <div class="vaccination-details">
                        <div class="detail-row">
                            <span class="detail-label">🏷️ Marca:</span>
                            <span class="detail-value">{vaccination.brand || 'No especificada'}</span>
                        </div>
                        
                        {#if vaccination.batch_number}
                            <div class="detail-row">
                                <span class="detail-label">📦 Lote:</span>
                                <span class="detail-value">{vaccination.batch_number}</span>
                            </div>
                        {/if}

                        <div class="detail-row">
                            <span class="detail-label">📅 Fecha aplicación:</span>
                            <span class="detail-value">{formatDate(vaccination.application_date)}</span>
                        </div>

                        {#if vaccination.expiration_date}
                            <div class="detail-row">
                                <span class="detail-label">⏰ Vencimiento:</span>
                                <span class="detail-value expiration-date">
                                    {formatDate(vaccination.expiration_date)}
                                    {#if daysUntilExpiration !== null}
                                        <span class="days-info">
                                            {#if daysUntilExpiration > 0}
                                                ({daysUntilExpiration} días restantes)
                                            {:else if daysUntilExpiration === 0}
                                                (Vence hoy)
                                            {:else}
                                                (Vencida hace {Math.abs(daysUntilExpiration)} días)
                                            {/if}
                                        </span>
                                    {/if}
                                </span>
                            </div>
                        {/if}

                        {#if vaccination.next_dose_date}
                            <div class="detail-row">
                                <span class="detail-label">🔄 Próxima dosis:</span>
                                <span class="detail-value next-dose">{formatDate(vaccination.next_dose_date)}</span>
                            </div>
                        {/if}

                        {#if vaccination.weight_at_application}
                            <div class="detail-row">
                                <span class="detail-label">⚖️ Peso al aplicar:</span>
                                <span class="detail-value">{vaccination.weight_at_application} kg</span>
                            </div>
                        {/if}
                    </div>

                    {#if vaccination.notes}
                        <div class="notes-section">
                            <h4>📝 Notas</h4>
                            <p>{vaccination.notes}</p>
                        </div>
                    {/if}

                    {#if vaccination.adverse_reactions}
                        <div class="reactions-section">
                            <h4>⚠️ Reacciones adversas</h4>
                            <p class="adverse-reactions">{vaccination.adverse_reactions}</p>
                        </div>
                    {/if}

                    <div class="vaccination-actions">
                        <button class="btn-view" on:click={() => window.location.href = `/vaccinations/${vaccination.id}`}>
                            Ver Detalles
                        </button>
                        <button class="btn-edit" on:click={() => window.location.href = `/vaccinations/${vaccination.id}/edit`}>
                            Editar
                        </button>
                        {#if vaccination.next_dose_date}
                            <button class="btn-schedule" on:click={() => window.location.href = `/appointments/new?vaccination=${vaccination.id}`}>
                                Agendar Próxima
                            </button>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .vaccinations-page {
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
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
    }

    .filters-section {
        display: flex;
        gap: 20px;
        margin-bottom: 32px;
        align-items: center;
        flex-wrap: wrap;
    }

    .search-box {
        flex: 1;
        min-width: 300px;
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
        border-color: #f59e0b;
    }

    .filter-group {
        display: flex;
        gap: 12px;
    }

    .filter-select {
        padding: 12px 16px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 1rem;
        background: white;
        cursor: pointer;
        transition: border-color 0.2s ease;
        min-width: 180px;
    }

    .filter-select:focus {
        outline: none;
        border-color: #f59e0b;
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

    .vaccinations-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: 20px;
    }

    .vaccination-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #e2e8f0;
        transition: all 0.2s ease;
    }

    .vaccination-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .vaccination-card.status-active {
        border-left-color: #10b981;
    }

    .vaccination-card.status-expiring {
        border-left-color: #f59e0b;
    }

    .vaccination-card.status-expired {
        border-left-color: #ef4444;
    }

    .vaccination-card.status-pending {
        border-left-color: #3b82f6;
    }

    .vaccination-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
    }

    .vaccine-icon {
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
    }

    .vaccination-info {
        flex: 1;
    }

    .vaccination-info h3 {
        margin: 0 0 4px 0;
        color: #1e293b;
        font-size: 1.2rem;
        font-weight: 600;
    }

    .vaccine-type {
        color: #64748b;
        font-size: 0.9rem;
        text-transform: capitalize;
    }

    .status-badge {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        text-align: center;
        min-width: 80px;
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

    .pet-info {
        margin-bottom: 20px;
        padding: 16px;
        background: #f8fafc;
        border-radius: 8px;
    }

    .pet-info h4 {
        margin: 0 0 8px 0;
        color: #1e293b;
        font-size: 1.1rem;
        font-weight: 600;
    }

    .veterinarian {
        color: #3b82f6;
        font-size: 0.9rem;
        font-weight: 500;
    }

    .vaccination-details {
        margin-bottom: 20px;
    }

    .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #f1f5f9;
    }

    .detail-row:last-child {
        border-bottom: none;
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

    .expiration-date {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
    }

    .days-info {
        font-size: 0.8rem;
        color: #64748b;
        font-weight: 400;
    }

    .next-dose {
        color: #3b82f6;
        font-weight: 600;
    }

    .notes-section,
    .reactions-section {
        margin-bottom: 20px;
        padding: 16px;
        background: #f8fafc;
        border-radius: 8px;
        border-left: 3px solid #e2e8f0;
    }

    .reactions-section {
        border-left-color: #ef4444;
    }

    .notes-section h4,
    .reactions-section h4 {
        margin: 0 0 8px 0;
        color: #1e293b;
        font-size: 0.9rem;
        font-weight: 600;
    }

    .notes-section p,
    .reactions-section p {
        margin: 0;
        color: #64748b;
        font-size: 0.9rem;
        line-height: 1.4;
    }

    .adverse-reactions {
        color: #dc2626 !important;
        font-weight: 500;
    }

    .vaccination-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
    }

    .btn-view {
        background: #fef3c7;
        color: #d97706;
        border: 1px solid #fbbf24;
        padding: 10px 16px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        flex: 1;
    }

    .btn-view:hover {
        background: #fbbf24;
        color: white;
    }

    .btn-edit {
        background: transparent;
        color: #64748b;
        border: 1px solid #e2e8f0;
        padding: 10px 16px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        flex: 1;
    }

    .btn-edit:hover {
        background: #f8fafc;
        color: #1e293b;
    }

    .btn-schedule {
        background: #dbeafe;
        color: #1d4ed8;
        border: 1px solid #93c5fd;
        padding: 10px 16px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        flex: 1;
    }

    .btn-schedule:hover {
        background: #93c5fd;
        color: white;
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

        .filter-group {
            flex-direction: column;
        }

        .vaccinations-grid {
            grid-template-columns: 1fr;
        }

        .vaccination-actions {
            flex-direction: column;
        }

        .expiration-date {
            align-items: flex-start;
        }
    }
</style>