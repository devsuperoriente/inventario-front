const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const AUTH_REFRESH_PATH = '/auth/refresh'
let refreshPromise = null

async function sendRequest(path, options) {
  const isMultipartBody = options.body instanceof FormData
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body && !isMultipartBody ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `No se pudo conectar con el backend en ${API_BASE_URL}. Verifica que esté iniciado y que CORS permita este frontend.`,
        { cause: error },
      )
    }
    throw error
  }

  if (!response.ok) {
    const error = new Error(
      `Error de API (${response.status}): ${response.statusText || 'Error en la solicitud'}`,
    )
    error.status = response.status
    throw error
  }

  if (response.status === 204) return null

  return response.json()
}

function dispatchAuthEvent(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }))
}

export async function refreshAuthSession() {
  if (!refreshPromise) {
    refreshPromise = sendRequest(AUTH_REFRESH_PATH, { method: 'POST' })
      .then((session) => {
        dispatchAuthEvent('pancontrol:auth-refreshed', session)
        return session
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

export async function apiRequest(path, options = {}) {
  try {
    return await sendRequest(path, options)
  } catch (requestError) {
    const isAuthEndpoint = path.startsWith('/auth/')
    if (requestError.status !== 401 || isAuthEndpoint) throw requestError

    try {
      await refreshAuthSession()
    } catch (refreshError) {
      if (refreshError.status === 401 || refreshError.status === 403) {
        dispatchAuthEvent('pancontrol:auth-expired')
      }
      throw requestError
    }

    return sendRequest(path, options)
  }
}
