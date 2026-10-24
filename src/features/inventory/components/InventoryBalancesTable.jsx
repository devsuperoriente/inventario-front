import { useState } from 'react'
import EmptyState from '../../../components/feedback/EmptyState.jsx'
import InventoryProductStockModal from './InventoryProductStockModal.jsx'
import { formatStockQuantity } from '../utils/inventoryStock.js'

function InventoryBalancesTable({ products }) {
  const [selectedProduct, setSelectedProduct] = useState(null)

  if (products.length === 0) {
    return (
      <EmptyState
        title="No se encontraron existencias"
        description="Prueba otra búsqueda o registra lotes para consultar el inventario."
      />
    )
  }

  return (
    <>
      <div className="table-wrap inventory-ledger-table-wrap">
        <table className="inventory-ledger-table inventory-product-stock-table">
          <caption className="sr-only">Existencias actuales agrupadas por producto</caption>
          <thead>
            <tr>
              <th scope="col">Producto</th>
              <th scope="col">Lotes</th>
              <th scope="col">Disponible total</th>
              <th scope="col">Próximo vencimiento</th>
              <th scope="col">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const nextExpiration = product.batches
                .map((batch) => String(batch.expirationDate ?? '').slice(0, 10))
                .filter(Boolean)
                .sort()[0]
              return (
                <tr key={product.key}>
                  <td data-label="Producto">
                    <strong>{product.name}</strong>
                    {product.unit && <span className="table-subtext">{product.unit}</span>}
                  </td>
                  <td data-label="Lotes">{product.batches.length}</td>
                  <td data-label="Disponible total">
                    <strong>
                      {formatStockQuantity(product.available)}
                      {product.unit ? ` ${product.unit}` : ''}
                    </strong>
                  </td>
                  <td data-label="Próximo vencimiento">{nextExpiration || '—'}</td>
                  <td data-label="Detalle">
                    <button
                      aria-label={`Ver lotes de ${product.name}`}
                      className="inventory-product-details-button"
                      disabled={product.id == null}
                      onClick={() => setSelectedProduct(product)}
                      type="button"
                    >
                      Ver lotes
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {selectedProduct && (
        <InventoryProductStockModal
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
        />
      )}
    </>
  )
}

export default InventoryBalancesTable
