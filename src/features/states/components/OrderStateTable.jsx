import EmptyState from "../../../components/feedback/EmptyState.jsx";

function OrderStateTable({ items, onEdit, onDelete, deletingId }) {
  if (items.length === 0) {
    return <EmptyState title="No se encontraron estados" />;
  }

  return (
    <div className="table-wrap order-state-table-wrap">
      <table className="order-state-table">
        <caption className="sr-only">Estados de orden de produccion</caption>
        <thead>
          <tr>
            <th scope="col">Estado</th>
            <th className="order-state-actions" scope="col">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((state) => (
            <tr key={state.id}>
              <td>
                <strong>{state.name}</strong>
              </td>
              <td className="order-state-actions">
                <div className="table-actions">
                  <button
                    aria-label={`Modificar estado ${state.name}`}
                    className="table-action"
                    onClick={() => onEdit(state)}
                    title="Modificar estado"
                    type="button"
                  >
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                      <path d="m13.5 3.5 3 3M4 16l3.4-.7L16 6.7a2.12 2.12 0 0 0-3-3l-8.6 8.6L4 16Z" />
                    </svg>
                    <span className="action-label">Modificar</span>
                  </button>
                  <button
                    aria-label={`${deletingId === state.id ? "Eliminando" : "Eliminar"} estado ${state.name}`}
                    className="table-action danger"
                    disabled={deletingId === state.id}
                    onClick={() => onDelete(state)}
                    title="Eliminar estado"
                    type="button"
                  >
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                      <path d="M3.5 5.5h13M8 5.5V3.8h4v1.7m-6.5 0 .7 10.7h7.6l.7-10.7M8.2 8.5v5m3.6-5v5" />
                    </svg>
                    <span className="action-label">
                      {deletingId === state.id ? "Eliminando..." : "Eliminar"}
                    </span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrderStateTable;
