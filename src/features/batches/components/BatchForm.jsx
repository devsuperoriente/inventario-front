import { useEffect, useState } from 'react'
import Modal from '../../../components/ui/Modal.jsx'

const emptyForm = {
  code: '',
  quantityInitial: '',
  date: '',
  dateMatury: '',
  temperature: '',
  observation: '',
  productId: '',
  providerId: '',
}

function BatchForm({
  initialValues,
  products,
  providers,
  onSubmit,
  onCancel,
  submitting,
  error,
}) {
  const [formData, setFormData] = useState(() => ({
    ...emptyForm,
    code: initialValues?.code ?? '',
    quantityInitial: String(initialValues?.quantityInitial ?? ''),
    date: initialValues?.date?.slice(0, 10) ?? '',
    dateMatury: initialValues?.dateMatury?.slice(0, 10) ?? '',
    temperature: String(initialValues?.temperature ?? ''),
    observation: initialValues?.observation ?? '',
    productId: String(initialValues?.productId ?? initialValues?.product?.id ?? ''),
    providerId: String(initialValues?.providerId ?? initialValues?.provider?.id ?? ''),
  }))
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(initialValues?.image ?? '')

  useEffect(() => {
    if (!imagePreview.startsWith('blob:')) return undefined
    return () => URL.revokeObjectURL(imagePreview)
  }, [imagePreview])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] ?? null
    if (file && !file.type.startsWith('image/')) {
      event.target.value = ''
      setImage(null)
      setImagePreview(initialValues?.image ?? '')
      setFormData((current) => ({ ...current, imageError: 'Selecciona un archivo de imagen válido.' }))
      return
    }
    if (file && file.size > 5 * 1024 * 1024) {
      event.target.value = ''
      setImage(null)
      setImagePreview(initialValues?.image ?? '')
      setFormData((current) => ({ ...current, imageError: 'La imagen no puede superar 5 MB.' }))
      return
    }
    setImage(file)
    setFormData((current) => ({ ...current, imageError: '' }))
    setImagePreview(file ? URL.createObjectURL(file) : initialValues?.image ?? '')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const product = products.find((item) => String(item.id) === formData.productId)
    const provider = providers.find((item) => String(item.id) === formData.providerId)
    if (!product || !provider) return

    await onSubmit({
      batchData: {
        code: formData.code.trim(),
        quantityInitial: Number(formData.quantityInitial),
        date: formData.date,
        dateMatury: formData.dateMatury,
        temperature: Number(formData.temperature),
        observation: formData.observation.trim(),
        productId: product.id,
        providerId: provider.id,
        image: initialValues?.image ?? '',
      },
      imageFile: image,
    })
  }

  return (
    <Modal
      closeDisabled={submitting}
      description="Asocia el lote a un producto y proveedor, y registra sus datos de recepción."
      onClose={onCancel}
      title={initialValues ? 'Modificar lote' : 'Nuevo lote'}
    >
      <form className="entity-form" onSubmit={handleSubmit}>
        <div className="entity-form-grid batch-form-grid">
          <label className="entity-form-field">
            <span>Código <span aria-hidden="true">*</span></span>
            <input
              autoComplete="off"
              maxLength={60}
              name="code"
              onChange={handleChange}
              required
              value={formData.code}
            />
          </label>

          <label className="entity-form-field">
            <span>Producto <span aria-hidden="true">*</span></span>
            <select name="productId" onChange={handleChange} required value={formData.productId}>
              <option value="">Selecciona un producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}{product.code ? ` · ${product.code}` : ''}
                </option>
              ))}
            </select>
          </label>

          <label className="entity-form-field">
            <span>Proveedor <span aria-hidden="true">*</span></span>
            <select name="providerId" onChange={handleChange} required value={formData.providerId}>
              <option value="">Selecciona un proveedor</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>{provider.name}</option>
              ))}
            </select>
          </label>

          <label className="entity-form-field">
            <span>Cantidad <span aria-hidden="true">*</span></span>
            <input
              min="0.01"
              name="quantityInitial"
              onChange={handleChange}
              required
              step="any"
              type="number"
              value={formData.quantityInitial}
            />
          </label>

          <label className="entity-form-field">
            <span>Fecha de ingreso <span aria-hidden="true">*</span></span>
            <input name="date" onChange={handleChange} required type="date" value={formData.date} />
          </label>

          <label className="entity-form-field">
            <span>Fecha de madurez / vencimiento <span aria-hidden="true">*</span></span>
            <input
              name="dateMatury"
              onChange={handleChange}
              required
              type="date"
              value={formData.dateMatury}
            />
          </label>

          <label className="entity-form-field">
            <span>Temperatura (°C) <span aria-hidden="true">*</span></span>
            <input
              name="temperature"
              onChange={handleChange}
              required
              step="any"
              type="number"
              value={formData.temperature}
            />
          </label>

          <label className="entity-form-field">
            <span>Imagen (máximo 5 MB)</span>
            <input
              accept="image/*"
              name="image"
              onChange={handleImageChange}
              type="file"
            />
          </label>

          <label className="entity-form-field batch-observation-field">
            <span>Observación</span>
            <textarea
              maxLength={1000}
              name="observation"
              onChange={handleChange}
              rows="3"
              value={formData.observation}
            />
          </label>
        </div>

        {imagePreview && (
          <div className="batch-image-preview">
            <img alt="Vista previa del lote" src={imagePreview} />
            <span>{image?.name ?? 'Imagen actual'}</span>
          </div>
        )}
        {formData.imageError && <p className="form-error" role="alert">{formData.imageError}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="entity-form-actions">
          <button className="btn-secondary" disabled={submitting} onClick={onCancel} type="button">
            Cancelar
          </button>
          <button
            className="btn-primary"
            disabled={submitting || Boolean(formData.imageError)}
            type="submit"
          >
            {submitting ? 'Guardando...' : initialValues ? 'Guardar cambios' : 'Guardar lote'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default BatchForm
