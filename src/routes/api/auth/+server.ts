import { validateUser } from '$lib/credentials.server';
import type { RequestHandler } from '@sveltejs/kit';
import { createSessionToken } from '$lib/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const action: string = body.action;

    if (action === 'login') {
      const username: string = body.username;
      const password: string = body.password;

      if (!username || !password) {
        return new Response(JSON.stringify({ error: '需要用戶名稱和密碼' }), { status: 400 });
      }

      if (validateUser(username, password) !== false) {
        const token = createSessionToken(username);
        cookies.set('auth_token', token, {
          /**
           * jwt cookie security learnt from https://medium.com/@jelly771001/js-session-cookie-json-web-token-jwt-77a8edb98fe9
           * can exclude httpOnly, sameSite and secure they do nothing in localhost but good practice
           * code from https://stackoverflow.com/questions/75970523/
           */
          path: '/', // required for code to work
          httpOnly: true, // prevent xss attacks 
          maxAge: 24 * 60 * 60 * 1000, //1 day
          sameSite: 'none', // prevent csrf attacks
          secure : true // https protocol
        });
        return new Response(JSON.stringify({ message: '成功登入' }), { status: 200 });
      } else {
        return new Response(JSON.stringify({ error: '用戶名稱或密碼錯誤' }), { status: 401 });
      }
    }

    if (action === 'logout') {
      const token = cookies.get('auth_token');
      if (token !== undefined) {
        cookies.delete('auth_token', { path: '/' });
      }
      return new Response(JSON.stringify({ message: '成功登出' }), { status: 200 });
    }

    // return error (only if someone somehow got to here)
    return new Response(JSON.stringify({ error: '無效操作 (How did you get here)' }), { status: 400 });
  } catch (e) {
    const message = e instanceof Error ? e.message : '未知錯誤';
    return new Response(JSON.stringify({ error: message }), { status: 500 }); // internal server error (i doubt this will ever happen)
  }
};
