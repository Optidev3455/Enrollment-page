import type { Handle } from '@sveltejs/kit';
import { getSessionUser } from '$lib/auth';

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('auth_token');
  if (token) {
    const username = getSessionUser(token);
    //console.log('hooks: username from token:', username); used for debugging
    if (username) {
      event.locals.user = { username };
    }
  }
  return await resolve(event);
};
