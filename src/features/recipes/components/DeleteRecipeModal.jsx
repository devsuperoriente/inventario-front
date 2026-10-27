import Modal from "../../../components/ui/Modal.jsx";

function DeleteRecipeModal({ recipe, deleting, error, onConfirm, onCancel }) {
  return (
    <Modal
      closeDisabled={deleting}
      description="Esta acción no se puede deshacer."
      onClose={onCancel}
      title="Eliminar receta"
    >
      <div className="delete-provider-content">
        <p>
          ¿Seguro que deseas eliminar <strong>{recipe.name}</strong>, versión{" "}
          <strong>{recipe.version}</strong>?
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
            {deleting ? "Eliminando..." : "Eliminar receta"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteRecipeModal;
