import EmptyState from '../../../components/feedback/EmptyState.jsx'

function BatchTable({ items, onEdit, onDelete, deletingId }) {
  if (items.length === 0) {
    return <EmptyState title="No se encontraron lotes" description="Prueba con otro código, producto o proveedor." />
  }

  return (
    <div className="table-wrap batch-table-wrap">
      <table className="batch-table">
        <caption className="sr-only">Lotes registrados con productos y proveedores</caption>
        <thead>
          <tr>
            <th scope="col">Imagen</th>
            <th scope="col">Código</th>
            <th scope="col">Producto</th>
            <th scope="col">Proveedor</th>
            <th scope="col">Cantidad</th>
            <th className="batch-column-dates" scope="col">Ingreso</th>
            <th className="batch-column-dates" scope="col">Madurez</th>
            <th scope="col">Temperatura</th>
            <th className="batch-column-observation" scope="col">Observación</th>
            <th className="batch-column-actions" scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((batch) => (
            <tr key={batch.id}>
              <td>
                {batch.image
                  ? <img className="batch-thumbnail" src={batch.image} alt={`Lote ${batch.code}`} />
                  : '—'}
              </td>
              <td><strong>{batch.code}</strong></td>
              <td>{batch.product?.name ?? batch.productName ?? '—'}</td>
              <td>{batch.provider?.name ?? batch.providerName ?? '—'}</td>
              <td>{batch.quantityInitial ?? '—'}</td>
              <td className="batch-column-dates">{batch.date?.slice(0, 10) ?? '—'}</td>
              <td className="batch-column-dates">{batch.dateMatury?.slice(0, 10) ?? '—'}</td>
              <td>{batch.temperature == null ? '—' : `${batch.temperature} °C`}</td>
              <td className="batch-column-observation">{batch.observation || '—'}</td>
              <td className="batch-column-actions">
                <div className="table-actions">
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
