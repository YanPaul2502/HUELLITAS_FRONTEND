<script>
    import { onMount } from 'svelte';
    import { navigate } from 'svelte-routing';
    import { showError, showSuccess } from '../stores/notifications.js';
    import ownersApi from '../services/owners.js';

    export let id;

    let owner = null;
    let isLoading = true;
    let showDeleteConfirm = false;

    onMount(async () => {
        await loadOwner();
    });

    async function loadOwner() {
        isLoading = true;
        try {
            owner = await ownersApi.getById(id);
        } catch (error) {
            console.error('Error loading owner:', error);
            showError('Error al cargar el propietario');
            navigate('/owners');
        } finally {
            isLoading = false;
        }
    }

    async function handleDelete() {
        try {
            await ownersApi.delete(id);
            showSuccess('Propietario eliminado exitosamente');
            navigate('/owners');
        } catch (error) {
            console.error('Error deleting owner:', error);
            showError('Error al eliminar el propietario');
        }
        showDeleteConfirm = false;
    }
</script>

<div class="owner-details-page">
    {#if isLoading}
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Cargando información...</p>
        </div>
    {:else if owner}
        <div class="page-header">
            <div class="header-content">
                <button class="btn-back" on:click={() => navigate('/owners')}>
                    ← Volver
                </button>
                <h1>👤 Detalles del Propietario</h1>
            </div>
            <div class="header-actions">
                <button class="btn-edit" on:click={() => navigate(`/owners/${id}/edit`)}>
                    ✏️ Editar
                </button>
                <button class="btn-delete" on:click={() => showDeleteConfirm = true}>
                    🗑️ Eliminar
                </button>
            </div>
        </div>

        <div class="details-container">
            <div class="owner-profile">
                <div class="profile-avatar">
                    {owner.first_name?.charAt(0) || 'U'}{owner.last_name?.charAt(0) || 'U'}
                </div>
                <h2>{owner.first_name} {owner.last_name}</h2>
                <p class="document">{owner.document_type}: {owner.document_number}</p>
            </div>

            <div class="info-section">
                <h3>📋 Información Personal</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Nombre Completo</span>
                        <span class="info-value">{owner.first_name} {owner.last_name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Tipo de Documento</span>
                        <span class="info-value">{owner.document_type}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Número de Documento</span>
                        <span class="info-value">{owner.document_number}</span>
                    </div>
                    {#if owner.gender}
                        <div class="info-item">
                            <span class="info-label">Género</span>
                            <span class="info-value">{owner.gender === 'M' ? 'Masculino' : 'Femenino'}</span>
                        </div>
                    {/if}
                    {#if owner.birth_date}
                        <div class="info-item">
                            <span class="info-label">Fecha de Nacimiento</span>
                            <span class="info-value">{new Date(owner.birth_date).toLocaleDateString('es-ES')}</span>
                        </div>
                    {/if}
                </div>
            </div>

            <div class="info-section">
                <h3>📞 Información de Contacto</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Email</span>
                        <span class="info-value">{owner.email || 'No especificado'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Teléfono</span>
                        <span class="info-value">{owner.phone || 'No especificado'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Dirección</span>
                        <span class="info-value">{owner.address || 'No especificada'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Ciudad</span>
                        <span class="info-value">{owner.city || 'No especificada'}</span>
                    </div>
                </div>
            </div>

            {#if owner.notes}
                <div class="info-section">
                    <h3>📝 Notas</h3>
                    <p class="notes">{owner.notes}</p>
                </div>
            {/if}

            {#if owner.pets && owner.pets.length > 0}
                <div class="info-section">
                    <h3>🐾 Mascotas ({owner.pets.length})</h3>
                    <div class="pets-grid">
                        {#each owner.pets as pet}
                            <div class="pet-card">
                                <div class="pet-info">
                                    <h4>{pet.name}</h4>
                                    <p>{pet.species} - {pet.breed || 'Raza desconocida'}</p>
                                </div>
                                <button class="btn-view-pet" on:click={() => navigate(`/pets/${pet.id}`)}>
                                    Ver Detalles
                                </button>
                            </div>
                        {/each}
                    </div>
                </div>
            {:else}
                <div class="info-section">
                    <h3>🐾 Mascotas</h3>
                    <p class="no-pets">Este propietario no tiene mascotas registradas</p>
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
                    <p>¿Estás seguro de que deseas eliminar a este propietario? Esta acción no se puede deshacer.</p>
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
    .owner-details-page {
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
        border-top: 4px solid #3b82f6;
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
        color: #3b82f6;
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
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
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
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
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

    .owner-profile {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        padding: 40px;
        text-align: center;
    }

    .profile-avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        font-weight: bold;
        margin: 0 auto 16px;
        border: 4px solid rgba(255, 255, 255, 0.3);
    }

    .owner-profile h2 {
        margin: 0 0 8px 0;
        font-size: 2rem;
    }

    .document {
        margin: 0;
        opacity: 0.9;
        font-size: 1.1rem;
    }

    .info-section {
        padding: 32px 40px;
        border-bottom: 1px solid #e2e8f0;
    }

    .info-section:last-child {
        border-bottom: none;
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

    .notes {
        margin: 0;
        color: #475569;
        line-height: 1.6;
        white-space: pre-wrap;
    }

    .no-pets {
        margin: 0;
        color: #64748b;
        font-style: italic;
    }

    .pets-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
    }

    .pet-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .pet-info h4 {
        margin: 0 0 4px 0;
        color: #1e293b;
        font-size: 1.1rem;
    }

    .pet-info p {
        margin: 0;
        color: #64748b;
        font-size: 0.9rem;
    }

    .btn-view-pet {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s ease;
    }

    .btn-view-pet:hover {
        background: #2563eb;
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

        .owner-profile,
        .info-section {
            padding: 24px 20px;
        }

        .info-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
