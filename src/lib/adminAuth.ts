/**
 * Application-level admin password.
 *
 * Single source of truth for every admin-gated action in the app
 * (editing the printer name, managing storage locations, ...).
 * Change the value here to change it everywhere.
 */
export const ADMIN_PASSWORD = "1234";

const UNLOCK_STORAGE_KEY = "adminUnlockedUntil";
const UNLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export function verifyAdminPassword(input: string) {
  return input === ADMIN_PASSWORD;
}

/**
 * Unlocks stay valid for 30 minutes within the current window session so
 * staff are not asked to retype the password for every admin action.
 */
export function isAdminUnlocked() {
  const raw = sessionStorage.getItem(UNLOCK_STORAGE_KEY);
  if (!raw) return false;
  const unlockedUntil = Number(raw);
  if (!Number.isFinite(unlockedUntil) || Date.now() > unlockedUntil) {
    sessionStorage.removeItem(UNLOCK_STORAGE_KEY);
    return false;
  }
  return true;
}

export function unlockAdmin() {
  sessionStorage.setItem(
    UNLOCK_STORAGE_KEY,
    String(Date.now() + UNLOCK_DURATION_MS),
  );
}

export function lockAdmin() {
  sessionStorage.removeItem(UNLOCK_STORAGE_KEY);
}
