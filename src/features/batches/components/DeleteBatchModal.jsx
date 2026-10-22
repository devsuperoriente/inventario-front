import Modal from '../../../components/ui/Modal.jsx'

function DeleteBatchModal({ batch, deleting, error, onConfirm, onCancel }) {
  return (
    <Modal
      closeDisabled={deleting}
      description="Esta acción no se puede deshacer."
      onClose={onCancel}
      title="Eliminar lote"
    >
      <div className="delete-provider-content">
        <p>¿Seguro que deseas eliminar el lote <strong>{batch.code}</strong>?</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="entity-form-actions">
          <button className="btn-secondary" disabled={deleting} onClick={onCancel} type="button">
            Cancelar
          </button>
          <button className="btn-danger" disabled={deleting} onClick={onConfirm} type="button">
            {deleting ? 'Eliminando...' : 'Eliminar lote'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteBatchModal
