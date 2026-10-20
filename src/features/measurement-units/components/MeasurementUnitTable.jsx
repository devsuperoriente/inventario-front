import EmptyState from '../../../components/feedback/EmptyState.jsx'

function MeasurementUnitTable({ items, onEdit, onDelete, deletingId }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No se encontraron unidades"
        description="Prueba con otro nombre, simbolo o descripcion."
      />
    )
  }

  return (
    <div className="table-wrap measurement-unit-table-wrap">
      <table className="measurement-unit-table">
        <caption className="sr-only">Unidades de medida registradas</caption>
        <thead>
          <tr>
            <th scope="col">Unidad</th>
            <th className="measurement-unit-abbreviation" scope="col">Simbolo</th>
            <th className="measurement-unit-description" scope="col">Descripcion</th>
            <th className="measurement-unit-actions" scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((unit) => (
            <tr key={unit.id}>
              <td><strong>{unit.name}</strong></td>
              <td className="measurement-unit-abbreviation">{unit.abbreviation}</td>
              <td className="measurement-unit-description">{unit.description || '—'}</td>
              <td className="measurement-unit-actions">
                <div className="table-actions">
                  <button
                    aria-label={`Modificar unidad ${unit.name}`}
                    className="table-action"
                    onClick={() => onEdit(unit)}
                    title="Modificar unidad"
                    type="button"
                  >
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                      <path d="m13.5 3.5 3 3M4 16l3.4-.7L16 6.7a2.12 2.12 0 0 0-3-3l-8.6 8.6L4 16Z" />
                    </svg>
                    <span className="action-label">Modificar</span>
                  </button>
                  <button
                    aria-label={`${deletingId === unit.id ? 'Eliminando' : 'Eliminar'} unidad ${unit.name}`}
                    className="table-action danger"
                    disabled={deletingId === unit.id}
                    onClick={() => onDelete(unit)}
                    title="Eliminar unidad"
                    type="button"
                  >
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                      <path d="M3.5 5.5h13M8 5.5V3.8h4v1.7m-6.5 0 .7 10.7h7.6l.7-10.7M8.2 8.5v5m3.6-5v5" />
                    </svg>
                    <span className="action-label">
                      {deletingId === unit.id ? 'Eliminando...' : 'Eliminar'}
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

export default MeasurementUnitTable
