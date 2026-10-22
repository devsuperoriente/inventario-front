import { useEffect, useMemo, useState } from 'react'
import { apiRequest, refreshAuthSession } from '../services/apiClient.js'
import { AuthContext } from './authContext.js'

function parseSession(response) {
  // Si tu backend al refrescar manda el usuario plano o dentro de 'user'
  const userData = response?.user || response
  const username = userData?.username || userData?.name

  // Extraemos los permisos de donde vengan
  const permissions = response?.permissions || userData?.permissions || []

  if (
    !userData
    || typeof username !== 'string'
    || username.length === 0
    || !Array.isArray(permissions)
    || !permissions.every((permission) => typeof permission === 'string')
  ) {
    throw new Error('La respuesta de autenticación no tiene el formato esperado.')
  }

  return {
    user: {
      ...userData,
      name: username,
    },
    permissions: permissions,
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    let isMounted = true

    function handleRefreshed(event) {
      try {
        setSession(parseSession(event.detail))
        setAuthError('')
      } catch (error) {
        setSession(null)
        setAuthError(error.message)
      }
    }

    function handleExpired() {
      setSession(null)
    }

    window.addEventListener('pancontrol:auth-refreshed', handleRefreshed)
    window.addEventListener('pancontrol:auth-expired', handleExpired)

    refreshAuthSession()
      .then((response) => {
        if (isMounted) setSession(parseSession(response))
      })
      .catch((error) => {
        console.error("Error al refrescar sesión:", error); // <-- Añade esto para depurar
        if (isMounted && error.status !== 401 && error.status !== 403) {
          setAuthError(error.message || 'No fue posible renovar la sesión.')
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
      window.removeEventListener('pancontrol:auth-refreshed', handleRefreshed)
      window.removeEventListener('pancontrol:auth-expired', handleExpired)
    }
  }, [])

  async function login(credentials) {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    console.log("Respuesta de sesión del backend:", response); // <--- Revisa esto en la consola
    const nextSession = parseSession(response)
    setAuthError('')
    setSession(nextSession)
  }

  async function logout() {
    await apiRequest('/auth/logout', { method: 'POST' })
    setSession(null)
  }

  const value = useMemo(() => ({
    user: session?.user ?? null,
    permissions: session?.permissions ?? [],
    isLoading,
    authError,
    login,
    logout,
    canAccessFeature: (featureId) => {
    const permissions = session?.permissions ?? []
    
    if (permissions.includes('*')) return true
    
    // Si el usuario tiene permisos específicos de órdenes, permitimos ver el módulo 'orders'
    if (featureId === 'orders' && permissions.some(p => p.startsWith('orders'))) {
      return true
    }

    return permissions.includes(featureId)
  },
  }), [session, isLoading, authError])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
