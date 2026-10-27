import Modal from "../../../components/ui/Modal.jsx";

function DeleteMeasurementUnitModal({
  unit,
  deleting,
  error,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      closeDisabled={deleting}
      description="Esta accion no se puede deshacer."
      onClose={onCancel}
      title="Eliminar unidad de medida"
    >
      <div className="delete-provider-content">
        <p>
          ¿Seguro que deseas eliminar la unidad{" "}
          <strong>
            {unit.name} ({unit.abbreviation})
          </strong>
          ?
        </p>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="entity-form-actions">
          <button
            className="btn-secondary"
            disabled={deleting}
            onClick={onCancel}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="btn-danger"
            disabled={deleting}
            onClick={onConfirm}
            type="button"
          >
            {deleting ? "Eliminando..." : "Eliminar unidad"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteMeasurementUnitModal;
