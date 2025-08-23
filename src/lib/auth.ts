import jwt from 'jsonwebtoken';

const privateKey = '1337';

export function createSessionToken(username: string) {
  return jwt.sign({ username }, privateKey, { expiresIn: '1d' });
}

// get username from token or null if invalid or expired
export function getSessionUser(token: string) {
  try {
    const payload = jwt.verify(token, privateKey) as { username: string };
    return payload.username;
  } catch {
    return null;
  }
}
