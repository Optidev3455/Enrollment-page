<script lang="ts">
  import type { PageData } from './$types';
  import { onMount, onDestroy } from 'svelte';
  import { slide } from 'svelte/transition';
  import LogoutButton from '$lib/LogoutButton.svelte';

  // for login popup
  let loginSuccess = false;
  
  // for going into other directories
  let permissionDenied = false;

  // csv file contents
  export let data: PageData;
  const { username, studentEnrollments } = data;
  

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

  // clean up the enrollment csv data
  function downloadCSV() {
    // add first line to csv
    const header = 'SID,EID';
    const lines: string[] = [header];

    for (const student of studentEnrollments) {
        // students with null are skipped
      if (student.events[0] === 'None') {
        continue;
      }

      // students with eids and null are considered as null
      const hasNull = student.events.includes('NULL'); // boolean, true if contains 'NULL' else false
      // put NULL if hasNull is true else eid
      const eventsToWrite = hasNull ? ['NULL'] : student.events;
      // remove duplicate eid using Set (new array of unique values)
      // code from https://stackoverflow.com/questions/9229645
      const uniqueEvents = Array.from(new Set(eventsToWrite));

      for (const eid of uniqueEvents) {
        // exclude students with 'NULL' eid
        if (eid === 'NULL') {
            continue;
        } 
        else {
          lines.push(`${student.sid},${eid}`);
        }
      }
    }
    
    // skip to next line with every new eid
    const csvContent = lines.join('\n'); 

    // direct download csv file
    // learnt from https://stackoverflow.com/questions/75385478

    // making sure file is csv 
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const fileType = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'ENROLMENT.csv';
    link.href = fileType;
    link.click();

    // remove url after download
    URL.revokeObjectURL(fileType);
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
    padding: .5rem;
    text-align: left;
  }

  th.sid, td.sid {
    width: 1em;
    white-space: nowrap;
  }

  th.status, td.status {
    width: .8em;
    text-align: center;
  }

  th.events, td.events {
    white-space: nowrap;
  }

  thead {
    background-color: rgba(255 255 255 / 0.1);
  }

  .download-btn {
    margin-bottom: 1rem;
    background-color: #4f46e5;
    color: #fff;
    font-weight: 600;
    padding: .5rem 1rem;
    border-radius: .375rem;
    cursor: pointer;
    border: none;
    transition: .3s;
  }

  .download-btn:hover {
    background-color: #4338ca;
  }
</style>

{#if loginSuccess}
  <div
    class="glass-popup popup-s"
    transition:slide={{ duration: 300 }}
  >
    <span>✅ Successfully Logged in, {username}!</span>
    <button class="close-btn"  on:click={() => loginSuccess = false}>
      &times;
    </button>
  </div>
{/if}

{#if permissionDenied}
  <div
    class="glass-popup popup-f"
    transition:slide={{ duration: 300 }}
  >
    <span>❌ You don't have permission to access that page.</span>
    <button class="close-btn" on:click={() => permissionDenied = false}>
      &times;
    </button>
  </div>
{/if}

<div class="glass container">
  <div class="header">
    <h1>Welcome to the Management Portal, {username}!</h1>
    <LogoutButton />
  </div>

  <h2>Student Enrollment Report</h2>

  <table>
    <thead>
      <tr>
        <th class="sid">Student ID</th>
        <th class="status">Status</th>
        <th class="events">Enrolled Events</th>
      </tr>
    </thead>
    <tbody>
      {#each studentEnrollments as { sid, enrolled, events }}
        <tr>
          <td class="sid">{sid}</td>
          <td class="status">
            {#if enrolled}
              <span>✅</span>
            {:else}
              <span>❌</span>
            {/if}
          </td>
          <td class="events">{events.join(', ')}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <br>
  <button class="download-btn" on:click={downloadCSV}>
    Download ENROLMENT.csv
  </button>
</div>
