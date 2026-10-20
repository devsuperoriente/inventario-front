import { useState } from 'react'
import Modal from '../../../components/ui/Modal.jsx'

const emptyFormData = {
  numberOrder: '',
  dateOrder: '',
}

function OrderForm({
  initialValues,
  onSubmit,
  onCancel,
  submitting,
  error,
}) {
  const [formData, setFormData] = useState(() => ({
    ...emptyFormData,
    ...initialValues,
    numberOrder: String(initialValues?.numberOrder ?? initialValues?.orderNumber ?? ''),
    dateOrder: initialValues?.dateOrder?.slice(0, 10) ?? '',
  }))

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await onSubmit({
      numberOrder: formData.numberOrder.trim(),
      dateOrder: formData.dateOrder,
    })
  }

  return (
    <Modal
      closeDisabled={submitting}
      description="Define el número y la fecha del pedido. Luego agrega los productos y cantidades."
      onClose={onCancel}
      title={initialValues ? 'Modificar orden' : 'Nueva orden'}
    >
      <form className="entity-form" onSubmit={handleSubmit}>
        <div className="entity-form-grid order-form-grid">
          <label className="entity-form-field">
            <span>Número de pedido <span aria-hidden="true">*</span></span>
            <input
              autoComplete="off"
              maxLength={40}
              name="numberOrder"
              onChange={handleChange}
              placeholder="PED-0001"
              required
              value={formData.numberOrder}
            />
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

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="entity-form-actions">
          <button className="btn-secondary" disabled={submitting} onClick={onCancel} type="button">
            Cancelar
          </button>
          <button className="btn-primary" disabled={submitting} type="submit">
            {submitting ? 'Guardando...' : initialValues ? 'Guardar cambios' : 'Guardar orden'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default OrderForm
