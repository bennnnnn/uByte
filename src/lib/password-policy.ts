export const MIN_PASSWORD_LENGTH = 6;

export const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 6 characters and include 1 uppercase letter, 1 lowercase letter, and 1 number.";

const UPPERCASE_RE = /[A-Z]/;
const LOWERCASE_RE = /[a-z]/;
const NUMBER_RE = /[0-9]/;

export function isValidPassword(password: string): boolean {
  return (
    password.length >= MIN_PASSWORD_LENGTH &&
    UPPERCASE_RE.test(password) &&
    LOWERCASE_RE.test(password) &&
    NUMBER_RE.test(password)
  );
}
