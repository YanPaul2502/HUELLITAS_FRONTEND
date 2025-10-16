<script>
    import { onMount } from 'svelte';
    import { showError, showSuccess } from '../stores/notifications.js';
    import petsApi from '../services/pets.js';

    let pets = [];
    let isLoading = true;
    let searchTerm = '';

    onMount(async () => {
        await loadPets();
    });

    async function loadPets() {
        isLoading = true;
        try {
            pets = await petsApi.getAll();
        } catch (error) {
            console.error('Error loading pets:', error);
            showError('Error al cargar las mascotas');
        } finally {
            isLoading = false;
        }
    }

    function calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    function getSpeciesIcon(species) {
        const icons = {
            'Perro': '🐕',
            'Gato': '🐱',
            'Ave': '🐦',
            'Conejo': '🐰',
            'Hamster': '🐹'
        };
        return icons[species] || '🐾';
    }

    $: filteredPets = pets.filter(pet => 
        pet?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet?.species?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet?.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pet?.owner && `${pet.owner.first_name || ''} ${pet.owner.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()))
    );
</script>

<div class="pets-page">
    <div class="page-header">
        <div class="header-content">
            <h1>🐾 Mascotas</h1>
            <p>Gestión de mascotas registradas</p>
        </div>
        <div class="header-actions">
            <button class="btn-primary" on:click={() => window.location.href = '/pets/new'}>
                ➕ Nueva Mascota
            </button>
        </div>
    </div>

    <div class="search-section">
        <div class="search-box">
            <input
                type="text"
                placeholder="Buscar por nombre, especie, raza o propietario..."
                bind:value={searchTerm}
                class="search-input"
            />
        </div>
    </div>

    {#if isLoading}
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Cargando mascotas...</p>
        </div>
    {:else if filteredPets.length === 0}
        <div class="empty-state">
            <div class="empty-icon">🐾</div>
            <h3>No hay mascotas registradas</h3>
            <p>Comienza agregando la primera mascota al sistema</p>
            <button class="btn-primary" on:click={() => window.location.href = '/pets/new'}>
                Agregar Mascota
            </button>
        </div>
    {:else}
        <div class="pets-grid">
            {#each filteredPets as pet}
                <div class="pet-card">
                    <div class="pet-header">
                        <div class="pet-avatar">
                            {getSpeciesIcon(pet.species)}
                        </div>
                        <div class="pet-info">
                            <h3>{pet.name}</h3>
                            <p class="pet-breed">{pet.species} - {pet.breed}</p>
                        </div>
                        <div class="pet-gender" class:male={pet.gender === 'M'} class:female={pet.gender === 'F'}>
                            {pet.gender === 'M' ? '♂' : '♀'}
                        </div>
                    </div>
                    
                    <div class="pet-details">
                        <div class="detail-item">
                            <span class="detail-label">🎂 Edad:</span>
                            <span class="detail-value">{calculateAge(pet.birth_date)} años</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">⚖️ Peso:</span>
                            <span class="detail-value">{pet.weight} kg</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">🎨 Color:</span>
                            <span class="detail-value">{pet.color}</span>
                        </div>
                        {#if pet.owner}
                            <div class="detail-item">
                                <span class="detail-label">👤 Propietario:</span>
                                <span class="detail-value">{pet.owner.first_name} {pet.owner.last_name}</span>
                            </div>
                        {/if}
                    </div>
                    
                    <div class="pet-actions">
                        <button class="btn-secondary" on:click={() => window.location.href = `/pets/${pet.id}`}>
                            Ver Detalles
                        </button>
                        <button class="btn-outline" on:click={() => window.location.href = `/pets/${pet.id}/edit`}>
                            Editar
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .pets-page {
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
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
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
        border-color: #10b981;
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
        border-top: 4px solid #10b981;
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

    .pets-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 20px;
    }

    .pet-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
        transition: all 0.2s ease;
    }

    .pet-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .pet-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
        position: relative;
    }

    .pet-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
    }

    .pet-info {
        flex: 1;
    }

    .pet-info h3 {
        margin: 0 0 4px 0;
        color: #1e293b;
        font-size: 1.2rem;
        font-weight: 600;
    }

    .pet-breed {
        margin: 0;
        color: #64748b;
        font-size: 0.9rem;
    }

    .pet-gender {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        font-weight: bold;
    }

    .pet-gender.male {
        background: #dbeafe;
        color: #1d4ed8;
    }

    .pet-gender.female {
        background: #fce7f3;
        color: #be185d;
    }

    .pet-details {
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
        text-align: right;
    }

    .pet-actions {
        display: flex;
        gap: 12px;
    }

    .btn-secondary {
        flex: 1;
        background: #f0fdf4;
        color: #059669;
        border: 1px solid #bbf7d0;
        padding: 10px 16px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-secondary:hover {
        background: #dcfce7;
        border-color: #059669;
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

        .pets-grid {
            grid-template-columns: 1fr;
        }

        .pet-actions {
            flex-direction: column;
        }
    }
</style>