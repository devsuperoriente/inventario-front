import { useState } from 'react'
import Modal from '../../../components/ui/Modal.jsx'

const emptyFormData = {
  dateOrder: '',
  clientId: '',
}

function OrderForm({
  initialValues,
  clients,
  clientsLoading,
  clientsError,
  supervisorName,
  onSubmit,
  onCancel,
  submitting,
  error,
}) {
  const [formData, setFormData] = useState(() => ({
    ...emptyFormData,
    ...initialValues,
    dateOrder: initialValues?.dateOrder?.slice(0, 10) ?? '',
    clientId: String(initialValues?.clientId ?? initialValues?.client?.id ?? ''),
  }))

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const selectedClient = clients.find(
      (client) => String(client.id) === formData.clientId,
    )
    await onSubmit({
      dateOrder: formData.dateOrder,
      clientId: selectedClient.id,
    })
  }

  return (
    <Modal
      closeDisabled={submitting}
      description="Selecciona el cliente y define el número y la fecha del pedido. Luego agrega los productos y cantidades."
      onClose={onCancel}
      title={initialValues ? 'Modificar orden' : 'Nueva orden'}
    >
      <form className="entity-form" onSubmit={handleSubmit}>
        <div className="entity-form-grid order-form-grid">
          <label className="entity-form-field">
            <span>Cliente <span aria-hidden="true">*</span></span>
            <select
              disabled={clientsLoading || clients.length === 0}
              name="clientId"
              onChange={handleChange}
              required
              value={formData.clientId}
            >
              <option value="">
                {clientsLoading ? 'Cargando clientes...' : 'Selecciona un cliente'}
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </label>

          <label className="entity-form-field">
            <span>Fecha del pedido <span aria-hidden="true">*</span></span>
            <input
              name="dateOrder"
              onChange={handleChange}
              required
              type="date"
              value={formData.dateOrder}
            />
          </label>

        </div>

        {clientsError && <p className="form-error" role="alert">{clientsError}</p>}
        {!clientsLoading && !clientsError && clients.length === 0 && (
          <p className="form-error" role="alert">
            Registra al menos un cliente antes de crear un pedido.
          </p>
        )}
        {supervisorName && (
          <p className="order-supervisor-note">
            Supervisor que registra el pedido: <strong>{supervisorName}</strong>.
            El servidor debe asociar el pedido al usuario autenticado.
          </p>
        )}
        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="entity-form-actions">
          <button className="btn-secondary" disabled={submitting} onClick={onCancel} type="button">
            Cancelar
          </button>
          <button
            className="btn-primary"
            disabled={submitting || clientsLoading || clients.length === 0 || Boolean(clientsError)}
            type="submit"
          >
            {submitting ? 'Guardando...' : initialValues ? 'Guardar cambios' : 'Guardar orden'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default OrderForm
