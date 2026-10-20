import Modal from '../../../components/ui/Modal.jsx'

function DeleteOrderStateModal({ state, deleting, error, onConfirm, onCancel }) {
  return (
    <Modal
      closeDisabled={deleting}
      onClose={onCancel}
      title="Eliminar estado"
    >
      <div className="delete-provider-content">
        <p>¿Seguro que deseas eliminar el estado <strong>{state.name}</strong>?</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="entity-form-actions">
          <button className="btn-secondary" disabled={deleting} onClick={onCancel} type="button">
            Cancelar
          </button>
          <button className="btn-danger" disabled={deleting} onClick={onConfirm} type="button">
            {deleting ? 'Eliminando...' : 'Eliminar estado'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteOrderStateModal
