import { useState } from 'react'
import Modal from '../../../components/ui/Modal.jsx'

const emptyFormData = {
  name: '',
  nit: '',
  address: '',
  phone: '',
  email: '',
  website: '',
}

function ProviderForm({ initialValues, onSubmit, onCancel, submitting, error }) {
  const [formData, setFormData] = useState(() => ({
    ...emptyFormData,
    ...initialValues,
  }))

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const dataToSend = {
      name: formData.name.trim(),
      nit: formData.nit.trim(),
      address: formData.address.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      website: formData.website.trim(),
    };

    await onSubmit(dataToSend);
  }

  return (
    <Modal
      closeDisabled={submitting}
      description="Completa los datos de contacto y facturacion del proveedor."
      onClose={onCancel}
      title={initialValues ? 'Modificar proveedor' : 'Nuevo proveedor'}
    >
      <form className="entity-form" onSubmit={handleSubmit}>
        <div className="entity-form-grid">
          <label className="entity-form-field">
            <span>Nombre <span aria-hidden="true">*</span></span>
            <input
              autoComplete="organization"
              name="name"
              onChange={handleChange}
              required
              value={formData.name}
            />
          </label>

          <label className="entity-form-field">
            <span>NIT</span>
            <input
              name="nit"
              onChange={handleChange}
              value={formData.nit}
            />
          </label>

          <label className="entity-form-field">
            <span>Direccion</span>
            <input
              autoComplete="street-address"
              name="address"
              onChange={handleChange}
              value={formData.address}
            />
          </label>

          <label className="entity-form-field">
            <span>Telefono</span>
            <input
              autoComplete="tel"
              name="phone"
              onChange={handleChange}
              type="tel"
              value={formData.phone}
            />
          </label>

          <label className="entity-form-field">
            <span>Correo electronico</span>
            <input
              autoComplete="email"
              name="email"
              onChange={handleChange}
              type="email"
              value={formData.email}
            />
          </label>

          <label className="entity-form-field">
            <span>Sitio web</span>
            <input
              autoComplete="url"
              name="website"
              onChange={handleChange}
              value={formData.website}
            />
          </label>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="entity-form-actions">
          <button className="btn-secondary" disabled={submitting} onClick={onCancel} type="button">
            Cancelar
          </button>
          <button className="btn-primary" disabled={submitting} type="submit">
            {submitting ? 'Guardando...' : initialValues ? 'Guardar cambios' : 'Guardar proveedor'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ProviderForm
