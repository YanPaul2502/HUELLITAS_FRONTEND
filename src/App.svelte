<script>
  import { onMount } from 'svelte';
  import { Router, Route } from 'svelte-routing';
  import { isAuthenticated, initAuth } from './stores/auth.js';
  
  // Components
  import Login from './components/Login.svelte';
  import Layout from './components/Layout.svelte';
  import Notifications from './components/Notifications.svelte';
  import ProtectedRoute from './components/ProtectedRoute.svelte';
  
  // Pages
  import Dashboard from './pages/Dashboard.svelte';
  import Owners from './pages/Owners.svelte';
  import Pets from './pages/Pets.svelte';
  import Appointments from './pages/Appointments.svelte';
  import Services from './pages/Services.svelte';
  import MedicalRecords from './pages/MedicalRecords.svelte';
  import Vaccinations from './pages/Vaccinations.svelte';
  import NewOwner from './pages/NewOwner.svelte';
  import NewPet from './pages/NewPet.svelte';
  import NewAppointment from './pages/NewAppointment.svelte';
  
  onMount(() => {
    initAuth();
  });
</script>

<main>
  <Notifications />
  
  {#if $isAuthenticated}
    <Router>
      <Layout>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/owners" component={Owners} />
        <Route path="/owners/new" component={NewOwner} />
        <Route path="/pets" component={Pets} />
        <Route path="/pets/new" component={NewPet} />
        <Route path="/appointments" component={Appointments} />
        <Route path="/appointments/new" component={NewAppointment} />
        <Route path="/services" component={Services} />
        <Route path="/medical-records" component={MedicalRecords} />
        <Route path="/vaccinations" component={Vaccinations} />
      </Layout>
    </Router>
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
