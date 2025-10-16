<script>
  import { onMount } from 'svelte';
  import { isAuthenticated, initAuth } from './stores/auth.js';
  
  // Components
  import Login from './components/Login.svelte';
  import Layout from './components/Layout.svelte';
  import Notifications from './components/Notifications.svelte';
  
  // Pages
  import Dashboard from './pages/Dashboard.svelte';
  
  onMount(() => {
    initAuth();
  });
</script>

<main>
  <Notifications />
  
  {#if $isAuthenticated}
    <Layout>
      <Dashboard />
    </Layout>
  {:else}
    <Login />
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #f5f5f5;
  }

  :global(*) {
    box-sizing: border-box;
  }

  main {
    min-height: 100vh;
  }
</style>
