import { apiRequest } from "../../../services/apiClient.js";

const endpoint = "/recetas";

export function getRecipes() {
  return apiRequest(endpoint);
}

export function createRecipe(recipeData) {
  console.log(recipeData);
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(recipeData),
  });
}

export function updateRecipe(id, recipeData) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(recipeData),
  });
}

export function deleteRecipe(id) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
