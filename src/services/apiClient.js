const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`Error de API (${response.status}): ${response.statusText}`)
  }

  if (response.status === 204) return null

  return response.json()
}
