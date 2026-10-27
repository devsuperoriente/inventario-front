import { useCallback, useEffect, useMemo, useState } from "react";
import EmptyState from "../../../components/feedback/EmptyState.jsx";
import Toast from "../../../components/feedback/Toast.jsx";
import PageHeading from "../../../components/ui/PageHeading.jsx";
import DeleteMovementTypeModal from "../components/DeleteMovementTypeModal.jsx";
import MovementTypeFilters from "../components/MovementTypeFilters.jsx";
import MovementTypeForm from "../components/MovementTypeForm.jsx";
import MovementTypeTable from "../components/MovementTypeTable.jsx";
import {
  createMovementType,
  deleteMovementType,
  getMovementTypes,
  updateMovementType,
} from "../services/movementTypesApi.js";

function MovementTypesPage() {
  const [movementTypes, setMovementTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const fetchMovementTypes = useCallback(async () => {
    try {
      const data = await getMovementTypes();
      setMovementTypes(data);
      setLoadError(null);
    } catch (err) {
      console.error("Error al cargar tipos de movimiento:", err);
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    getMovementTypes()
      .then((data) => {
        if (isCurrent) setMovementTypes(data);
      })
      .catch((err) => {
        console.error("Error al cargar tipos de movimiento:", err);
        if (isCurrent) setLoadError(err.message);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const filteredTypes = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    return movementTypes.filter((movementType) =>
      [
        movementType.name,
        movementType.description,
        movementType.direction,
      ].some((value) =>
        String(value ?? "")
          .toLocaleLowerCase()
          .includes(normalizedSearch),
      ),
    );
  }, [movementTypes, search]);

  async function handleSaveType(formData) {
    setSaving(true);
    setFormError(null);
    setToast(null);

    try {
      const wasEditing = Boolean(editingType);
      if (editingType) {
        await updateMovementType(editingType.id, formData);
      } else {
        await createMovementType(formData);
      }

      setFormOpen(false);
      setEditingType(null);
      setLoading(true);
      await fetchMovementTypes();
      setToast({
        type: "success",
        message: wasEditing
          ? "Tipo de movimiento actualizado correctamente."
          : "Tipo de movimiento creado correctamente.",
      });
    } catch (err) {
      console.error("Error al guardar tipo de movimiento:", err);
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function openCreateForm() {
    setEditingType(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(movementType) {
    setEditingType(movementType);
    setFormError(null);
    setFormOpen(true);
  }

  async function handleDeleteType() {
    if (!typeToDelete) return;
    const movementType = typeToDelete;

    setDeletingId(movementType.id);
    setDeleteError(null);
    setToast(null);

    try {
      await deleteMovementType(movementType.id);
      setMovementTypes((currentTypes) =>
        currentTypes.filter(
          (currentType) => currentType.id !== movementType.id,
        ),
      );
      setTypeToDelete(null);
      setToast({
        type: "success",
        message: `Tipo "${movementType.name}" eliminado correctamente.`,
      });
    } catch (err) {
      console.error("Error al eliminar tipo de movimiento:", err);
      const message = `No se pudo eliminar "${movementType.name}". ${err.message}`;
      setDeleteError(message);
      setToast({
        type: "warning",
        message: `${message} Verifica si esta asociado a movimientos de inventario.`,
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <PageHeading
        className="provider-page-heading"
        eyebrow="INVENTARIO"
        title="Tipos de movimiento"
        description="Configura las categorias que clasifican las entradas, salidas y ajustes de inventario."
      />

      <section className="panel provider-panel">
        <div className="panel-heading provider-panel-heading">
          <div>
            <h2>Tipos registrados</h2>
            <p>
              {filteredTypes.length} de {movementTypes.length} tipos
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={openCreateForm}
            type="button"
          >
            + Nuevo tipo
          </button>
        </div>

        {loadError ? (
          <div className="feature-load-error" role="alert">
            <p>No se pudieron cargar los tipos de movimiento: {loadError}</p>
            <button
              className="btn-secondary"
              onClick={() => {
                setLoading(true);
                setLoadError(null);
                fetchMovementTypes();
              }}
              type="button"
            >
              Reintentar
            </button>
          </div>
        ) : loading ? (
          <p className="feature-loading" role="status">
            Cargando tipos de movimiento...
          </p>
        ) : movementTypes.length === 0 ? (
          <EmptyState
            title="Aun no hay tipos configurados"
            description="Crea tipos como recepcion, consumo en produccion o ajuste de inventario."
          />
        ) : (
          <>
            <MovementTypeFilters search={search} onSearchChange={setSearch} />
            <MovementTypeTable
              deletingId={deletingId}
              items={filteredTypes}
              onDelete={(movementType) => {
                setTypeToDelete(movementType);
                setDeleteError(null);
              }}
              onEdit={openEditForm}
            />
          </>
        )}
      </section>

      {formOpen && (
        <MovementTypeForm
          key={editingType?.id ?? "new-movement-type"}
          error={formError}
          initialValues={editingType}
          onCancel={() => {
            setFormOpen(false);
            setEditingType(null);
            setFormError(null);
          }}
          onSubmit={handleSaveType}
          submitting={saving}
        />
      )}

      {typeToDelete && (
        <DeleteMovementTypeModal
          error={deleteError}
          deleting={deletingId === typeToDelete.id}
          onCancel={() => {
            if (deletingId === null) {
              setTypeToDelete(null);
              setDeleteError(null);
            }
          }}
          onConfirm={handleDeleteType}
          movementType={typeToDelete}
        />
      )}

      <Toast
        duration={4500}
        key={toast?.message ?? "empty-movement-type-toast"}
        message={toast?.message}
        onClose={dismissToast}
        type={toast?.type ?? "success"}
      />
    </>
  );
}

export default MovementTypesPage;
