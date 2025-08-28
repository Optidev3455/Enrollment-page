import { describe, it, expect, beforeEach, afterAll, beforeAll } from 'vitest';
import * as creds from '$lib/credentials.server';
import fs from 'fs';
import path from 'path';

// write the original credentials data first
const credentialsPath = path.resolve('credentials.hash');
let originalCredentials: string | null = null;

beforeEach(() => {
  // remove all users
  creds.getAllUsernames().forEach(creds.deleteUser);
});

// backup credentials.hash before tests
beforeAll(() => {
  if (fs.existsSync(credentialsPath)) {
    originalCredentials = fs.readFileSync(credentialsPath, 'utf-8');
  }
});

// restore original credentials.hash after tests
afterAll(() => {
  if (originalCredentials !== null) {
    fs.writeFileSync(credentialsPath, originalCredentials);
  }
});

describe('credentials.server', () => {
  it('should add a new user and validate login', () => {
    creds.addUser('S1234', 'S1234');
    expect(creds.validateUser('S1234', 'S1234')).toBe(true);
  });

  it('should not validate with wrong password', () => {
    expect(creds.validateUser('S1234', 'S1243')).toBe(false);
  });

  it('should be error when adding a duplicate user', () => {
    creds.addUser('S1234', 'S1234');
    expect(() => creds.addUser('S1234', 'S1234')).toThrow('User already exists');
  });

  it('should delete a user', () => {
    creds.addUser('S1234', 'S1234');
    creds.deleteUser('S1234');
    expect(creds.validateUser('S1234', 'S1234')).toBe(false);
  });

  it('should throw when deleting a non-existent user', () => {
    expect(() => creds.deleteUser('S1234')).toThrow('User not found');
  });

  it('getAllUsernames returns all usernames', () => {
    creds.addUser('S1234', 'S1234');
    creds.addUser('S5678', 'S5678');
    expect(creds.getAllUsernames()).toContain('S1234');
    expect(creds.getAllUsernames()).toContain('S5678');
  });
});