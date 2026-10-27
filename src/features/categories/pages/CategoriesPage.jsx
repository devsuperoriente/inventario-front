import { useCallback, useEffect, useMemo, useState } from "react";
import EmptyState from "../../../components/feedback/EmptyState.jsx";
import Toast from "../../../components/feedback/Toast.jsx";
import PageHeading from "../../../components/ui/PageHeading.jsx";
import CategoryFilters from "../components/CategoryFilters.jsx";
import CategoryForm from "../components/CategoryForm.jsx";
import CategoryTable from "../components/CategoryTable.jsx";
import DeleteCategoryModal from "../components/DeleteCategoryModal.jsx";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../services/categoriesApi.js";

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data);
      setLoadError(null);
    } catch (err) {
      console.error("Error al cargar categorias:", err);
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    getCategories()
      .then((data) => {
        if (isCurrent) setCategories(data);
      })
      .catch((err) => {
        console.error("Error al cargar categorias:", err);
        if (isCurrent) setLoadError(err.message);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const filteredCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    return categories.filter((category) =>
      [category.name, category.description].some((value) =>
        String(value ?? "")
          .toLocaleLowerCase()
          .includes(normalizedSearch),
      ),
    );
  }, [categories, search]);

  async function handleSaveCategory(formData) {
    setSaving(true);
    setFormError(null);
    setToast(null);

    try {
      const wasEditing = Boolean(editingCategory);
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await createCategory(formData);
      }

      setFormOpen(false);
      setEditingCategory(null);
      setLoading(true);
      await fetchCategories();
      setToast({
        type: "success",
        message: wasEditing
          ? "Categoria actualizada correctamente."
          : "Categoria creada correctamente.",
      });
    } catch (err) {
      console.error("Error al guardar categoria:", err);
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function openCreateForm() {
    setEditingCategory(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(category) {
    setEditingCategory(category);
    setFormError(null);
    setFormOpen(true);
  }

  async function handleDeleteCategory() {
    if (!categoryToDelete) return;
    const category = categoryToDelete;

    setDeletingId(category.id);
    setDeleteError(null);
    setToast(null);

    try {
      await deleteCategory(category.id);
      setCategories((currentCategories) =>
        currentCategories.filter(
          (currentCategory) => currentCategory.id !== category.id,
        ),
      );
      setCategoryToDelete(null);
      setToast({
        type: "success",
        message: `Categoria "${category.name}" eliminada correctamente.`,
      });
    } catch (err) {
      console.error("Error al eliminar categoria:", err);
      const message = `No se pudo eliminar la categoria "${category.name}". ${err.message}`;
      setDeleteError(message);
      setToast({
        type: "warning",
        message: `${message} Verifica si esta siendo usada en inventario.`,
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <PageHeading
        className="provider-page-heading"
        eyebrow="CONFIGURACION"
        title="Categorias"
        description="Organiza las materias primas para facilitar su consulta en inventario."
      />

      <section className="panel provider-panel">
        <div className="panel-heading provider-panel-heading">
          <div>
            <h2>Categorias registradas</h2>
            <p>
              {filteredCategories.length} de {categories.length} categorias
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={openCreateForm}
            type="button"
          >
            + Nueva categoria
          </button>
        </div>

        {loadError ? (
          <div className="feature-load-error" role="alert">
            <p>No se pudieron cargar las categorias: {loadError}</p>
            <button
              className="btn-secondary"
              onClick={() => {
                setLoading(true);
                setLoadError(null);
                fetchCategories();
              }}
              type="button"
            >
              Reintentar
            </button>
          </div>
        ) : loading ? (
          <p className="feature-loading" role="status">
            Cargando categorias...
          </p>
        ) : categories.length === 0 ? (
          <EmptyState
            title="Aun no hay categorias configuradas"
            description="Crea categorias como harinas, lacteos, levaduras o endulzantes."
          />
        ) : (
          <>
            <CategoryFilters search={search} onSearchChange={setSearch} />
            <CategoryTable
              deletingId={deletingId}
              items={filteredCategories}
              onDelete={(category) => {
                setCategoryToDelete(category);
                setDeleteError(null);
              }}
              onEdit={openEditForm}
            />
          </>
        )}
      </section>

      {formOpen && (
        <CategoryForm
          error={formError}
          initialValues={editingCategory}
          key={editingCategory?.id ?? "new-category"}
          onCancel={() => {
            setFormOpen(false);
            setEditingCategory(null);
            setFormError(null);
          }}
          onSubmit={handleSaveCategory}
          submitting={saving}
        />
      )}

      {categoryToDelete && (
        <DeleteCategoryModal
          category={categoryToDelete}
          deleting={deletingId === categoryToDelete.id}
          error={deleteError}
          onCancel={() => {
            if (deletingId === null) {
              setCategoryToDelete(null);
              setDeleteError(null);
            }
          }}
          onConfirm={handleDeleteCategory}
        />
      )}

      <Toast
        duration={4500}
        key={toast?.message ?? "empty-category-toast"}
        message={toast?.message}
        onClose={dismissToast}
        type={toast?.type ?? "success"}
      />
    </>
  );
}

export default CategoriesPage;
