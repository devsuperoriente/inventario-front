import EmptyState from '../../../components/feedback/EmptyState.jsx'

function ProviderTable({ items, onEdit, onDelete, deletingId }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No se encontraron proveedores"
        description="Prueba con otro nombre, NIT, correo o telefono."
      />
    )
  }

  return (
    <div className="table-wrap provider-table-wrap">
      <table className="provider-table">
        <caption className="sr-only">Lista de proveedores registrados</caption>
        <thead>
          <tr>
            <th scope="col">Nombre</th>
            <th className="provider-column-nit" scope="col">NIT</th>
            <th className="provider-column-address" scope="col">Dirección</th>
            <th className="provider-column-phone" scope="col">Teléfono</th>
            <th className="provider-column-email" scope="col">Correo</th>
            <th className="provider-column-website" scope="col">Web</th>
            <th className="provider-column-actions" scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>{item.name}</strong>
              </td>
              <td className="provider-column-nit">{item.nit || '—'}</td>
              <td className="provider-column-address">{item.address || '—'}</td>
              <td className="provider-column-phone">{item.phone || '—'}</td>
              <td className="provider-column-email">{item.email || '—'}</td>
              <td className="provider-column-website">{item.website || '—'}</td>
              <td className="provider-actions-cell provider-column-actions">
                <div className="table-actions">
                  <button
                    aria-label={`Modificar proveedor ${item.name}`}
                    className="table-action"
                    onClick={() => onEdit(item)}
                    title="Modificar proveedor"
                    type="button"
                  >
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                      <path d="m13.5 3.5 3 3M4 16l3.4-.7L16 6.7a2.12 2.12 0 0 0-3-3l-8.6 8.6L4 16Z" />
                    </svg>
                    <span className="action-label">Modificar</span>
                  </button>
                  <button
                    aria-label={`${deletingId === item.id ? 'Eliminando' : 'Eliminar'} proveedor ${item.name}`}
                    className="table-action danger"
                    disabled={deletingId === item.id}
                    onClick={() => onDelete(item)}
                    title={deletingId === item.id ? 'Eliminando proveedor' : 'Eliminar proveedor'}
                    type="button"
                  >
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                      <path d="M3.5 5.5h13M8 5.5V3.8h4v1.7m-6.5 0 .7 10.7h7.6l.7-10.7M8.2 8.5v5m3.6-5v5" />
                    </svg>
                    <span className="action-label">
                      {deletingId === item.id ? 'Eliminando...' : 'Eliminar'}
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

export default ProviderTable
