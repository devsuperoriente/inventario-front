import { useCallback, useEffect, useMemo, useState } from "react";
import EmptyState from "../../../../components/feedback/EmptyState.jsx";
import Modal from "../../../../components/ui/Modal.jsx";
import RecipeDetailForm from "./RecipeDetailForm.jsx";
import RecipeDetailTable from "./RecipeDetailTable.jsx";
import {
  createRecipeDetail,
  deleteRecipeDetail,
  getRecipeDetails,
  updateRecipeDetail,
} from "../../services/recipeDetailsApi.js";

function getRecipeId(detail) {
  return detail.recipeId ?? detail.recipe?.id;
}

function RecipeDetailsModal({
  recipe,
  products,
  startWithAddForm = false,
  onClose,
  onNotify,
}) {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [formOpen, setFormOpen] = useState(startWithAddForm);
  const [editingDetail, setEditingDetail] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [detailToDelete, setDetailToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const productsById = useMemo(
    () => new Map(products.map((product) => [String(product.id), product])),
    [products],
  );

  const fetchDetails = useCallback(
    () =>
      getRecipeDetails().then((allDetails) =>
        allDetails.filter(
          (detail) => String(getRecipeId(detail)) === String(recipe.id),
        ),
      ),
    [recipe.id],
  );

  useEffect(() => {
    let isCurrent = true;
    fetchDetails()
      .then((recipeDetails) => {
        if (isCurrent) setDetails(recipeDetails);
      })
      .catch((error) => {
        console.error("Error al cargar ingredientes de la receta:", error);
        if (isCurrent) setLoadError(error.message);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [fetchDetails]);

  async function refreshDetails() {
    try {
      setDetails(await fetchDetails());
      setLoadError("");
    } catch (error) {
      console.error("Error al actualizar ingredientes de la receta:", error);
      setLoadError(error.message);
    }
  }

  async function handleSaveDetail(formData) {
    setSaving(true);
    setFormError("");
    try {
      const payload = { ...formData, recipeId: recipe.id };
      const wasEditing = Boolean(editingDetail);
      if (editingDetail) {
        await updateRecipeDetail(editingDetail.id, payload);
      } else {
        await createRecipeDetail(payload);
      }

      setEditingDetail(null);
      setFormOpen(false);
      await refreshDetails();
      onNotify({
        type: "success",
        message: wasEditing
          ? "Ingrediente actualizado."
          : "Producto agregado a la receta.",
      });
    } catch (error) {
      console.error("Error al guardar ingrediente de receta:", error);
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteDetail() {
    if (!detailToDelete) return;
    const detail = detailToDelete;
    setDeletingId(detail.id);
    setDeleteError("");
    try {
      await deleteRecipeDetail(detail.id);
      setDetails((current) => current.filter((item) => item.id !== detail.id));
      setDetailToDelete(null);
      onNotify({
        type: "success",
        message: "Producto eliminado de la receta.",
      });
    } catch (error) {
      console.error("Error al eliminar ingrediente de receta:", error);
      setDeleteError(error.message);
    } finally {
      setDeletingId(null);
    }
  }

  function resetDetailForm() {
    setFormOpen(false);
    setEditingDetail(null);
    setFormError("");
  }

  const description = `Ingredientes y cantidades de ${recipe.name}, versión ${recipe.version}.`;

  return (
    <Modal
      closeDisabled={saving || deletingId !== null}
      className="order-details-modal"
      description={description}
      onClose={onClose}
      title={`Ingredientes: ${recipe.name} · ${recipe.version}`}
    >
      <div className="order-details-content">
        {formOpen ? (
          <>
            <h3 className="order-details-form-title">
              {editingDetail
                ? "Modificar ingrediente"
                : "Agregar producto a la receta"}
            </h3>
            <RecipeDetailForm
              error={formError}
              initialValues={editingDetail}
              key={editingDetail?.id ?? `new-recipe-detail-${recipe.id}`}
              onCancel={resetDetailForm}
              onSubmit={handleSaveDetail}
              products={products}
              submitting={saving}
            />
          </>
        ) : detailToDelete ? (
          <div className="delete-provider-content">
            <p>¿Quitar este producto de la receta?</p>
            {deleteError && (
              <p className="form-error" role="alert">
                {deleteError}
              </p>
            )}
            <div className="entity-form-actions">
              <button
                className="btn-secondary"
                disabled={deletingId !== null}
                onClick={() => {
                  setDetailToDelete(null);
                  setDeleteError("");
                }}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="btn-danger"
                disabled={deletingId !== null}
                onClick={handleDeleteDetail}
                type="button"
              >
                {deletingId !== null ? "Eliminando..." : "Quitar producto"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="order-details-toolbar">
              <p>
                {details.length} producto{details.length === 1 ? "" : "s"} en la
                receta
              </p>
              <button
                className="btn-primary"
                disabled={loading || products.length === 0}
                onClick={() => {
                  resetDetailForm();
                  setFormOpen(true);
                }}
                type="button"
              >
                + Agregar producto
              </button>
            </div>
            {loadError ? (
              <div className="feature-load-error" role="alert">
                <p>No se pudieron cargar los ingredientes: {loadError}</p>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setLoading(true);
                    setLoadError("");
                    refreshDetails().finally(() => setLoading(false));
                  }}
                  type="button"
                >
                  Reintentar
                </button>
              </div>
            ) : loading ? (
              <p className="feature-loading" role="status">
                Cargando ingredientes...
              </p>
            ) : products.length === 0 ? (
              <EmptyState
                title="No hay productos disponibles"
                description="Registra productos antes de agregarlos como ingredientes de una receta."
              />
            ) : (
              <RecipeDetailTable
                deletingId={deletingId}
                items={details}
                onDelete={(detail) => {
                  setDetailToDelete(detail);
                  setDeleteError("");
                }}
                onEdit={(detail) => {
                  setEditingDetail(detail);
                  setFormError("");
                  setFormOpen(true);
                }}
                productsById={productsById}
              />
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

export default RecipeDetailsModal;
