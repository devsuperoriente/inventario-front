import { apiRequest } from "../../../services/apiClient.js";

const endpoint = "/estados";

export function getOrderStates() {
  return apiRequest(endpoint);
}

export function createOrderState(stateData) {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(stateData),
  });
}

export function updateOrderState(id, stateData) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(stateData),
  });
}

export function deleteOrderState(id) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
