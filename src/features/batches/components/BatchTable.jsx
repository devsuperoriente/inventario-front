import EmptyState from '../../../components/feedback/EmptyState.jsx'

function BatchTable({ items, onViewDetails, onEdit, onDelete, deletingId }) {
  if (items.length === 0) {
    return <EmptyState title="No se encontraron lotes" description="Prueba con otro código, producto o proveedor." />
  }

  return (
    <div className="table-wrap batch-table-wrap">
      <table className="batch-table">
        <caption className="sr-only">Lotes registrados con productos y proveedores</caption>
        <thead>
          <tr>
            <th scope="col">Código</th>
            <th scope="col">Producto</th>
            <th scope="col">Proveedor</th>
            <th scope="col">Cantidad inicial</th>
            <th scope="col">Disponible</th>
            <th className="batch-column-dates" scope="col">Ingreso</th>
            <th className="batch-column-dates" scope="col">Vencimiento</th>
            <th className="batch-column-actions" scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((batch) => (
            <tr key={batch.id}>
              <td><strong>{batch.code}</strong></td>
              <td>{batch.product?.name ?? batch.productName ?? '—'}</td>
              <td>{batch.provider?.name ?? batch.providerName ?? '—'}</td>
              <td>{batch.quantityInitial ?? '—'}</td>
              <td>{batch.quantityAvailable ?? '—'}</td>
              <td className="batch-column-dates">{batch.entryDate?.slice(0, 10) ?? '—'}</td>
              <td className="batch-column-dates">{batch.expirationDate?.slice(0, 10) ?? '—'}</td>
              <td className="batch-column-actions">
                <div className="table-actions">
                  <button
                    aria-label={`Ver detalle del lote ${batch.code}`}
                    className="table-action"
                    onClick={() => onViewDetails(batch)}
                    type="button"
                  >
                    <span className="action-label">Detalle</span>
                  </button>
                  <button
                    aria-label={`Modificar lote ${batch.code}`}
                    className="table-action"
                    onClick={() => onEdit(batch)}
                    type="button"
                  >
                    <span className="action-label">Modificar</span>
                  </button>
                  <button
                    aria-label={`${deletingId === batch.id ? 'Eliminando' : 'Eliminar'} lote ${batch.code}`}
                    className="table-action danger"
                    disabled={deletingId === batch.id}
                    onClick={() => onDelete(batch)}
                    type="button"
                  >
                    <span className="action-label">
                      {deletingId === batch.id ? 'Eliminando...' : 'Eliminar'}
                    </span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default BatchTable
