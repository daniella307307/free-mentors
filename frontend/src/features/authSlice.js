import { createSlice } from '@reduxjs/toolkit'

const loadPersisted = () => {
  try {
    const raw = localStorage.getItem('fm_auth')
    return raw ? JSON.parse(raw) : { token: '', user: null }
  } catch {
    return { token: '', user: null }
  }
}

const initialState = loadPersisted()

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action) {
      state.token = action.payload.token
      state.user = action.payload.user
      localStorage.setItem('fm_auth', JSON.stringify(state))
    },
    clearAuth(state) {
      state.token = ''
      state.user = null
      localStorage.removeItem('fm_auth')
    },
  },
})

export const { setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer
