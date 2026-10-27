import { apiRequest } from "../../../services/apiClient.js";

export function getProviders() {
  return apiRequest("/proveedores");
}

export function getProviderById(id) {
  return apiRequest(`/proveedores/${encodeURIComponent(id)}`);
}

export function createProvider(supplierData) {
  return apiRequest("/proveedores", {
    method: "POST",
    body: JSON.stringify(supplierData),
  });
}

export function updateProvider(id, supplierData) {
  return apiRequest(`/proveedores/${encodeURIComponent(id)}`, {
    method: "PUT", // o PATCH según lo maneje tu backend
    body: JSON.stringify(supplierData),
  });
}

export function deleteProvider(id) {
  return apiRequest(`/proveedores/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
