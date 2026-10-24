import { useState } from 'react'
import Modal from '../../../components/ui/Modal.jsx'

function RecipeForm({ products, initialValues, onSubmit, onCancel, submitting, error }) {
  const finalProducts = products.filter((product) => (
    product.category?.name?.trim().toLocaleLowerCase() === 'producto final'
    || String(product.categoryId ?? product.category?.id) === '2'
    || String(product.id) === String(initialValues?.productId ?? initialValues?.product?.id)
  ))
  const [formData, setFormData] = useState({
    productId: String(initialValues?.productId ?? initialValues?.product?.id ?? ''),
    name: initialValues?.name ?? '',
    description: initialValues?.description ?? '',
    version: initialValues?.version ?? '',
    baseYield: initialValues?.baseYield ?? '',
  })

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const product = finalProducts.find((item) => String(item.id) === formData.productId)
    if (!product) return
    await onSubmit({
      productId: product.id,
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      version: formData.version.trim(),
      baseYield: formData.baseYield.trim(),

    })
  }

  return (
    <Modal
      closeDisabled={submitting}
      description="Asocia la receta al producto final que produce."
      onClose={onCancel}
      title={initialValues ? 'Modificar receta' : 'Nueva receta'}
    >
      <form className="entity-form" onSubmit={handleSubmit}>
        <div className="entity-form-grid">
          <label className="entity-form-field">
            <span>Producto final <span aria-hidden="true">*</span></span>
            <select
              onChange={handleChange}
              required
              name="productId"
              value={formData.productId}
            >
              <option value="">Selecciona un producto final</option>
              {finalProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}{product.code ? ` · ${product.code}` : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="entity-form-field">
            <span>Nombre <span aria-hidden="true">*</span></span>
            <input
              autoComplete="off"
              maxLength={30}
              name="name"
              onChange={handleChange}
              required
              value={formData.name}
            />
          </label>
          <label className="entity-form-field">
            <span>Versión <span aria-hidden="true">*</span></span>
            <input
              autoComplete="off"
              maxLength={30}
              name="version"
              onChange={handleChange}
              required
              value={formData.version}
            />
          </label>
          <label className="entity-form-field">
            <span>Rendimiento base <span aria-hidden="true">*</span></span>
            <input
              autoComplete="off"
              maxLength={30}
              name="baseYield"
              onChange={handleChange}
              required
              value={formData.baseYield}
            />
          </label>
          <label className="entity-form-field">
            <span>Descripción</span>
            <textarea
              maxLength={255}
              name="description"
              onChange={handleChange}
              rows="3"
              value={formData.description}
            />
          </label>
        </div>

        {finalProducts.length === 0 && (
          <p className="form-error" role="alert">
            No hay productos finales disponibles para asociar a la receta.
          </p>
        )}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="entity-form-actions">
          <button className="btn-secondary" disabled={submitting} onClick={onCancel} type="button">
            Cancelar
          </button>
          <button
            className="btn-primary"
            disabled={submitting || finalProducts.length === 0}
            type="submit"
          >
            {submitting ? 'Guardando...' : initialValues ? 'Guardar cambios' : 'Guardar receta'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default RecipeForm
