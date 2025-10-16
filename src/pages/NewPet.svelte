<script>
    import { navigate } from 'svelte-routing';
    import { onMount } from 'svelte';
    import { showError, showSuccess } from '../stores/notifications.js';
    import petsApi from '../services/pets.js';
    import ownersApi from '../services/owners.js';

    let formData = {
        name: '',
        species: 'dog',
        breed: '',
        age: '',
        weight: '',
        color: '',
        gender: 'male',
        owner_id: ''
    };

    let owners = [];
    let isSubmitting = false;
    let isLoading = true;

    onMount(async () => {
        try {
            owners = await ownersApi.getAll();
        } catch (error) {
            console.error('Error loading owners:', error);
            showError('Error al cargar propietarios');
        } finally {
            isLoading = false;
        }
    });

    async function handleSubmit() {
        if (isSubmitting) return;
        
        isSubmitting = true;
        try {
            await petsApi.create(formData);
            showSuccess('Mascota registrada exitosamente');
            navigate('/pets');
        } catch (error) {
            console.error('Error creating pet:', error);
            showError(error.response?.data?.message || 'Error al registrar mascota');
        } finally {
            isSubmitting = false;
        }
    }

    function handleCancel() {
        navigate('/pets');
    }
</script>

<div class="new-pet-page">
    <div class="page-header">
        <div class="header-content">
            <h1>🐾 Nueva Mascota</h1>
            <p>Registrar una nueva mascota en el sistema</p>
        </div>
    </div>

    {#if isLoading}
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Cargando formulario...</p>
        </div>
    {:else}
        <div class="form-container">
            <form on:submit|preventDefault={handleSubmit} class="pet-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="name">Nombre de la Mascota *</label>
                        <input
                            type="text"
                            id="name"
                            bind:value={formData.name}
                            required
                            class="form-input"
                            placeholder="Ingrese el nombre"
                        />
                    </div>

                    <div class="form-group">
                        <label for="species">Especie *</label>
                        <select
                            id="species"
                            bind:value={formData.species}
                            required
                            class="form-select"
                        >
                            <option value="dog">Perro</option>
                            <option value="cat">Gato</option>
                            <option value="bird">Ave</option>
                            <option value="rabbit">Conejo</option>
                            <option value="other">Otro</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="breed">Raza</label>
                        <input
                            type="text"
                            id="breed"
                            bind:value={formData.breed}
                            class="form-input"
                            placeholder="Ingrese la raza"
                        />
                    </div>

                    <div class="form-group">
                        <label for="age">Edad (años)</label>
                        <input
                            type="number"
                            id="age"
                            bind:value={formData.age}
                            min="0"
                            max="30"
                            class="form-input"
                            placeholder="Edad en años"
                        />
                    </div>

                    <div class="form-group">
                        <label for="weight">Peso (kg)</label>
                        <input
                            type="number"
                            id="weight"
                            bind:value={formData.weight}
                            min="0"
                            step="0.1"
                            class="form-input"
                            placeholder="Peso en kilogramos"
                        />
                    </div>

                    <div class="form-group">
                        <label for="color">Color</label>
                        <input
                            type="text"
                            id="color"
                            bind:value={formData.color}
                            class="form-input"
                            placeholder="Color de la mascota"
                        />
                    </div>

                    <div class="form-group">
                        <label for="gender">Género *</label>
                        <select
                            id="gender"
                            bind:value={formData.gender}
                            required
                            class="form-select"
                        >
                            <option value="male">Macho</option>
                            <option value="female">Hembra</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="owner_id">Propietario *</label>
                        <select
                            id="owner_id"
                            bind:value={formData.owner_id}
                            required
                            class="form-select"
                        >
                            <option value="">Seleccione un propietario</option>
                            {#each owners as owner}
                                <option value={owner.id}>
                                    {owner.first_name} {owner.last_name} - {owner.document_number}
                                </option>
                            {/each}
                        </select>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" on:click={handleCancel} class="btn-cancel">
                        Cancelar
                    </button>
                    <button type="submit" disabled={isSubmitting} class="btn-submit">
                        {isSubmitting ? 'Guardando...' : 'Registrar Mascota'}
                    </button>
                </div>
            </form>
        </div>
    {/if}
</div>

<style>
    .new-pet-page {
        width: 100%;
        max-width: 900px;
        margin: 0 auto;
    }

    .page-header {
        margin-bottom: 32px;
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

    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        text-align: center;
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

    .form-container {
        background: white;
        border-radius: 12px;
        padding: 32px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
    }

    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-bottom: 32px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
    }

    .form-group label {
        margin-bottom: 8px;
        color: #374151;
        font-weight: 500;
        font-size: 0.9rem;
    }

    .form-input,
    .form-select {
        padding: 12px 16px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.2s ease;
    }

    .form-input:focus,
    .form-select:focus {
        outline: none;
        border-color: #3b82f6;
    }

    .form-actions {
        display: flex;
        gap: 16px;
        justify-content: flex-end;
    }

    .btn-cancel {
        background: transparent;
        color: #64748b;
        border: 1px solid #e2e8f0;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-cancel:hover {
        background: #f8fafc;
        color: #1e293b;
    }

    .btn-submit {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-submit:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }

    .btn-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    @media (max-width: 768px) {
        .form-grid {
            grid-template-columns: 1fr;
        }

        .form-actions {
            flex-direction: column;
        }
    }
</style>