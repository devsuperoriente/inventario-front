import { apiRequest } from '../../../services/apiClient.js'

const ordersEndpoint = '/pedidos'
const productionOrdersEndpoint = '/ordenes-produccion'

export function getOrdersByDate(date) {
  return apiRequest(`${ordersEndpoint}/by-date?date=${encodeURIComponent(date)}`)
}

export function getProductionOrders() {
  return apiRequest(productionOrdersEndpoint)
}

export function getRequiredMaterials(id) {
  return apiRequest(`${productionOrdersEndpoint}/${encodeURIComponent(id)}/insumos-requeridos`)
}

export function registerRawMaterialConsumption(id) {
  return apiRequest(
    `${productionOrdersEndpoint}/${encodeURIComponent(id)}/consumos-materia-prima`,
    { method: 'POST' },
  )
}

export function createProductionOrder(orderData) {
  return apiRequest(productionOrdersEndpoint, {
    method: 'POST',
    body: JSON.stringify(orderData),
  })
}
