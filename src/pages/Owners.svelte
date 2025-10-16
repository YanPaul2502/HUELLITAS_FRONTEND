<script>
    import { onMount } from 'svelte';
    import { navigate } from 'svelte-routing';
    import { showError, showSuccess } from '../stores/notifications.js';
    import ownersApi from '../services/owners.js';

    let owners = [];
    let isLoading = true;
    let searchTerm = '';

    onMount(async () => {
        await loadOwners();
    });

    async function loadOwners() {
        isLoading = true;
        try {
            owners = await ownersApi.getAll();
        } catch (error) {
            console.error('Error loading owners:', error);
            showError('Error al cargar los propietarios');
        } finally {
            isLoading = false;
        }
    }

    $: filteredOwners = owners.filter(owner => 
        owner.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.document_number?.includes(searchTerm)
    );
</script>

<div class="owners-page">
    <div class="page-header">
        <div class="header-content">
            <h1>👥 Propietarios</h1>
            <p>Gestión de propietarios de mascotas</p>
        </div>
        <div class="header-actions">
            <button class="btn-primary" on:click={() => navigate('/owners/new')}>
                ➕ Nuevo Propietario
            </button>
        </div>
    </div>

    <div class="search-section">
        <div class="search-box">
            <input
                type="text"
                placeholder="Buscar por nombre, email o documento..."
                bind:value={searchTerm}
                class="search-input"
            />
        </div>
    </div>

    {#if isLoading}
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Cargando propietarios...</p>
        </div>
    {:else if filteredOwners.length === 0}
        <div class="empty-state">
            <div class="empty-icon">👥</div>
            <h3>No hay propietarios registrados</h3>
            <p>Comienza agregando el primer propietario al sistema</p>
            <button class="btn-primary" on:click={() => navigate('/owners/new')}>
                Agregar Propietario
            </button>
        </div>
    {:else}
        <div class="owners-grid">
            {#each filteredOwners as owner (owner.id)}
                <div class="owner-card">
                    <div class="owner-header">
                        <div class="owner-avatar">
                            {owner.first_name?.charAt(0) || 'U'}{owner.last_name?.charAt(0) || 'U'}
                        </div>
                        <div class="owner-info">
                            <h3>{owner.first_name || ''} {owner.last_name || ''}</h3>
                            <p class="owner-document">{owner.document_type || 'ID'}: {owner.document_number || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div class="owner-details">
                        <div class="detail-row">
                            <span class="detail-label">📧 Email:</span>
                            <span class="detail-value">{owner.email || 'No especificado'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">📱 Teléfono:</span>
                            <span class="detail-value">{owner.phone || 'No especificado'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">📍 Ciudad:</span>
                            <span class="detail-value">{owner.city || 'No especificada'}</span>
                        </div>
                    </div>
                    
                    <div class="owner-actions">
                        <button class="btn-secondary" on:click={() => navigate(`/owners/${owner.id}`)}>
                            Ver Detalles
                        </button>
                        <button class="btn-outline" on:click={() => navigate(`/owners/${owner.id}/edit`)}>
                            Editar
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .owners-page {
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
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
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
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }

    .search-section {
        margin-bottom: 32px;
    }

    .search-box {
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
        border-color: #3b82f6;
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

    .owners-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 20px;
    }

    .owner-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
        transition: all 0.2s ease;
    }

    .owner-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .owner-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
    }

    .owner-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 1.2rem;
    }

    .owner-info h3 {
        margin: 0 0 4px 0;
        color: #1e293b;
        font-size: 1.2rem;
        font-weight: 600;
    }

    .owner-document {
        margin: 0;
        color: #64748b;
        font-size: 0.9rem;
    }

    .owner-details {
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

    .owner-actions {
        display: flex;
        gap: 12px;
    }

    .btn-secondary {
        flex: 1;
        background: #f8fafc;
        color: #3b82f6;
        border: 1px solid #e2e8f0;
        padding: 10px 16px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-secondary:hover {
        background: #f1f5f9;
        border-color: #3b82f6;
    }

    .btn-outline {
        flex: 1;
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

    @media (max-width: 768px) {
        .page-header {
            flex-direction: column;
            align-items: stretch;
        }

        .owners-grid {
            grid-template-columns: 1fr;
        }

        .owner-actions {
            flex-direction: column;
        }
    }
</style>