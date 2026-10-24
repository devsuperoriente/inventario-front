import { useState } from 'react'

function RecipeDetailForm({ products, initialValues, onSubmit, onCancel, submitting, error }) {
  const finalProducts = products.filter(
    (product) => product.categoryId === 1 || product.category?.id === 1
  )
  
  const [productId, setProductId] = useState(
    String(initialValues?.productId ?? initialValues?.product?.id ?? ''),
  )
  const [amount, setAmount] = useState(
    initialValues?.amount == null ? '' : String(initialValues.amount),
  )
  const [observation, setObservation] = useState(initialValues?.observation ?? '')

  async function handleSubmit(event) {
    event.preventDefault()
    const product = finalProducts.find((item) => String(item.id) === productId)
    if (!product) return

    await onSubmit({
      productId: product.id,
      amount: amount === '' ? null : Number(amount),
      observation: observation.trim() || null,
    })
  }

  return (
    <form className="entity-form" onSubmit={handleSubmit}>
      <div className="entity-form-grid">
        <label className="entity-form-field">
          <span>Producto <span aria-hidden="true">*</span></span>
          <select
            autoFocus
            onChange={(event) => setProductId(event.target.value)}
            required
            value={productId}
          >
            <option value="">Selecciona un producto</option>
            {/* Mapeamos 'finalProducts' en lugar de 'products' */}
            {finalProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}{product.code ? ` · ${product.code}` : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="entity-form-field">
          <span>Cantidad</span>
          <input
            min="0.01"
            onChange={(event) => setAmount(event.target.value)}
            step="0.01"
            type="number"
            value={amount}
          />
        </label>
        <label className="entity-form-field">
          <span>Observación</span>
          <textarea
            maxLength={30}
            onChange={(event) => setObservation(event.target.value)}
            rows="2"
            value={observation}
          />
        </label>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="entity-form-actions">
        <button className="btn-secondary" disabled={submitting} onClick={onCancel} type="button">
          Cancelar
        </button>
        <button className="btn-primary" disabled={submitting} type="submit">
          {submitting ? 'Guardando...' : initialValues ? 'Guardar cambios' : 'Agregar producto'}
        </button>
      </div>
    </form>
  )
}

export default RecipeDetailForm
