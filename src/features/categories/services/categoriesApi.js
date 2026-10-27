import { apiRequest } from "../../../services/apiClient.js";

const endpoint = "/categorias";

export function getCategories() {
  return apiRequest(endpoint);
}

export function createCategory(categoryData) {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(categoryData),
  });
}

export function updateCategory(id, categoryData) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(categoryData),
  });
}

export function deleteCategory(id) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
