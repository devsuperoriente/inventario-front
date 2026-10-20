import Modal from '../../../components/ui/Modal.jsx'

function DeleteMovementTypeModal({ movementType, deleting, error, onConfirm, onCancel }) {
  return (
    <Modal
      closeDisabled={deleting}
      description="Esta accion no se puede deshacer."
      onClose={onCancel}
      title="Eliminar tipo de movimiento"
    >
      <div className="delete-provider-content">
        <p>
          ¿Seguro que deseas eliminar <strong>{movementType.name}</strong>?
        </p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="entity-form-actions">
          <button className="btn-secondary" disabled={deleting} onClick={onCancel} type="button">
            Cancelar
          </button>
          <button className="btn-danger" disabled={deleting} onClick={onConfirm} type="button">
            {deleting ? 'Eliminando...' : 'Eliminar tipo'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteMovementTypeModal
