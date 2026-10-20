import EmptyState from '../../../components/feedback/EmptyState.jsx'
import StatusBadge from '../../../components/ui/StatusBadge.jsx'

function InventoryTable({ items }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No se encontraron insumos"
        description="Prueba con otro termino o cambia el filtro de estado."
      />
    )
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Materia prima</th>
            <th>Lote / vencimiento</th>
            <th>Existencia</th>
            <th>Ubicacion</th>
            <th>Condicion</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>{item.name}</strong>
                <span className="table-subtext">{item.category} · {item.supplier}</span>
              </td>
              <td>
                <strong>{item.lot}</strong>
                <span className="table-subtext">Vence {item.expirationDate}</span>
              </td>
              <td><strong>{item.quantity} {item.unit}</strong></td>
              <td>{item.location}</td>
              <td>{item.temperature}</td>
              <td><StatusBadge status={item.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default InventoryTable
