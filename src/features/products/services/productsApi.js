import { apiRequest } from '../../../services/apiClient.js'

const endpoint = '/productos'

export function getProducts() {
  return apiRequest(endpoint)
}

export function createProduct(productData) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(productData),
  })
}

export function updateProduct(id, productData) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  })
}

export function deleteProduct(id) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
