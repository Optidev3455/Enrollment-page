<script lang="ts">
  import type { PageData } from './$types';
  import { onMount, onDestroy } from 'svelte';
  import { slide } from 'svelte/transition';
  import LogoutButton from '$lib/LogoutButton.svelte';

  // for login popup
  let loginSuccess = false;
  // for successfully adding new user popup
  let addUserSuccess = false;
  // for successfully removing user popup
  let removeUserSuccess = false;
  
  // no need for permissionDenied as admins have access to all pages
  
  // for adding new user popup
  let showAddUserPopup = false;
  // for deleting users confirmation popup
  let showDeleteConfirm = false;
  
  export let data: PageData;
  const { username, allUsers = [] } = data;

  let deleteError = '';

  let addUsername = '';
  let addPassword = '';

  // a set to mark down selected unique users to delete
  let selectedUsers = new Set<string>(); 

  onMount(() => {
    // removing ?loginSuccesss=1 and ?permissionDenied=1 to avoid showing popup on page refresh
    const url = new URLSearchParams(location.search);
  
    if (url.get('loginSuccesss')) {
      loginSuccess = true;
      history.replaceState(null, '', location.pathname);
    }
    // no need for permissionDenied as admins have access to all pages
  });

  //popups
  $: if (loginSuccess) {
    const timeout = setTimeout(() => (loginSuccess = false), 3000);
    onDestroy(() => clearTimeout(timeout));
  }

  $: if (addUserSuccess) {
    const timeout = setTimeout(() => (addUserSuccess = false), 3000);
    onDestroy(() => clearTimeout(timeout));
  }

  $: if (removeUserSuccess) {
    const timeout = setTimeout(() => (removeUserSuccess = false), 3000);
    onDestroy(() => clearTimeout(timeout));
  }

  // used on checked checkbox to add selected user
  function toggleUser(username: string, isChecked: boolean) {
    if (isChecked) {
      selectedUsers.add(username);
    } else {
      selectedUsers.delete(username);
    }
    selectedUsers = new Set(selectedUsers);
  }
</script>

<style>
  .container {
    max-width: 900px;
    margin: auto;
    padding: 2rem;
    color: #fff;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    margin-bottom: 1rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    color: #fff;
  }

  th, td {
    border: 1px solid white;
    padding: 0.5rem;
    text-align: left;
  }

  .btn-group {
    margin-top: 1.5rem;
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
  
  button {
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    border: none;
    font-weight: 600;
    user-select: none;
  }

  button.add-user-btn,
  button.delete-user-btn {
    cursor: pointer;
    color: #fff;
    transition: .3s;
  }

  button.add-user-btn {
    background-color: rgba(58, 134, 255, 0.7);
  }

  button.add-user-btn:hover {
    background-color: rgba(30, 100, 230, 0.9);
  }

  button.delete-user-btn {
    background-color: rgba(244, 67, 54, 0.7);
  }

  button.delete-user-btn:hover {
    background-color: rgba(200, 20, 20, 0.9);
  }

  button.delete-user-btn:disabled {
    background-color: rgba(128, 128, 128, 0.5);
    cursor: not-allowed;
  }

  .btn-yes {
    background-color: rgba(0, 128, 0, 0.5);
    color: #fff;
    box-shadow: 0 8px 32px rgba(0, 128, 0, 0.5);
    transition: .3s;
  }

  .btn-yes:hover {
    background-color: rgba(22, 163, 74, 0.8);
    box-shadow: 0 8px 32px rgba(22, 163, 74, 0.8);
  }

  .btn-no {
    background-color: rgba(255, 0, 0, 0.5);
    color: #fff;
    box-shadow: 0 8px 32px rgba(255, 0, 0, 0.5);
    transition: .3s;
  }

  .btn-no:hover {
    background-color: rgba(255, 24, 0, 0.8);
    box-shadow: 0 8px 32px rgba(255, 24, 0, 0.8);
  }
</style>

{#if loginSuccess}
  <div
    class="glass-popup popup-s"
    transition:slide={{ duration: 300 }}
  >
    <span>✅ Successfully Logged in, {username}!</span>
    <button class="close-btn" on:click={() => loginSuccess = false}>
      &times;
    </button>
  </div>
{/if}

{#if addUserSuccess}
  <div
    class="glass-popup popup-s"
    transition:slide={{ duration: 300 }}
  >
    <span>✅ Successfully Added New User! <br> Please Reload the page</span>
    <button class="close-btn" on:click={() => addUserSuccess = false}>
      &times;
    </button>
  </div>
{/if}

{#if removeUserSuccess}
  <div
    class="glass-popup popup-s"
    transition:slide={{ duration: 300 }}
  >
    <span>✅ Successfully Removed User! <br> Please Reload the page</span>
    <button class="close-btn" on:click={() => addUserSuccess = false}>
      &times;
    </button>
  </div>
{/if}

<div class="glass container">
  <div class="header">
    <h1>Welcome to the Admin Portal, {username}!</h1>
    <LogoutButton />
  </div>

  <div style="margin-bottom: 1rem;">
    <button class="add-user-btn" on:click={() => (showAddUserPopup = true)}>Add User</button>
    <button class="delete-user-btn" disabled={selectedUsers.size === 0} on:click={() => showDeleteConfirm = true}>Delete Selected User(s)</button>
  </div>

  <table>
    <thead>
      <tr>
        <th>Select</th>
        <th>Username</th>
        <th>Role</th>
      </tr>
    </thead>
<tbody>
  {#each allUsers as { username: user, role }}
    <tr>
      <td>
        <input
          type="checkbox"
          checked={selectedUsers.has(user)}
          on:change={(e) => {
            const target = e.target as HTMLInputElement;
            toggleUser(user, target.checked);
          }}
        />
      </td>
      <td>{user}</td>
      <td>{role}</td>
    </tr>
  {/each}
</tbody>

  </table>
</div>

{#if showAddUserPopup}
  <div
    class="glass-popup"
    transition:slide={{ duration: 200 }}
  >
    <h2 class="sr-only">Add New User</h2>
    <form method="POST" action="?/addUser">
      Add New User
      <br>
      <label class="block mb-4">
        <span class="block text-white mb-1">Username:</span>
        <input
          type="text"
          name="addUsername"
          required
          bind:value={addUsername}
          class="w-full rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>
      <label class="block mb-4">
        <span class="block text-white mb-1">Password:</span>
        <input
          type="password"
          name="addPassword"
          required
          bind:value={addPassword}
          class="w-full rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>
      <div class="btn-group flex justify-center gap-4">
        <button 
          type="submit" 
          on:click={() => (showAddUserPopup = false, addUserSuccess = true)}
          class="btn-yes px-4 py-2 rounded font-semibold">
          Add
        </button>
        <button
          type="button"
          on:click={() => showAddUserPopup = false}
          class="btn-no px-4 py-2 rounded font-semibold"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
{/if}

{#if showDeleteConfirm}
  <div
    class="glass-popup"
    transition:slide={{ duration: 200 }}
    style="display: inline;"
  >
    <p class="mb-4">Are you sure you want to delete selected user(s)?</p>
    {#if deleteError}
      <p class="text-red-600 mb-4">{deleteError}</p>
    {/if}
    <form method="POST" action="?/deleteUsers">
      {#each Array.from(selectedUsers) as user}
        <input type="hidden" name="deleteUser" value={user} />
      {/each}
      <div class="btn-group flex justify-center gap-4">
        <button 
          type="submit" 
          class="btn-yes px-4 py-2 rounded font-semibold"
          on:click={() => (showDeleteConfirm = false, removeUserSuccess = true)}
        >
          Yes
        </button>
        <button
          type="button"
          class="btn-no px-4 py-2 rounded font-semibold"
          on:click={() => showDeleteConfirm = false}
        >
          No
        </button>
      </div>
    </form>
  </div>
{/if}