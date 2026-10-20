import { apiRequest } from '../../../services/apiClient.js'

const endpoint = '/unidades-medida'

export function getMeasurementUnits() {
  return apiRequest(endpoint)
}

export function createMeasurementUnit(unitData) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(unitData),
  })
}

export function updateMeasurementUnit(id, unitData) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(unitData),
  })
}

export function deleteMeasurementUnit(id) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
