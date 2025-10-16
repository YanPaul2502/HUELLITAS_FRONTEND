<script>
    import { onMount } from 'svelte';
    import { showError, showSuccess } from '../stores/notifications.js';
    import servicesApi from '../services/services.js';

    let services = [];
    let isLoading = true;
    let searchTerm = '';
    let categoryFilter = 'all';

    onMount(async () => {
        await loadServices();
    });

    async function loadServices() {
        isLoading = true;
        try {
            services = await servicesApi.getAll();
        } catch (error) {
            console.error('Error loading services:', error);
            showError('Error al cargar los servicios');
        } finally {
            isLoading = false;
        }
    }

    function formatPrice(price) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price);
    }

    function getCategoryIcon(category) {
        const icons = {
            'consulta': '🩺',
            'vacuna': '💉',
            'cirugia': '🏥',
            'grooming': '✂️',
            'emergencia': '🚨',
            'laboratorio': '🔬',
            'radiologia': '📷'
        };
        return icons[category] || '🏥';
    }

    function getCategoryColor(category) {
        const colors = {
            'consulta': 'category-consulta',
            'vacuna': 'category-vacuna',
            'cirugia': 'category-cirugia',
            'grooming': 'category-grooming',
            'emergencia': 'category-emergencia',
            'laboratorio': 'category-laboratorio',
            'radiologia': 'category-radiologia'
        };
        return colors[category] || 'category-default';
    }

    $: categories = [...new Set(services.map(service => service?.category).filter(Boolean))];

    $: filteredServices = services.filter(service => {
        const matchesSearch = 
            service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service?.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = categoryFilter === 'all' || service?.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });
</script>

<div class="services-page">
    <div class="page-header">
        <div class="header-content">
            <h1>🏥 Servicios</h1>
            <p>Servicios veterinarios disponibles</p>
        </div>
        <div class="header-actions">
            <button class="btn-primary" on:click={() => window.location.href = '/services/new'}>
                ➕ Nuevo Servicio
            </button>
        </div>
    </div>

    <div class="filters-section">
        <div class="search-box">
            <input
                type="text"
                placeholder="Buscar servicios..."
                bind:value={searchTerm}
                class="search-input"
            />
        </div>
        <div class="category-filter">
            <select bind:value={categoryFilter} class="category-select">
                <option value="all">Todas las categorías</option>
                {#each categories as category}
                    <option value={category}>{getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}</option>
                {/each}
            </select>
        </div>
    </div>

    {#if isLoading}
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Cargando servicios...</p>
        </div>
    {:else if filteredServices.length === 0}
        <div class="empty-state">
            <div class="empty-icon">🏥</div>
            <h3>No hay servicios disponibles</h3>
            <p>Comienza agregando el primer servicio</p>
            <button class="btn-primary" on:click={() => window.location.href = '/services/new'}>
                Agregar Servicio
            </button>
        </div>
    {:else}
        <div class="services-grid">
            {#each filteredServices as service}
                <div class="service-card">
                    <div class="service-header">
                        <div class="service-icon {getCategoryColor(service.category)}">
                            {getCategoryIcon(service.category)}
                        </div>
                        <div class="service-info">
                            <h3>{service.name}</h3>
                            <span class="service-category">{service.category}</span>
                        </div>
                        <div class="service-price">
                            {formatPrice(service.price)}
                        </div>
                    </div>

                    <div class="service-description">
                        <p>{service.description}</p>
                    </div>

                    <div class="service-details">
                        <div class="detail-item">
                            <span class="detail-label">⏱️ Duración:</span>
                            <span class="detail-value">{service.duration_minutes} min</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">📅 Requiere cita:</span>
                            <span class="detail-value">
                                {service.requires_appointment ? 'Sí' : 'No'}
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">✅ Estado:</span>
                            <span class="detail-value">
                                <span class="status-badge" class:active={service.is_active} class:inactive={!service.is_active}>
                                    {service.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </span>
                        </div>
                    </div>

                    {#if service.requirements}
                        <div class="service-requirements">
                            <h4>📋 Requisitos:</h4>
                            <p>{service.requirements}</p>
                        </div>
                    {/if}

                    <div class="service-actions">
                        <button class="btn-secondary" on:click={() => window.location.href = `/services/${service.id}`}>
                            Ver Detalles
                        </button>
                        <button class="btn-outline" on:click={() => window.location.href = `/services/${service.id}/edit`}>
                            Editar
                        </button>
                        {#if service.requires_appointment}
                            <button class="btn-success" on:click={() => window.location.href = `/appointments/new?service=${service.id}`}>
                                Agendar
                            </button>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .services-page {
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
        border-color: #f59e0b;
    }

    .category-select {
        padding: 12px 16px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 1rem;
        background: white;
        cursor: pointer;
        transition: border-color 0.2s ease;
    }

    .category-select:focus {
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

    .services-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        gap: 24px;
    }

    .service-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
        transition: all 0.2s ease;
    }

    .service-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .service-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
    }

    .service-icon {
        width: 50px;
        height: 50px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
    }

    .category-consulta { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
    .category-vacuna { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
    .category-cirugia { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
    .category-grooming { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); }
    .category-emergencia { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
    .category-laboratorio { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); }
    .category-radiologia { background: linear-gradient(135deg, #64748b 0%, #475569 100%); }
    .category-default { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); }

    .service-info {
        flex: 1;
    }

    .service-info h3 {
        margin: 0 0 4px 0;
        color: #1e293b;
        font-size: 1.2rem;
        font-weight: 600;
    }

    .service-category {
        color: #64748b;
        font-size: 0.9rem;
        text-transform: capitalize;
    }

    .service-price {
        font-size: 1.3rem;
        font-weight: 700;
        color: #059669;
    }

    .service-description {
        margin-bottom: 20px;
    }

    .service-description p {
        margin: 0;
        color: #64748b;
        line-height: 1.5;
    }

    .service-details {
        margin-bottom: 20px;
    }

    .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #f1f5f9;
    }

    .detail-item:last-child {
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
    }

    .status-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
    }

    .status-badge.active {
        background: #dcfce7;
        color: #166534;
    }

    .status-badge.inactive {
        background: #fee2e2;
        color: #dc2626;
    }

    .service-requirements {
        margin-bottom: 20px;
        padding: 16px;
        background: #f8fafc;
        border-radius: 8px;
        border-left: 4px solid #3b82f6;
    }

    .service-requirements h4 {
        margin: 0 0 8px 0;
        color: #1e293b;
        font-size: 0.9rem;
        font-weight: 600;
    }

    .service-requirements p {
        margin: 0;
        color: #64748b;
        font-size: 0.9rem;
        line-height: 1.4;
    }

    .service-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
    }

    .btn-secondary {
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

    .btn-secondary:hover {
        background: #fbbf24;
        color: white;
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
        flex: 1;
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
        flex: 1;
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

        .services-grid {
            grid-template-columns: 1fr;
        }

        .service-actions {
            flex-direction: column;
        }
    }
</style>