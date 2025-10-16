<script>
    import { onMount } from 'svelte';
    import { showError, showSuccess } from '../stores/notifications.js';
    import medicalRecordsApi from '../services/medicalRecords.js';

    let medicalRecords = [];
    let isLoading = true;
    let searchTerm = '';
    let petFilter = 'all';
    let veterinarianFilter = 'all';

    onMount(async () => {
        await loadMedicalRecords();
    });

    async function loadMedicalRecords() {
        isLoading = true;
        try {
            medicalRecords = await medicalRecordsApi.getAll();
        } catch (error) {
            console.error('Error loading medical records:', error);
            showError('Error al cargar los registros médicos');
        } finally {
            isLoading = false;
        }
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function formatWeight(weight) {
        return weight ? `${weight} kg` : 'No registrado';
    }

    function formatTemperature(temperature) {
        return temperature ? `${temperature}°C` : 'No registrada';
    }

    function getPriorityColor(diagnosis) {
        if (!diagnosis) return 'priority-normal';
        
        const lowerDiagnosis = diagnosis.toLowerCase();
        if (lowerDiagnosis.includes('urgente') || lowerDiagnosis.includes('emergencia') || lowerDiagnosis.includes('crítico')) {
            return 'priority-high';
        } else if (lowerDiagnosis.includes('seguimiento') || lowerDiagnosis.includes('control')) {
            return 'priority-medium';
        }
        return 'priority-normal';
    }

    $: pets = [...new Set(medicalRecords.map(record => record.pet?.name).filter(Boolean))];
    $: veterinarians = [...new Set(medicalRecords.map(record => record.veterinarian?.name).filter(Boolean))];

    $: filteredRecords = medicalRecords.filter(record => {
        const matchesSearch = 
            record?.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record?.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record?.pet?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record?.veterinarian?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesPet = petFilter === 'all' || record?.pet?.name === petFilter;
        const matchesVeterinarian = veterinarianFilter === 'all' || record?.veterinarian?.name === veterinarianFilter;
        
        return matchesSearch && matchesPet && matchesVeterinarian;
    });
</script>

<div class="medical-records-page">
    <div class="page-header">
        <div class="header-content">
            <h1>📋 Registros Médicos</h1>
            <p>Historial médico de las mascotas</p>
        </div>
        <div class="header-actions">
            <button class="btn-primary" on:click={() => window.location.href = '/medical-records/new'}>
                ➕ Nuevo Registro
            </button>
        </div>
    </div>

    <div class="filters-section">
        <div class="search-box">
            <input
                type="text"
                placeholder="Buscar por diagnóstico, razón, mascota o veterinario..."
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
            <select bind:value={veterinarianFilter} class="filter-select">
                <option value="all">Todos los veterinarios</option>
                {#each veterinarians as vet}
                    <option value={vet}>{vet}</option>
                {/each}
            </select>
        </div>
    </div>

    {#if isLoading}
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Cargando registros médicos...</p>
        </div>
    {:else if filteredRecords.length === 0}
        <div class="empty-state">
            <div class="empty-icon">📋</div>
            <h3>No hay registros médicos</h3>
            <p>Comienza agregando el primer registro médico</p>
            <button class="btn-primary" on:click={() => window.location.href = '/medical-records/new'}>
                Agregar Registro
            </button>
        </div>
    {:else}
        <div class="records-list">
            {#each filteredRecords as record}
                <div class="record-card {getPriorityColor(record.diagnosis)}">
                    <div class="record-header">
                        <div class="record-info">
                            <div class="pet-info">
                                <h3>🐕 {record.pet?.name || 'Mascota no especificada'}</h3>
                                <span class="visit-date">📅 {formatDate(record.visit_date)}</span>
                            </div>
                            <div class="veterinarian-info">
                                <span class="veterinarian">👨‍⚕️ Dr. {record.veterinarian?.name || 'No especificado'}</span>
                            </div>
                        </div>
                        <div class="record-actions">
                            <button class="btn-view" on:click={() => window.location.href = `/medical-records/${record.id}`}>
                                Ver Detalles
                            </button>
                        </div>
                    </div>

                    <div class="record-content">
                        <div class="reason-section">
                            <h4>🎯 Motivo de la consulta</h4>
                            <p>{record.reason || 'No especificado'}</p>
                        </div>

                        {#if record.symptoms}
                            <div class="symptoms-section">
                                <h4>🔍 Síntomas</h4>
                                <p>{record.symptoms}</p>
                            </div>
                        {/if}

                        <div class="vitals-section">
                            <h4>📊 Signos vitales</h4>
                            <div class="vitals-grid">
                                <div class="vital-item">
                                    <span class="vital-label">⚖️ Peso:</span>
                                    <span class="vital-value">{formatWeight(record.weight)}</span>
                                </div>
                                <div class="vital-item">
                                    <span class="vital-label">🌡️ Temperatura:</span>
                                    <span class="vital-value">{formatTemperature(record.temperature)}</span>
                                </div>
                            </div>
                        </div>

                        {#if record.physical_examination}
                            <div class="examination-section">
                                <h4>🔬 Examen físico</h4>
                                <p>{record.physical_examination}</p>
                            </div>
                        {/if}

                        {#if record.diagnosis}
                            <div class="diagnosis-section">
                                <h4>🩺 Diagnóstico</h4>
                                <p class="diagnosis-text">{record.diagnosis}</p>
                            </div>
                        {/if}

                        {#if record.treatment}
                            <div class="treatment-section">
                                <h4>💊 Tratamiento</h4>
                                <p>{record.treatment}</p>
                            </div>
                        {/if}

                        {#if record.medications}
                            <div class="medications-section">
                                <h4>💉 Medicamentos</h4>
                                <p>{record.medications}</p>
                            </div>
                        {/if}

                        {#if record.recommendations}
                            <div class="recommendations-section">
                                <h4>📝 Recomendaciones</h4>
                                <p>{record.recommendations}</p>
                            </div>
                        {/if}

                        {#if record.next_visit_date}
                            <div class="next-visit-section">
                                <h4>📅 Próxima visita</h4>
                                <p class="next-visit-date">{formatDate(record.next_visit_date)}</p>
                            </div>
                        {/if}

                        {#if record.notes}
                            <div class="notes-section">
                                <h4>📄 Notas adicionales</h4>
                                <p>{record.notes}</p>
                            </div>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .medical-records-page {
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

    .records-list {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .record-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #e2e8f0;
        transition: all 0.2s ease;
    }

    .record-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .record-card.priority-high {
        border-left-color: #ef4444;
    }

    .record-card.priority-medium {
        border-left-color: #f59e0b;
    }

    .record-card.priority-normal {
        border-left-color: #10b981;
    }

    .record-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
        gap: 20px;
    }

    .record-info {
        flex: 1;
    }

    .pet-info h3 {
        margin: 0 0 8px 0;
        color: #1e293b;
        font-size: 1.3rem;
        font-weight: 600;
    }

    .visit-date {
        color: #64748b;
        font-size: 0.9rem;
        font-weight: 500;
    }

    .veterinarian-info {
        margin-top: 8px;
    }

    .veterinarian {
        color: #3b82f6;
        font-size: 0.9rem;
        font-weight: 500;
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
    }

    .btn-view:hover {
        background: #fbbf24;
        color: white;
    }

    .record-content {
        display: grid;
        gap: 20px;
    }

    .record-content h4 {
        margin: 0 0 8px 0;
        color: #1e293b;
        font-size: 1rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .record-content p {
        margin: 0;
        color: #64748b;
        line-height: 1.5;
    }

    .vitals-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-top: 12px;
    }

    .vital-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: #f8fafc;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
    }

    .vital-label {
        color: #64748b;
        font-size: 0.9rem;
        font-weight: 500;
    }

    .vital-value {
        color: #1e293b;
        font-weight: 600;
    }

    .diagnosis-text {
        font-weight: 600;
        color: #1e293b;
    }

    .next-visit-date {
        color: #3b82f6;
        font-weight: 600;
    }

    .reason-section,
    .symptoms-section,
    .examination-section,
    .diagnosis-section,
    .treatment-section,
    .medications-section,
    .recommendations-section,
    .next-visit-section,
    .notes-section {
        padding: 16px;
        background: #f8fafc;
        border-radius: 8px;
        border-left: 3px solid #e2e8f0;
    }

    .diagnosis-section {
        border-left-color: #3b82f6;
    }

    .treatment-section {
        border-left-color: #10b981;
    }

    .medications-section {
        border-left-color: #8b5cf6;
    }

    .next-visit-section {
        border-left-color: #f59e0b;
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

        .record-header {
            flex-direction: column;
            gap: 16px;
        }

        .vitals-grid {
            grid-template-columns: 1fr;
        }
    }
</style>