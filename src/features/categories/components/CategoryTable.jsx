import EmptyState from '../../../components/feedback/EmptyState.jsx'

function CategoryTable({ items, onEdit, onDelete, deletingId }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No se encontraron categorias"
      />
    )
  }

  return (
    <div className="table-wrap category-table-wrap">
      <table className="category-table">
        <caption className="sr-only">Categorias registradas</caption>
        <thead>
          <tr>
            <th scope="col">Categoria</th>
            <th className="category-actions" scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((category) => (
            <tr key={category.id}>
              <td><strong>{category.name}</strong></td>
              <td className="category-actions">
                <div className="table-actions">
                  <button
                    aria-label={`Modificar categoria ${category.name}`}
                    className="table-action"
                    onClick={() => onEdit(category)}
                    title="Modificar categoria"
                    type="button"
                  >
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                      <path d="m13.5 3.5 3 3M4 16l3.4-.7L16 6.7a2.12 2.12 0 0 0-3-3l-8.6 8.6L4 16Z" />
                    </svg>
                    <span className="action-label">Modificar</span>
                  </button>
                  <button
                    aria-label={`${deletingId === category.id ? 'Eliminando' : 'Eliminar'} categoria ${category.name}`}
                    className="table-action danger"
                    disabled={deletingId === category.id}
                    onClick={() => onDelete(category)}
                    title="Eliminar categoria"
                    type="button"
                  >
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                      <path d="M3.5 5.5h13M8 5.5V3.8h4v1.7m-6.5 0 .7 10.7h7.6l.7-10.7M8.2 8.5v5m3.6-5v5" />
                    </svg>
                    <span className="action-label">
                      {deletingId === category.id ? 'Eliminando...' : 'Eliminar'}
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

export default CategoryTable
