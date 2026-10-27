import { useCallback, useEffect, useMemo, useState } from "react";
import EmptyState from "../../../components/feedback/EmptyState.jsx";
import Toast from "../../../components/feedback/Toast.jsx";
import PageHeading from "../../../components/ui/PageHeading.jsx";
import DeleteMeasurementUnitModal from "../components/DeleteMeasurementUnitModal.jsx";
import MeasurementUnitFilters from "../components/MeasurementUnitFilters.jsx";
import MeasurementUnitForm from "../components/MeasurementUnitForm.jsx";
import MeasurementUnitTable from "../components/MeasurementUnitTable.jsx";
import {
  createMeasurementUnit,
  deleteMeasurementUnit,
  getMeasurementUnits,
  updateMeasurementUnit,
} from "../services/measurementUnitsApi.js";

function MeasurementUnitsPage() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const fetchUnits = useCallback(async () => {
    try {
      const data = await getMeasurementUnits();
      setUnits(data);
      setLoadError(null);
    } catch (err) {
      console.error("Error al cargar unidades de medida:", err);
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    getMeasurementUnits()
      .then((data) => {
        if (isCurrent) setUnits(data);
      })
      .catch((err) => {
        console.error("Error al cargar unidades de medida:", err);
        if (isCurrent) setLoadError(err.message);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const filteredUnits = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    return units.filter((unit) =>
      [unit.name, unit.abbreviation, unit.description].some((value) =>
        String(value ?? "")
          .toLocaleLowerCase()
          .includes(normalizedSearch),
      ),
    );
  }, [search, units]);

  async function handleSaveUnit(formData) {
    setSaving(true);
    setFormError(null);
    setToast(null);

    try {
      const wasEditing = Boolean(editingUnit);
      if (editingUnit) {
        await updateMeasurementUnit(editingUnit.id, formData);
      } else {
        await createMeasurementUnit(formData);
      }

      setFormOpen(false);
      setEditingUnit(null);
      setLoading(true);
      await fetchUnits();
      setToast({
        type: "success",
        message: wasEditing
          ? "Unidad de medida actualizada correctamente."
          : "Unidad de medida creada correctamente.",
      });
    } catch (err) {
      console.error("Error al guardar unidad de medida:", err);
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function openCreateForm() {
    setEditingUnit(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(unit) {
    setEditingUnit(unit);
    setFormError(null);
    setFormOpen(true);
  }

  async function handleDeleteUnit() {
    if (!unitToDelete) return;
    const unit = unitToDelete;

    setDeletingId(unit.id);
    setDeleteError(null);
    setToast(null);

    try {
      await deleteMeasurementUnit(unit.id);
      setUnits((currentUnits) =>
        currentUnits.filter((currentUnit) => currentUnit.id !== unit.id),
      );
      setUnitToDelete(null);
      setToast({
        type: "success",
        message: `Unidad "${unit.name}" (${unit.abbreviation}) eliminada correctamente.`,
      });
    } catch (err) {
      console.error("Error al eliminar unidad de medida:", err);
      const message = `No se pudo eliminar la unidad "${unit.name}". ${err.message}`;
      setDeleteError(message);
      setToast({
        type: "warning",
        message: `${message} Verifica si esta siendo usada en inventario o recetas.`,
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
        title="Unidades de medida"
        description="Administra las unidades usadas en cantidades de materias primas y recetas."
      />

      <section className="panel provider-panel">
        <div className="panel-heading provider-panel-heading">
          <div>
            <h2>Unidades registradas</h2>
            <p>
              {filteredUnits.length} de {units.length} unidades
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={openCreateForm}
            type="button"
          >
            + Nueva unidad
          </button>
        </div>

        {loadError ? (
          <div className="feature-load-error" role="alert">
            <p>No se pudieron cargar las unidades: {loadError}</p>
            <button
              className="btn-secondary"
              onClick={() => {
                setLoading(true);
                setLoadError(null);
                fetchUnits();
              }}
              type="button"
            >
              Reintentar
            </button>
          </div>
        ) : loading ? (
          <p className="feature-loading" role="status">
            Cargando unidades...
          </p>
        ) : units.length === 0 ? (
          <EmptyState
            title="Aun no hay unidades configuradas"
            description="Crea unidades como kilogramo, gramo, litro o unidad."
          />
        ) : (
          <>
            <MeasurementUnitFilters
              search={search}
              onSearchChange={setSearch}
            />
            <MeasurementUnitTable
              deletingId={deletingId}
              items={filteredUnits}
              onDelete={(unit) => {
                setUnitToDelete(unit);
                setDeleteError(null);
              }}
              onEdit={openEditForm}
            />
          </>
        )}
      </section>

      {formOpen && (
        <MeasurementUnitForm
          key={editingUnit?.id ?? "new-measurement-unit"}
          error={formError}
          initialValues={editingUnit}
          onCancel={() => {
            setFormOpen(false);
            setEditingUnit(null);
            setFormError(null);
          }}
          onSubmit={handleSaveUnit}
          submitting={saving}
        />
      )}

      {unitToDelete && (
        <DeleteMeasurementUnitModal
          error={deleteError}
          deleting={deletingId === unitToDelete.id}
          onCancel={() => {
            if (deletingId === null) {
              setUnitToDelete(null);
              setDeleteError(null);
            }
          }}
          onConfirm={handleDeleteUnit}
          unit={unitToDelete}
        />
      )}

      <Toast
        duration={4500}
        key={toast?.message ?? "empty-measurement-unit-toast"}
        message={toast?.message}
        onClose={dismissToast}
        type={toast?.type ?? "success"}
      />
    </>
  );
}

export default MeasurementUnitsPage;
