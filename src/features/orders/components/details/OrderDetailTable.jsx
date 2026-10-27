import EmptyState from "../../../../components/feedback/EmptyState.jsx";

function OrderDetailTable({
  items,
  productsById,
  onEdit,
  onDelete,
  deletingId,
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Este pedido aún no tiene productos"
        description="Agrega los productos solicitados para completar el pedido."
      />
    );
  }

  return (
    <div className="table-wrap order-detail-table-wrap">
      <table className="order-detail-table">
        <caption className="sr-only">
          Productos y cantidades solicitadas en el pedido
        </caption>
        <thead>
          <tr>
            <th scope="col">Producto</th>
            <th className="order-detail-column-code" scope="col">
              Código
            </th>
            <th scope="col">Cantidad</th>
            <th className="order-detail-column-unit" scope="col">
              Unidad
            </th>
            <th className="order-detail-column-actions" scope="col">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((detail) => {
            const product =
              detail.product ??
              productsById.get(String(detail.productId ?? detail.product?.id));
            const unit = product?.unitsMeasurement;

            return (
              <tr key={detail.id}>
                <td>
                  <strong>{product?.name ?? "Producto no disponible"}</strong>
                </td>
                <td className="order-detail-column-code">
                  {product?.code || "—"}
                </td>
                <td>{detail.amount ?? "—"}</td>
                <td className="order-detail-column-unit">
                  {unit?.abbreviation ?? unit?.name ?? "—"}
                </td>
                <td className="order-detail-column-actions">
                  <div className="table-actions">
                    <button
                      aria-label={`Modificar detalle de ${product?.name ?? "producto"}`}
                      className="table-action"
                      onClick={() => onEdit(detail)}
                      title="Modificar detalle"
                      type="button"
                    >
                      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                        <path d="m13.5 3.5 3 3M4 16l3.4-.7L16 6.7a2.12 2.12 0 0 0-3-3l-8.6 8.6L4 16Z" />
                      </svg>
                      <span className="action-label">Modificar</span>
                    </button>
                    <button
                      aria-label={`${deletingId === detail.id ? "Eliminando" : "Eliminar"} detalle de ${product?.name ?? "producto"}`}
                      className="table-action danger"
                      disabled={deletingId === detail.id}
                      onClick={() => onDelete(detail)}
                      title="Eliminar detalle"
                      type="button"
                    >
                      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                        <path d="M3.5 5.5h13M8 5.5V3.8h4v1.7m-6.5 0 .7 10.7h7.6l.7-10.7M8.2 8.5v5m3.6-5v5" />
                      </svg>
                      <span className="action-label">
                        {deletingId === detail.id
                          ? "Eliminando..."
                          : "Eliminar"}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default OrderDetailTable;
