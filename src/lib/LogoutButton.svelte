<script lang="ts">
  import { goto } from '$app/navigation';
  import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
  import { Fa } from 'svelte-fa';
  import { slide } from 'svelte/transition';

  export let redirectTo = '/?loggedOut=1'; 

  let show = false;

  async function logout() {
    show = false;
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'logout' })
    });
    if (res.ok) {
      goto(redirectTo);
    } else {
      alert('Logout failed');
    }
  }
</script>

<style>
  .logout-btn {
    color: #fff;
    padding: 0;
    font-size: 1.4rem;
    transition: .3s;
  }
  
  .logout-btn:hover {
    color: #d83f3f;
  }
  
  .glass-popup {
    /* From https://css.glass */
    background: rgba(31, 31, 31, 0.7);
    border-radius: 16px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10.7px);
    -webkit-backdrop-filter: blur(10.7px);
    
    border: 1px solid rgba(31, 31, 31, 1);
    padding: 2rem 2rem;
    font-size: 1.2em;
    color: #fff;
    z-index: 9999;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .btn-group {
    margin-top: 1.5rem;
    display: flex;
    gap: 1rem;
  }

  button {
    cursor: pointer;
    padding: .4rem .8rem;
    border-radius: 6px;
    border: none;
  }
  
  .btn-yes {
    background-color: rgba(0, 128, 0, 0.5);
    box-shadow: 0 8px 32px 0 rgba(0, 128, 0, 0.5);
    color: #fff;
    transition: .3s;
  }

  .btn-no {
    background-color: rgba(255, 0, 0, 0.5);
    box-shadow: 0 8px 32px 0 rgba(255, 0, 0, 0.5);
    color: #fff;
    transition: .3s;
  }
  
  .btn-yes:hover {
    background-color: rgba(22, 163, 74, 0.8);
    box-shadow: 0 8px 32px 0 rgba(22, 163, 74, 0.8);
  }

  .btn-no:hover {
    background-color: rgba(255, 24, 0, 0.8);
    box-shadow: 0 8px 32px 0 rgba(255, 24, 0, 0.8);
  }

</style>

<button class="logout-btn" on:click={() => show = true}>
  <Fa icon={faRightFromBracket} />
</button>

{#if show}
  <div
    class="glass-popup"
    transition:slide={{ duration: 300 }}
  >
    <p>你確定要登出嗎？</p>
    <div class="btn-group">
      <button class="btn-yes" on:click={logout}>Yes</button>
      <button class="btn-no" on:click={() => show = false}>No</button>
    </div>
  </div>
{/if}
