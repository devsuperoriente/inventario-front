import { apiRequest } from '../../../services/apiClient.js'

const endpoint = '/pedidos'

export function getOrders() {
  return apiRequest(endpoint)
}

export function createOrder(orderData) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(orderData),
  })
}

export function updateOrder(id, orderData) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(orderData),
  })
}

export function deleteOrder(id) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
