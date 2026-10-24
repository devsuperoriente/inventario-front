import { useEffect, useState } from 'react'
import Modal from '../../../components/ui/Modal.jsx'
import { getStockByProduct } from '../services/inventoryStockApi.js'
import {
  formatStockQuantity,
  sumStockQuantities,
} from '../utils/inventoryStock.js'

function InventoryProductStockModal({ product, onClose }) {
  const [stock, setStock] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let isCurrent = true

    getStockByProduct(product.id)
      .then((result) => {
        if (!result || !Array.isArray(result.lotes)) {
          throw new Error('El endpoint de existencias debe responder con una lista de lotes.')
        }
        if (isCurrent) setStock(result)
      })
      .catch((requestError) => {
        console.error(`Error al cargar existencias del producto ${product.id}:`, requestError)
        if (isCurrent) setError(requestError.message)
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [product.id, retry])

  const unit = stock?.unidad || product.unit
  const available = stock
    ? sumStockQuantities(stock.lotes.map((batch) => batch.cantidadDisponible))
    : null

  return (
    <Modal
      className="inventory-product-stock-modal"
      description={`Existencias disponibles y lotes de ${product.name}.`}
      onClose={onClose}
      title={stock?.producto ?? product.name}
    >
      {loading ? (
        <p className="feature-loading" role="status">Cargando existencias del producto...</p>
      ) : error ? (
        <div className="feature-load-error" role="alert">
          <p>No se pudieron cargar las existencias del producto: {error}</p>
          <button
            className="btn-secondary"
            onClick={() => {
              setError('')
              setLoading(true)
              setRetry((value) => value + 1)
            }}
            type="button"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div className="inventory-product-stock-content">
          <div className="inventory-product-stock-total">
            <span>Disponible total</span>
            <strong>
              {formatStockQuantity(available)}{unit ? ` ${unit}` : ''}
            </strong>
            <span>{stock.lotes.length} {stock.lotes.length === 1 ? 'lote' : 'lotes'}</span>
          </div>
          {stock.lotes.length === 0 ? (
            <p className="inventory-product-stock-empty">Este producto no tiene lotes registrados.</p>
          ) : (
            <div className="inventory-product-batch-list">
              {stock.lotes.map((batch) => (
                <article className="inventory-product-batch-card" key={batch.id}>
                  <div className="inventory-product-batch-heading">
                    <strong>{batch.codigo || `Lote #${batch.id}`}</strong>
                    <span>{batch.proveedor || 'Sin proveedor'}</span>
                  </div>
                  <dl>
                    <div>
                      <dt>Disponible</dt>
                      <dd>
                        {formatStockQuantity(batch.cantidadDisponible)}
                        {unit ? ` ${unit}` : ''}
                      </dd>
                    </div>
                    <div>
                      <dt>Cantidad inicial</dt>
                      <dd>
                        {formatStockQuantity(batch.cantidadInicial)}
                        {unit ? ` ${unit}` : ''}
                      </dd>
                    </div>
                    <div>
                      <dt>Ingreso</dt>
                      <dd>{String(batch.fechaIngreso ?? '').slice(0, 10) || '—'}</dd>
                    </div>
                    <div>
                      <dt>Vencimiento</dt>
                      <dd>{String(batch.fechaVencimiento ?? '').slice(0, 10) || '—'}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

export default InventoryProductStockModal
