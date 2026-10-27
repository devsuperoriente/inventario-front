import EmptyState from "../../../components/feedback/EmptyState.jsx";

function ClientTable({ items, onEdit, onDelete, deletingId }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No se encontraron clientes"
        description="Prueba con otro nombre, documento, correo o telefono."
      />
    );
  }

  return (
    <div className="table-wrap client-table-wrap">
      <table className="client-table">
        <caption className="sr-only">Lista de clientes registrados</caption>
        <thead>
          <tr>
            <th scope="col">Nombre</th>
            <th className="client-column-document" scope="col">
              Documento
            </th>
            <th className="client-column-address" scope="col">
              Direccion
            </th>
            <th className="client-column-phone" scope="col">
              Telefono
            </th>
            <th className="client-column-email" scope="col">
              Correo
            </th>
            <th className="client-column-actions" scope="col">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((client) => (
            <tr key={client.id}>
              <td>
                <strong>{client.name}</strong>
              </td>
              <td className="client-column-document">{client.nit || "—"}</td>
              <td className="client-column-address">{client.address || "—"}</td>
              <td className="client-column-phone">{client.phone || "—"}</td>
              <td className="client-column-email">{client.email || "—"}</td>
              <td className="client-column-actions">
                <div className="table-actions">
                  <button
                    aria-label={`Modificar cliente ${client.name}`}
                    className="table-action"
                    onClick={() => onEdit(client)}
                    title="Modificar cliente"
                    type="button"
                  >
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                      <path d="m13.5 3.5 3 3M4 16l3.4-.7L16 6.7a2.12 2.12 0 0 0-3-3l-8.6 8.6L4 16Z" />
                    </svg>
                    <span className="action-label">Modificar</span>
                  </button>
                  <button
                    aria-label={`${deletingId === client.id ? "Eliminando" : "Eliminar"} cliente ${client.name}`}
                    className="table-action danger"
                    disabled={deletingId === client.id}
                    onClick={() => onDelete(client)}
                    title="Eliminar cliente"
                    type="button"
                  >
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                      <path d="M3.5 5.5h13M8 5.5V3.8h4v1.7m-6.5 0 .7 10.7h7.6l.7-10.7M8.2 8.5v5m3.6-5v5" />
                    </svg>
                    <span className="action-label">
                      {deletingId === client.id ? "Eliminando..." : "Eliminar"}
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

export default ClientTable;
