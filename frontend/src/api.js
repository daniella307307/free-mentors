import { GraphQLClient } from 'graphql-request'

const endpoint =
  import.meta.env.VITE_GRAPHQL_URL || 'http://127.0.0.1:8000/graphql/'

/** Token persisted by Redux auth slice under `fm_auth`. */
export const getStoredToken = () => {
  try {
    const raw = localStorage.getItem('fm_auth')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.token) return parsed.token
    }
  } catch {
    /* ignore */
  }
  return localStorage.getItem('token') || ''
}

export const createClient = (token) => {
  return new GraphQLClient(endpoint, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export const getClient = () => createClient(getStoredToken())