import { createClient, getStoredToken } from '../api.js'

export const request = async (query, variables = {}) => {
  const token = getStoredToken()
  const client = createClient(token)

  return client.request(query, variables)
}