<script lang="ts">
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
  <slot />
</div>

<footer class="footer bg-gray-900">
  <a href="https://github.com/Optidev3455/Enrollment-page">&copy; Optidev3455. All rights reserved.</a>
</footer>