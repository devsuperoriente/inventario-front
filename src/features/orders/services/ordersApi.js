import { apiRequest } from "../../../services/apiClient.js";

const endpoint = "/pedidos";
const endpointToday = "/pedidos/today";

export function getOrders() {
  return apiRequest(endpoint);
}

export function getOrdersToday() {
  return apiRequest(endpointToday);
}

export function createOrder(orderData) {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}

export function updateOrder(id, orderData) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(orderData),
  });
}

export function deleteOrder(id) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
