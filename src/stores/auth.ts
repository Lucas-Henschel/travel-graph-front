import { computed, shallowRef } from "vue";
import { defineStore } from "pinia";

import { localStorageKeys } from "@/config/localStorageKeys";
import type { AuthUser } from "@/types/auth";

interface AuthSession {
  token: string;
  user: AuthUser;
}

function readSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(localStorageKeys.ACCESS_TOKEN);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(localStorageKeys.ACCESS_TOKEN);
    window.localStorage.removeItem(localStorageKeys.ACCESS_TOKEN);
    return null;
  }
}

function writeSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;

  if (session === null) {
    window.localStorage.removeItem(localStorageKeys.ACCESS_TOKEN);
    window.localStorage.removeItem(localStorageKeys.ACCESS_TOKEN);
    return;
  }

  window.localStorage.setItem(
    localStorageKeys.ACCESS_TOKEN,
    JSON.stringify(session),
  );
  window.localStorage.setItem(localStorageKeys.ACCESS_TOKEN, session.token);
}

export const useAuthStore = defineStore("auth", () => {
  const token = shallowRef<string | null>(null);
  const user = shallowRef<AuthUser | null>(null);
  const hydrated = shallowRef(false);

  const isAuthenticated = computed(() => token.value !== null);

  function setSession(nextToken: string, nextUser: AuthUser) {
    token.value = nextToken;
    user.value = nextUser;

    writeSession({ token: nextToken, user: nextUser });
  }

  function clearSession() {
    token.value = null;
    user.value = null;

    writeSession(null);
  }

  function hydrateSession() {
    const stored = readSession();

    if (stored) {
      token.value = stored.token;
      user.value = stored.user;
    }

    hydrated.value = true;
  }

  return {
    token,
    user,
    hydrated,
    isAuthenticated,
    setSession,
    clearSession,
    hydrateSession,
  };
});
