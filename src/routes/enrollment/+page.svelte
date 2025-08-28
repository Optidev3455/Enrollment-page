<script lang="ts">
  import type { PageData } from './$types';
  import { onMount, onDestroy } from 'svelte';
  import { slide } from 'svelte/transition';
  import LogoutButton from '$lib/LogoutButton.svelte';
  
  // for login popup
  let loginSuccess = false;
  
  // for going into other directories
  let permissionDenied = false;

  // for form submit
  let submitSuccess = false;

  export let data: PageData;
  // important to have {} around username 
  // else will show ✅ Successfully Logged in, [object Object]!
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring
  const {username} = data;
  
  
  onMount(() => {
    // removing ?loginSuccess=1 and ?permissionDenied=1 to avoid showing popup on page refresh
    const url = new URLSearchParams(location.search);
  
    if (url.get('loginSuccess')) {
      loginSuccess = true;
      history.replaceState(null, '', location.pathname);
    }
    
    else if (url.get('permissionDenied')) {
      permissionDenied = true;
      history.replaceState(null, '', location.pathname);
    }
  });

  // popups
  $: if (loginSuccess) {
    const timeout = setTimeout(() => (loginSuccess = false), 3000);
    onDestroy(() => clearTimeout(timeout));
  }

  $: if (permissionDenied) {
    const timeout = setTimeout(() => (permissionDenied = false), 3000);
    onDestroy(() => clearTimeout(timeout));
  }

  $: if (submitSuccess) {
    const timeout = setTimeout(() => (submitSuccess = false), 3000);
    onDestroy(() => clearTimeout(timeout));
  }

  // for dropdown menu
  let birthYears: string[] = [];
  for (let n = 2007; n <= 2014; n++) {
    birthYears.push(n.toString());
  }

  const events = [
    { id: 'DISC', label: '擲鐵餅' },
    { id: 'TRAC', label: '田徑' },
    { id: 'HIGH', label: '跳高' },
    { id: 'LONG', label: '跳遠' },
    { id: 'RELA', label: '接力賽' },
    { id: 'JAVE', label: '標槍' }
  ];

  let dob = '';
  let selectedEvents: string[] = [];
  let notInterested = false;

  // clear and disable other events if no enrollment is checked 
  function noEnrollment() {
    if (notInterested) {
      selectedEvents = [];
    }
  }

  function selectingEvent() {
    if (selectedEvents.length > 0) {
      notInterested = false;
    }
  }


</script>

<style>
  .container {
    max-width: 600px;
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
</style>

{#if loginSuccess}
  <div
    class="glass-popup popup-s"
    transition:slide={{ duration: 300 }}
  >
    <span>✅ 成功登入， {username}!</span>
    <button class="close-btn" on:click={() => loginSuccess = false}>
      &times;
    </button>
  </div>
{/if}

{#if permissionDenied}
<div
class="glass-popup popup-f"
transition:slide={{ duration: 300 }}
>
<span>❌ 你無權存取該頁面</span>
<button class="close-btn" on:click={() => permissionDenied = false}>
  &times;
</button>
</div>
{/if}

{#if submitSuccess}
  <div
    class="glass-popup popup-s"
    transition:slide={{ duration: 300 }}
  >
    <span>✅ 報名表已提交！</span>
    <button class="close-btn" on:click={() => submitSuccess = false}>
      &times;
    </button>
  </div>
{/if}

<div class="glass container">
  <div class="header">
    <h1>歡迎來到運動會報名門戶， {username}!</h1>
    <LogoutButton />
  </div>

  <form method="POST">
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label class="font-semibold mb-2 block">選擇你的出生年份</label>
    <select
      name="dob"
      required
      bind:value={dob}
      class="block w-full rounded-md p-2 mb-4 text-white bg-gray-800"
    >
      <option value="" disabled selected>選擇出生年份</option>
      {#each birthYears as year}
        <option value={year}>{year}</option>
      {/each}
    </select>

    <fieldset>
    <!-- svelte-ignore a11y_label_has_associated_control -->
      <label class="font-semibold mb-2">選擇你想參加的活動</label>

      {#each events as event}
        <div>
          <label>
            <!-- checkbox styles from https://marek-rozmus.medium.com/styling-checkbox-with-tailwind-46a92c157e2d -->
            <input
              type="checkbox"
              name="eid"
              class="appearance-none w-4 h-4 border-2 rounded-sm"
              value={event.id}
              bind:group={selectedEvents}
              on:change={selectingEvent}
              disabled={notInterested}
            />
            <span class="ml-2">{event.label}</span>
          </label>
        </div>
      {/each}

      <div>
        <label>
          <input
            type="checkbox"
            name="eid"
            class="appearance-none w-4 h-4 border-2 rounded-sm"
            value={'NULL'}
            bind:checked={notInterested}
            on:change={noEnrollment}
          />
          <span class="ml-2">我不想參加</span>
        </label>
      </div>
    </fieldset>

    <button
      type="submit"
      on:click={() => submitSuccess = true}
      class="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md"
      style="transition: .3s;"
    >
      提交報名表
    </button>
  </form>
</div>

