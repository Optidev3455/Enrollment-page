import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import {
  loadCredentials,
  addUser,
  deleteUser,
  getAllUsernames,
} from '$lib/credentials.server';

function getUserRole(username: string) {
  const firstLetter = username[0];
  if (firstLetter === 'S') {
    return 'Student';
  }
  if (firstLetter === 'T') {
    return 'Teacher';
  }
  if (firstLetter === 'A') {
    return 'Admin';
  }
  // default role
  // idk how someone will get to this point
  return 'Unknown';
}

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user?.username) {
    throw redirect(303, '/?loginRequired=1');
  }

  const username = locals.user.username;

  // kick non admin users back to their page if they try to access this page
  if (getUserRole(username) === 'Student') {
    throw redirect(303, '/enrollment?permissionDenied=1');
  }
  else if (getUserRole(username) === 'Teacher') {
    throw redirect(303, '/management?permissionDenied=1');
  }

  loadCredentials();
  const usernames = getAllUsernames();
  // turn all users into an object [username, role]
  const allUsers = usernames.map(username => ({ username, role: getUserRole(username) }));

  return {
    username: locals.user.username,
    allUsers,
  };
};

export const actions: Actions = {
  addUser: async ({ request }) => {
    const formData = await request.formData();
    const username = formData.get('addUsername');
    const password = formData.get('addPassword');

    // check if username and password are valid (not only spaces or somehow is not a string)
    if (typeof username !== 'string' || !username.trim() || typeof password !== 'string' || !password.trim()) {
      return fail(400, { error: 'Username and password are required' });
    }

    try {
      // load credentials before adding a new user
      loadCredentials();
      addUser(username, password);
      return { 
        success: true 
      };
    } catch (error: any) {
      return fail(400, { error: error.message || 'Failed to add user' });
    }
  },

  deleteUsers: async ({ request }) => {
    const formData = await request.formData();
    const usernames = formData.getAll('deleteUser') as string[];

    // return error if no users are selected (i.e. selected username's length is 0)
    if (!usernames.length) {
      return fail(400, { error: 'No users selected for deletion' });
    }

    try {
      // load credentials before deleting users
      // making sure the user exists
      loadCredentials();
      for (const username of usernames) {
        deleteUser(username);
      }
      return { 
        success: true 
      };
    } catch (error: any) {
      return fail(400, { error: error.message || 'Failed to delete users' });
    }
  }
};
