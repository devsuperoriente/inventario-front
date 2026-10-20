import { useState } from 'react'
import Modal from '../../../components/ui/Modal.jsx'

const emptyFormData = {
  name: '',
}

function MovementTypeForm({ initialValues, onSubmit, onCancel, submitting, error }) {
  const [formData, setFormData] = useState(() => ({
    ...emptyFormData,
    ...initialValues,
    name: initialValues?.name ?? '',
  }))

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await onSubmit({
      name: formData.name.trim(),

    })
  }

  return (
    <Modal
      closeDisabled={submitting}
      onClose={onCancel}
      title={initialValues ? 'Modificar tipo de movimiento' : 'Nuevo tipo de movimiento'}
    >
      <form className="entity-form" onSubmit={handleSubmit}>
        <div className="entity-form-grid movement-type-form-grid">
          <label className="entity-form-field">
            <span>Nombre <span aria-hidden="true">*</span></span>
            <input
              autoComplete="off"
              maxLength={80}
              name="name"
              onChange={handleChange}
              placeholder="Recepcion de materia prima"
              required
              value={formData.name}
            />
          </label>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="entity-form-actions">
          <button className="btn-secondary" disabled={submitting} onClick={onCancel} type="button">
            Cancelar
          </button>
          <button className="btn-primary" disabled={submitting} type="submit">
            {submitting
              ? 'Guardando...'
              : initialValues
                ? 'Guardar cambios'
                : 'Guardar tipo'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default MovementTypeForm
