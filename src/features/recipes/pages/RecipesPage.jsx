import { useCallback, useEffect, useMemo, useState } from "react";
import EmptyState from "../../../components/feedback/EmptyState.jsx";
import Toast from "../../../components/feedback/Toast.jsx";
import PageHeading from "../../../components/ui/PageHeading.jsx";
import { getProducts } from "../../products/services/productsApi.js";
import DeleteRecipeModal from "../components/DeleteRecipeModal.jsx";
import RecipeDetailsModal from "../components/detail/RecipeDetailsModal.jsx";
import RecipeForm from "../components/RecipeForm.jsx";
import RecipeTable from "../components/RecipeTable.jsx";
import {
  createRecipe,
  deleteRecipe,
  getRecipes,
  updateRecipe,
} from "../services/recipesApi.js";

function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [startWithAddForm, setStartWithAddForm] = useState(false);
  const [toast, setToast] = useState(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const fetchData = useCallback(async () => {
    try {
      const [recipeData, productData] = await Promise.all([
        getRecipes(),
        getProducts(),
      ]);
      setRecipes(recipeData);
      setProducts(productData);
      setLoadError("");
      return recipeData;
    } catch (error) {
      console.error("Error al cargar recetas y productos:", error);
      setLoadError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;
    Promise.all([getRecipes(), getProducts()])
      .then(([recipeData, productData]) => {
        if (!isCurrent) return;
        setRecipes(recipeData);
        setProducts(productData);
      })
      .catch((error) => {
        console.error("Error al cargar recetas y productos:", error);
        if (isCurrent) setLoadError(error.message);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  const filteredRecipes = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return recipes.filter((recipe) =>
      [
        recipe.name,
        recipe.description,
        recipe.version,
        recipe.product?.name,
        recipe.baseYield,
      ].some((value) =>
        String(value ?? "")
          .toLocaleLowerCase()
          .includes(query),
      ),
    );
  }, [recipes, search]);

  async function handleSaveRecipe(formData) {
    setSaving(true);
    setFormError("");
    setToast(null);
    try {
      const wasEditing = Boolean(editingRecipe);
      const existingIds = new Set(recipes.map((recipe) => String(recipe.id)));
      const savedRecipe = editingRecipe
        ? await updateRecipe(editingRecipe.id, formData)
        : await createRecipe(formData);

      setFormOpen(false);
      setEditingRecipe(null);
      setLoading(true);
      const refreshedRecipes = await fetchData();

      if (wasEditing) {
        setToast({
          type: "success",
          message: "Receta actualizada correctamente.",
        });
        return;
      }

      const createdRecipe = savedRecipe?.id
        ? savedRecipe
        : refreshedRecipes?.find(
            (recipe) =>
              !existingIds.has(String(recipe.id)) &&
              recipe.name === formData.name &&
              recipe.version === formData.version &&
              recipe.baseYield === formData.baseYield,
          );

      if (createdRecipe?.id) {
        setStartWithAddForm(true);
        setSelectedRecipe(createdRecipe);
        setToast({
          type: "success",
          message: "Receta creada. Agrega ahora sus productos e ingredientes.",
        });
      } else {
        setToast({
          type: "warning",
          message:
            "Receta creada, pero no se pudo abrir su detalle automáticamente.",
        });
      }
    } catch (error) {
      console.error("Error al guardar receta:", error);
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRecipe() {
    if (!recipeToDelete) return;
    setDeletingId(recipeToDelete.id);
    setDeleteError("");
    try {
      await deleteRecipe(recipeToDelete.id);
      setRecipes((current) =>
        current.filter((recipe) => recipe.id !== recipeToDelete.id),
      );
      setRecipeToDelete(null);
      setToast({
        type: "success",
        message: `Receta "${recipeToDelete.name}" eliminada.`,
      });
    } catch (error) {
      console.error("Error al eliminar receta:", error);
      setDeleteError(`No se pudo eliminar la receta. ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  function closeDetails() {
    setSelectedRecipe(null);
    setStartWithAddForm(false);
  }

  return (
    <>
      <PageHeading
        className="provider-page-heading"
        eyebrow="PRODUCCIÓN"
        title="Recetas"
        description="Define versiones de recetas y administra los productos y cantidades necesarios."
      />

      <section className="panel provider-panel">
        <div className="panel-heading provider-panel-heading">
          <div>
            <h2>Recetas registradas</h2>
            <p>
              {filteredRecipes.length} de {recipes.length} recetas
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              setEditingRecipe(null);
              setFormError("");
              setFormOpen(true);
            }}
            type="button"
          >
            + Nueva receta
          </button>
        </div>

        {loadError ? (
          <div className="feature-load-error" role="alert">
            <p>No se pudieron cargar recetas o productos: {loadError}</p>
            <button
              className="btn-secondary"
              onClick={() => {
                setLoading(true);
                setLoadError("");
                fetchData();
              }}
              type="button"
            >
              Reintentar
            </button>
          </div>
        ) : loading ? (
          <p className="feature-loading" role="status">
            Cargando recetas...
          </p>
        ) : recipes.length === 0 ? (
          <EmptyState
            title="Aún no hay recetas"
            description="Crea una receta con nombre y versión; después podrás añadir sus productos."
          />
        ) : (
          <>
            <div className="inventory-filters">
              <label className="search-field">
                <span className="sr-only">Buscar receta</span>
                <span aria-hidden="true">Buscar</span>
                <input
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Nombre, código o versión"
                  type="search"
                  value={search}
                />
              </label>
            </div>
            <RecipeTable
              deletingId={deletingId}
              items={filteredRecipes}
              onDelete={(recipe) => {
                setRecipeToDelete(recipe);
                setDeleteError("");
              }}
              onEdit={(recipe) => {
                setEditingRecipe(recipe);
                setFormError("");
                setFormOpen(true);
              }}
              onViewDetails={(recipe) => {
                setStartWithAddForm(false);
                setSelectedRecipe(recipe);
              }}
            />
          </>
        )}
      </section>

      {formOpen && (
        <RecipeForm
          error={formError}
          initialValues={editingRecipe}
          key={editingRecipe?.id ?? "new-recipe"}
          onCancel={() => {
            setFormOpen(false);
            setEditingRecipe(null);
            setFormError("");
          }}
          onSubmit={handleSaveRecipe}
          products={products}
          submitting={saving}
        />
      )}

      {selectedRecipe && (
        <RecipeDetailsModal
          key={selectedRecipe.id}
          onClose={closeDetails}
          onNotify={setToast}
          products={products}
          recipe={selectedRecipe}
          startWithAddForm={startWithAddForm}
        />
      )}

      {recipeToDelete && (
        <DeleteRecipeModal
          deleting={deletingId !== null}
          error={deleteError}
          onCancel={() => {
            if (deletingId === null) {
              setRecipeToDelete(null);
              setDeleteError("");
            }
          }}
          onConfirm={handleDeleteRecipe}
          recipe={recipeToDelete}
        />
      )}

      <Toast
        duration={4500}
        key={toast?.message ?? "empty-recipe-toast"}
        message={toast?.message}
        onClose={dismissToast}
        type={toast?.type ?? "success"}
      />
    </>
  );
}

export default RecipesPage;
