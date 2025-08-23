import fs from 'fs';
import path from 'path';

// both will be base64 hashed
interface User {
  username: string;
  passwordBase64: string;
}

const credentialsPath = path.resolve('credentials.hash');
let users: User[] = [];


export function loadCredentials() {
  // create credentials.hash if it is not foudn
  if (!fs.existsSync(credentialsPath)) {
    fs.writeFileSync(credentialsPath, '');
    users = [];
    return;
  }
  const credentials = fs.readFileSync(credentialsPath, 'utf-8');

  // decodes the base64 hashed credentials
  if (credentials !== null) {
    const jsonString = Buffer.from(credentials, 'base64').toString('utf8');
    users = JSON.parse(jsonString);
  } else {
    users = [];
  }
}

export function saveCredentials() {
  const jsonString = JSON.stringify(users);
  const encoded = Buffer.from(jsonString, 'utf8').toString('base64');
  fs.writeFileSync(credentialsPath, encoded);
}

export function getAllUsernames(): string[] {
  return users.map(usr => usr.username);
}

function encode(text: string): string {
  return Buffer.from(text, 'utf8').toString('base64');
}

function decode(encoded: string): string {
  return Buffer.from(encoded, 'base64').toString('utf8');
}

// required or login wont work
loadCredentials();

export function addUser(username: string, password: string) {
  if (users.find(usr => usr.username === username)) {
    throw new Error('User already exists');
  }
  const passwordBase64 = encode(password);
  users.push({ username, passwordBase64 });
  saveCredentials();
}

export function deleteUser(username: string) {
  // loop to find user index
  const i = users.findIndex(usr => usr.username === username);
  if (i === -1) {
    throw new Error('User not found');
  }

  users.splice(i, 1);
  saveCredentials();
}

export function validateUser(username: string, password: string) {
  const user = users.find(usr => usr.username === username);
  // basically not found
  if (user === undefined) {
    return false;
  }
  const decodedPassword = decode(user.passwordBase64);
  return decodedPassword === password;
}
