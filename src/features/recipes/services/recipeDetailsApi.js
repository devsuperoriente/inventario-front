import { apiRequest } from '../../../services/apiClient.js'

const endpoint = '/detalle-receta'

export function getRecipeDetails() {
  return apiRequest(endpoint)
}

export function createRecipeDetail(detailData) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(detailData),
  })
}

export function updateRecipeDetail(id, detailData) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(detailData),
  })
}

export function deleteRecipeDetail(id) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
