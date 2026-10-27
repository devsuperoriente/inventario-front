import { apiRequest } from "../../../services/apiClient.js";

const endpoint = "/detalle-pedidos";

export function getOrderDetails() {
  return apiRequest(endpoint);
}

export function createOrderDetail(detailData) {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(detailData),
  });
}

export function updateOrderDetail(id, detailData) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(detailData),
  });
}

export function deleteOrderDetail(id) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
