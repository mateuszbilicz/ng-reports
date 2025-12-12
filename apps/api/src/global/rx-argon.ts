import * as argon2 from 'argon2';
import { from } from 'rxjs';

/** Compare password and hash */
export const argon2Verify = (hash: string, password: string) => {
  return from(argon2.verify(hash, password));
};

/** Hash password */
export const argon2Hash = (password: string) => {
  return from(argon2.hash(password));
};
