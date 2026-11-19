import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, getToken } from '../api'

const AppContext = createContext(null)

const readCachedUser = () => {
  try {
    return getToken() ? JSON.parse(localStorage.getItem('user')) : null
  } catch {
    return null
  }
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(readCachedUser)

  const persist = useCallback(({ token, user }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    return user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const login = useCallback(async (email, password) => persist(await api.post('/auth/login', { email, password })), [persist])
  const register = useCallback(async (form) => persist(await api.post('/auth/register', form)), [persist])

  // Re-validate the cached session once on load.
  useEffect(() => {
    if (!getToken()) return
    api.get('/auth/me').then(({ user }) => {
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
    }).catch((err) => {
      if (err.status === 401 || err.status === 403) logout()
    })
  }, [logout])

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
