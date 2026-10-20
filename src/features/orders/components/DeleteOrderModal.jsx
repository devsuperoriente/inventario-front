import Modal from '../../../components/ui/Modal.jsx'

function DeleteOrderModal({ order, deleting, error, onConfirm, onCancel }) {
  const orderLabel = order.numberOrder ?? order.orderNumber ?? `#${order.id}`

  return (
    <Modal
      closeDisabled={deleting}
      description="Esta accion no se puede deshacer."
      onClose={onCancel}
      title="Eliminar pedido"
    >
      <div className="delete-provider-content">
        <p>¿Seguro que deseas eliminar el pedido <strong>{orderLabel}</strong>?</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="entity-form-actions">
          <button className="btn-secondary" disabled={deleting} onClick={onCancel} type="button">
            Cancelar
          </button>
          <button className="btn-danger" disabled={deleting} onClick={onConfirm} type="button">
            {deleting ? 'Eliminando...' : 'Eliminar pedido'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteOrderModal
