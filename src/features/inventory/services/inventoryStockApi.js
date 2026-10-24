import { apiRequest } from '../../../services/apiClient.js'

export function getStockByProduct(productId) {
  return apiRequest(`/lotes/producto/${encodeURIComponent(productId)}/existencias`)
}
