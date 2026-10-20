import { apiRequest } from '../../../services/apiClient.js'

const endpoint = '/tipos-movimiento'

export function getMovementTypes() {
  return apiRequest(endpoint)
}

export function createMovementType(typeData) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(typeData),
  })
}

export function updateMovementType(id, typeData) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(typeData),
  })
}

export function deleteMovementType(id) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
