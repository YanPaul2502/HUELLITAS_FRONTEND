<script>
    import { user, logout, hasRole, hasAnyRole } from '../stores/auth.js';
    import { showSuccess } from '../stores/notifications.js';
    import { navigate, link } from 'svelte-routing';
    import { getContext } from 'svelte';

    const location = getContext('router');
    $: currentPath = $location?.location?.pathname || '/';

    let sidebarOpen = false;

    async function handleLogout() {
        await logout();
        showSuccess('Sesión cerrada correctamente');
        navigate('/login');
    }

    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
    }

    function closeSidebar() {
        sidebarOpen = false;
    }

    function isActive(path) {
        return currentPath === path || currentPath.startsWith(path + '/');
    }

    // Menú de navegación basado en roles
    $: menuItems = [
        {
            label: 'Dashboard',
            path: '/dashboard',
            icon: '📊',
            roles: ['admin', 'veterinarian', 'receptionist']
        },
        {
            label: 'Propietarios',
            path: '/owners',
            icon: '👥',
            roles: ['admin', 'receptionist']
        },
        {
            label: 'Mascotas',
            path: '/pets',
            icon: '🐕',
            roles: ['admin', 'veterinarian', 'receptionist']
        },
        {
            label: 'Citas',
            path: '/appointments',
            icon: '📅',
            roles: ['admin', 'veterinarian', 'receptionist']
        },
        {
            label: 'Servicios',
            path: '/services',
            icon: '🏥',
            roles: ['admin']
        },
        {
            label: 'Registros Médicos',
            path: '/medical-records',
            icon: '📋',
            roles: ['admin', 'veterinarian']
        },
        {
            label: 'Vacunaciones',
            path: '/vaccinations',
            icon: '💉',
            roles: ['admin', 'veterinarian']
        }
    ].filter(item => hasAnyRole(item.roles));
</script>

<div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar" class:open={sidebarOpen}>
        <div class="sidebar-header">
            <h2>🐾 HUELLITAS</h2>
            <button class="sidebar-close" on:click={closeSidebar}>×</button>
        </div>

        <nav class="sidebar-nav">
            {#each menuItems as item}
                <a
                    href={item.path}
                    use:link
                    class="nav-item"
                    class:active={isActive(item.path)}
                    on:click={closeSidebar}
                >
                    <span class="nav-icon">{item.icon}</span>
                    <span class="nav-label">{item.label}</span>
                </a>
            {/each}
        </nav>

        <div class="sidebar-footer">
            <div class="user-info">
                <div class="user-avatar">
                    {$user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div class="user-details">
                    <div class="user-name">{$user?.name || 'Usuario'}</div>
                    <div class="user-role">{$user?.role?.display_name || 'Sin rol'}</div>
                </div>
            </div>
            <button class="logout-button" on:click={handleLogout}>
                <span>🚪</span>
                Cerrar Sesión
            </button>
        </div>
    </aside>

    <!-- Overlay para móvil -->
    {#if sidebarOpen}
        <div class="sidebar-overlay" on:click={closeSidebar}></div>
    {/if}

    <!-- Contenido principal -->
    <main class="main-content">
        <!-- Header -->
        <header class="header">
            <button class="menu-toggle" on:click={toggleSidebar}>
                ☰
            </button>
            <div class="header-title">
                <h1>Sistema de Gestión Veterinaria</h1>
            </div>
            <div class="header-actions">
                <span class="user-greeting">
                    Hola, {$user?.name || 'Usuario'}
                </span>
            </div>
        </header>

        <!-- Contenido de la página -->
        <div class="page-content">
            <slot />
        </div>
    </main>
</div>

<style>
    .layout {
        display: flex;
        height: 100vh;
        overflow: hidden;
        background-color: #f8fafc;
    }

    /* Sidebar */
    .sidebar {
        width: 280px;
        background: linear-gradient(180deg, #1e293b 0%, #334155 100%);
        color: white;
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        z-index: 1000;
        box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
        overflow-y: auto;
    }

    .sidebar.open {
        transform: translateX(0);
    }

    .sidebar-header {
        padding: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .sidebar-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: bold;
    }

    .sidebar-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
    }

    .sidebar-close:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .sidebar-nav {
        flex: 1;
        padding: 20px 0;
    }

    .nav-item {
        display: flex;
        align-items: center;
        padding: 12px 20px;
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        transition: all 0.2s ease;
        border-left: 3px solid transparent;
    }

    .nav-item:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
    }

    .nav-item.active {
        background-color: rgba(255, 255, 255, 0.15);
        color: white;
        border-left-color: #3b82f6;
    }

    .nav-icon {
        font-size: 18px;
        margin-right: 12px;
        width: 20px;
        text-align: center;
    }

    .nav-label {
        font-weight: 500;
    }

    .sidebar-footer {
        padding: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .user-info {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        padding: 10px;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
    }

    .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        margin-right: 12px;
    }

    .user-details {
        flex: 1;
    }

    .user-name {
        font-weight: 600;
        margin-bottom: 2px;
    }

    .user-role {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .logout-button {
        width: 100%;
        padding: 10px;
        background: rgba(239, 68, 68, 0.2);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: white;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-weight: 500;
    }

    .logout-button:hover {
        background: rgba(239, 68, 68, 0.3);
        border-color: rgba(239, 68, 68, 0.5);
    }

    /* Overlay */
    .sidebar-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 999;
    }

    /* Contenido principal */
    .main-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-left: 0;
        height: 100vh;
        overflow: hidden;
        width: 100%;
    }

    .header {
        background: white;
        padding: 16px 24px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        gap: 16px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        position: sticky;
        top: 0;
        z-index: 100;
        flex-shrink: 0;
    }

    .menu-toggle {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        padding: 8px;
        border-radius: 6px;
        transition: background-color 0.2s ease;
    }

    .menu-toggle:hover {
        background-color: #f1f5f9;
    }

    .header-title {
        flex: 1;
    }

    .header-title h1 {
        margin: 0;
        font-size: 1.5rem;
        color: #1e293b;
        font-weight: 600;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .user-greeting {
        color: #64748b;
        font-weight: 500;
    }

    .page-content {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        overflow-x: hidden;
        height: calc(100vh - 73px);
    }

    /* Responsive */
    @media (min-width: 1024px) {
        .sidebar {
            position: fixed;
            transform: translateX(0);
            width: 280px;
            flex-shrink: 0;
        }

        .sidebar-close {
            display: none;
        }

        .menu-toggle {
            display: none;
        }

        .main-content {
            margin-left: 280px;
            width: calc(100% - 280px);
        }

        .sidebar-overlay {
            display: none;
        }

        .layout {
            flex-direction: row;
        }
    }

    @media (max-width: 1023px) {
        .sidebar {
            width: 280px;
        }

        .main-content {
            width: 100%;
        }
    }

    @media (max-width: 768px) {
        .header-title h1 {
            font-size: 1.25rem;
        }

        .user-greeting {
            display: none;
        }

        .page-content {
            padding: 12px;
        }

        .sidebar {
            width: 100%;
            max-width: 320px;
        }
    }

    @media (max-width: 480px) {
        .header {
            padding: 12px 16px;
        }

        .header-title h1 {
            font-size: 1.1rem;
        }

        .page-content {
            padding: 10px;
        }

        .sidebar-header h2 {
            font-size: 1.3rem;
        }

        .nav-item {
            padding: 14px 20px;
        }

        .nav-icon {
            font-size: 20px;
        }
    }
</style>