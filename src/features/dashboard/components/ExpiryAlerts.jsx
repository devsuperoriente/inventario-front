import StatusBadge from '../../../components/ui/StatusBadge.jsx'

function ExpiryAlerts({ items }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Alertas de vencimiento</h2>
          <p>Insumos que requieren seguimiento</p>
        </div>
        <span className="panel-count">{items.length} alertas</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Insumo</th>
              <th>Lote</th>
              <th>Vencimiento</th>
              <th>Existencia</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.name}</strong></td>
                <td>{item.lot}</td>
                <td>{item.expirationDate}</td>
                <td>{item.quantity} {item.unit}</td>
                <td><StatusBadge status={item.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default ExpiryAlerts
