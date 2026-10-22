import EmptyState from '../../../components/feedback/EmptyState.jsx'

function OrderTable({ items, onEdit, onDelete, onViewDetails, deletingId }) {
  const sortedItems = [...items].sort((a, b) => b.id - a.id)

  if (sortedItems.length === 0) {
    return (
      <EmptyState
        title="No se encontraron pedidos"
        description="Prueba con otro número de pedido."
      />
    )
  }

  return (
    <div className="table-wrap orders-table-wrap">
      <table className="orders-table">
        <caption className="sr-only">Pedidos registrados con sus fechas</caption>
        <thead>
          <tr>
            <th scope="col">Número de pedido</th>
            <th scope="col">Cliente</th>
            <th className="order-column-date" scope="col">Fecha</th>
            <th className="order-column-actions" scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((order) => {
            const orderLabel = order.numberOrder ?? order.orderNumber ?? `#${order.id}`

            return (
              <tr key={order.id}>
                <td><strong>{orderLabel}</strong></td>
                <td className="order-column-client">
                  {order.client?.name ?? order.clientName ?? '—'}
                </td>
                <td className="order-column-date">{order.dateOrder?.slice(0, 10) || '—'}</td>
                <td className="order-column-actions">
                  <div className="table-actions">
                    <button
                      aria-label={`Ver productos del pedido ${orderLabel}`}
                      className="table-action"
                      onClick={() => onViewDetails(order)}
                      title="Ver detalles del pedido"
                      type="button"
                    >
                      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                        <path d="M5 3.5h10a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1ZM7 7h6M7 10h6m-6 3h4" />
                      </svg>
                      <span className="action-label">Detalles</span>
                    </button>
                    <button
                      aria-label={`Modificar pedido ${orderLabel}`}
                      className="table-action"
                      onClick={() => onEdit(order)}
                      title="Modificar pedido"
                      type="button"
                    >
                      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                        <path d="m13.5 3.5 3 3M4 16l3.4-.7L16 6.7a2.12 2.12 0 0 0-3-3l-8.6 8.6L4 16Z" />
                      </svg>
                      <span className="action-label">Modificar</span>
                    </button>
                    <button
                      aria-label={`${deletingId === order.id ? 'Eliminando' : 'Eliminar'} pedido ${orderLabel}`}
                      className="table-action danger"
                      disabled={deletingId === order.id}
                      onClick={() => onDelete(order)}
                      title="Eliminar pedido"
                      type="button"
                    >
                      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                        <path d="M3.5 5.5h13M8 5.5V3.8h4v1.7m-6.5 0 .7 10.7h7.6l.7-10.7M8.2 8.5v5m3.6-5v5" />
                      </svg>
                      <span className="action-label">
                        {deletingId === order.id ? 'Eliminando...' : 'Eliminar'}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default OrderTable