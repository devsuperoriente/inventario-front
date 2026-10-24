import { apiRequest } from '../../../services/apiClient.js'

const endpoint = '/movimientos-inventario'

export function getInventoryMovements() {
  return apiRequest(endpoint)
}
