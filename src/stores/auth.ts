import { computed, shallowRef } from 'vue'
import { defineStore } from 'pinia'

import type { AuthStatus, AuthUser, LoginCredentials } from '@/types/auth'

interface AuthSession {
  token: string
  user: AuthUser
}

const storageKey = 'travelgraph.auth.session'

function createDemoSession(credentials: LoginCredentials): AuthSession {
  const name = credentials.email.split('@')[0]?.trim() || 'Usuário'

  return {
    token: crypto.randomUUID(),
    user: {
      id: crypto.randomUUID(),
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: credentials.email,
      role: 'dashboard-user'
    }
  }
}

function readSession() {
  if (typeof window === 'undefined') {
    return null
  }

  const rawSession = window.localStorage.getItem(storageKey)

  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession) as AuthSession
  } catch {
    window.localStorage.removeItem(storageKey)
    return null
  }
}

function writeSession(session: AuthSession | null) {
  if (typeof window === 'undefined') {
    return
  }

  if (session === null) {
    window.localStorage.removeItem(storageKey)
    return
  }

  window.localStorage.setItem(storageKey, JSON.stringify(session))
}

export const useAuthStore = defineStore('auth', () => {
  const token = shallowRef<string | null>(null)
  const user = shallowRef<AuthUser | null>(null)
  const status = shallowRef<AuthStatus>('anonymous')
  const hydrated = shallowRef(false)

  const isAuthenticated = computed(() => status.value === 'authenticated' && token.value !== null)

  function applySession(nextToken: string | null, nextUser: AuthUser | null) {
    token.value = nextToken
    user.value = nextUser
    status.value = nextToken ? 'authenticated' : 'anonymous'
    writeSession(nextToken && nextUser ? { token: nextToken, user: nextUser } : null)
  }

  function hydrateSession() {
    const storedSession = readSession()
    applySession(storedSession?.token ?? null, storedSession?.user ?? null)
    hydrated.value = true
  }

  function login(credentials: LoginCredentials) {
    status.value = 'loading'

    const session = createDemoSession(credentials)
    applySession(session.token, session.user)
    hydrated.value = true
  }

  function logout() {
    applySession(null, null)
    hydrated.value = true
  }

  return {
    token,
    user,
    status,
    hydrated,
    isAuthenticated,
    hydrateSession,
    login,
    logout
  }
})
