import { apiRequest } from '../../../services/apiClient.js'

export function getInventory() {
  return apiRequest('/inventory')
}

export function getInventoryItem(id) {
  return apiRequest(`/inventory/${encodeURIComponent(id)}`)
}

export function createInventoryItem(item) {
  return apiRequest('/inventory', {
    method: 'POST',
    body: JSON.stringify(item),
  })
}
