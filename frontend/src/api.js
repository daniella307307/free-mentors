import { GraphQLClient } from 'graphql-request'

const endpoint = import.meta.env.VITE_GRAPHQL_URL || 'http://127.0.0.1:8000/graphql/'

export const createClient = (token) =>
  new GraphQLClient(endpoint, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
