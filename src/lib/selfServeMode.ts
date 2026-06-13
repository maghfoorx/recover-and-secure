import { useEffect, useState } from "react";

const SELF_SERVE_STORAGE_KEY = "selfServeEnabled";
const SELF_SERVE_EVENT = "self-serve-mode-change";

function notifySelfServeModeChange() {
  window.dispatchEvent(new Event(SELF_SERVE_EVENT));
}

export function isSelfServeEnabled() {
  return localStorage.getItem(SELF_SERVE_STORAGE_KEY) === "true";
}

export function enableSelfServeMode() {
  localStorage.setItem(SELF_SERVE_STORAGE_KEY, "true");
  notifySelfServeModeChange();
}

export function disableSelfServeMode() {
  localStorage.removeItem(SELF_SERVE_STORAGE_KEY);
  notifySelfServeModeChange();
}

export function useSelfServeMode() {
  const [isEnabled, setIsEnabled] = useState(isSelfServeEnabled());

  useEffect(() => {
    const updateMode = () => setIsEnabled(isSelfServeEnabled());

    window.addEventListener(SELF_SERVE_EVENT, updateMode);
    window.addEventListener("storage", updateMode);

    return () => {
      window.removeEventListener(SELF_SERVE_EVENT, updateMode);
      window.removeEventListener("storage", updateMode);
    };
  }, []);

  return isEnabled;
}
