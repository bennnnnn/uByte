/** Everything is free. */

export function hasPaidAccess(_plan?: string | null): boolean {
  return true;
}

export function isActiveSubscriber(_plan?: string | null): boolean {
  return false;
}
