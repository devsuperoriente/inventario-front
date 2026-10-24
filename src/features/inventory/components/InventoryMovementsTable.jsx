import EmptyState from '../../../components/feedback/EmptyState.jsx'
import {
  getMovementBatch,
  getMovementDate,
  getMovementOrderLabel,
  getMovementProduct,
} from '../utils/inventorySelectors.js'

function InventoryMovementsTable({ movements, batchesById }) {
  if (movements.length === 0) {
    return (
      <EmptyState
        title="No se encontraron movimientos"
        description="Prueba otra búsqueda o consulta nuevamente más adelante."
      />
    )
  }

  return (
    <div className="table-wrap inventory-ledger-table-wrap">
      <table className="inventory-ledger-table inventory-movements-table">
        <caption className="sr-only">Historial de movimientos de inventario</caption>
        <thead>
          <tr>
            <th scope="col">Fecha</th>
            <th scope="col">Producto / lote</th>
            <th scope="col">Tipo</th>
            <th scope="col">Cantidad</th>
            <th scope="col">Saldo anterior</th>
            <th scope="col">Saldo actual</th>
            <th scope="col">Orden de producción</th>
            <th scope="col">Observación</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((movement) => {
            const batch = getMovementBatch(movement, batchesById)
            const product = getMovementProduct(movement, batch)
            const unit = product?.unitsMeasurement?.abbreviation
            return (
              <tr key={movement.id}>
                <td data-label="Fecha">{getMovementDate(movement) || '—'}</td>
                <td data-label="Producto / lote">
                  <strong>{product?.name ?? batch?.productName ?? '—'}</strong>
                  <span className="table-subtext">
                    Lote {batch?.code ?? (batch?.id ? `#${batch.id}` : '—')}
                  </span>
                </td>
                <td data-label="Tipo">{movement.typeMovement?.name ?? movement.typeMovementName ?? '—'}</td>
                <td data-label="Cantidad">
                  {movement.quantity == null ? '—' : `${movement.quantity}${unit ? ` ${unit}` : ''}`}
                </td>
                <td data-label="Saldo anterior">
                  {movement.balancePrevius == null
                    ? '—'
                    : `${movement.balancePrevius}${unit ? ` ${unit}` : ''}`}
                </td>
                <td data-label="Saldo actual">
                  {movement.balanceCurrent == null
                    ? '—'
                    : `${movement.balanceCurrent}${unit ? ` ${unit}` : ''}`}
                </td>
                <td data-label="Orden de producción">{getMovementOrderLabel(movement)}</td>
                <td data-label="Observación">{movement.observation || '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default InventoryMovementsTable
