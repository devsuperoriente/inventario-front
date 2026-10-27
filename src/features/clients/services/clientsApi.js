import { apiRequest } from "../../../services/apiClient.js";

const endpoint = "/clientes";

export function getClients() {
  return apiRequest(endpoint);
}

export function createClient(clientData) {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(clientData),
  });
}

export function updateClient(id, clientData) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(clientData),
  });
}

export function deleteClient(id) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
