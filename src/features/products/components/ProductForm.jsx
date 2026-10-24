import { useState } from 'react'
import Modal from '../../../components/ui/Modal.jsx'

const emptyFormData = {
  name: '',
  code: '',
  categoryId: '',
  unitsMeasurementId: '',
}

function ProductForm({
  categories,
  measurementUnits,
  preferredCategoryId = '',
  initialValues,
  onSubmit,
  onCancel,
  submitting,
  error,
}) {
  const [formData, setFormData] = useState(() => ({
    ...emptyFormData,
    ...initialValues,
    name: initialValues?.name ?? '',
    code: initialValues?.code ?? '',
    categoryId: String(
      initialValues?.categoryId
      ?? initialValues?.category?.id
      ?? preferredCategoryId,
    ),
    unitsMeasurementId: String(initialValues?.unitsMeasurementId ?? 
      initialValues?.unitsMeasurement?.id ?? ''
    ),
  }))

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const category = categories.find((item) => String(item.id) === formData.categoryId)
    const measurementUnit = measurementUnits.find(
      (item) => String(item.id) === formData.unitsMeasurementId,
    )

    if (!category || !measurementUnit) return

    await onSubmit({
      name: formData.name.trim(),
      code: formData.code.trim(),
      categoryId: category.id,
      unitsMeasurementId: measurementUnit.id,
    })
  }

  return (
    <Modal
      closeDisabled={submitting}
      description="Asocia el producto a una categoria y una unidad de medida."
      onClose={onCancel}
      title={initialValues ? 'Modificar producto' : 'Nuevo producto'}
    >
      <form className="entity-form" onSubmit={handleSubmit}>
        <div className="entity-form-grid product-form-grid">
          <label className="entity-form-field">
            <span>Nombre <span aria-hidden="true">*</span></span>
            <input
              autoComplete="off"
              maxLength={120}
              name="name"
              onChange={handleChange}
              placeholder="Harina de trigo"
              required
              value={formData.name}
            />
          </label>

          <label className="entity-form-field">
            <span>Codigo / SKU</span>
            <input
              autoComplete="off"
              maxLength={40}
              name="code"
              onChange={handleChange}
              placeholder="HAR-001"
              value={formData.code}
            />
          </label>

          <label className="entity-form-field">
            <span>Categoria <span aria-hidden="true">*</span></span>
            <select
              name="categoryId"
              onChange={handleChange}
              required
              value={formData.categoryId}
            >
              <option value="">Selecciona una categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>

          <label className="entity-form-field">
            <span>Unidad de medida <span aria-hidden="true">*</span></span>
            <select
              name="unitsMeasurementId"
              onChange={handleChange}
              required
              value={formData.unitsMeasurementId}
            >
              <option value="">Selecciona una unidad</option>
              {measurementUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}{unit.abbreviation ? ` (${unit.abbreviation})` : ''}
                </option>
              ))}
            </select>
          </label>

        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="entity-form-actions">
          <button className="btn-secondary" disabled={submitting} onClick={onCancel} type="button">
            Cancelar
          </button>
          <button className="btn-primary" disabled={submitting} type="submit">
            {submitting ? 'Guardando...' : initialValues ? 'Guardar cambios' : 'Guardar producto'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ProductForm
