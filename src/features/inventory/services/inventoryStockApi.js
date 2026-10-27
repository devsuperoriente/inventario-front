import { apiRequest } from "../../../services/apiClient.js";

export function getStock() {
  return apiRequest("/lotes/existencias");
}
