import EmptyState from "../../../../components/feedback/EmptyState.jsx";

function RecipeDetailTable({
  items,
  productsById,
  onEdit,
  onDelete,
  deletingId,
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="La receta aún no tiene productos"
        description="Agrega los productos e ingredientes que componen esta receta."
      />
    );
  }

  return (
    <div className="table-wrap recipe-detail-table-wrap">
      <table className="recipe-detail-table">
        <caption className="sr-only">
          Productos e ingredientes de la receta
        </caption>
        <thead>
          <tr>
            <th scope="col">Producto</th>
            <th scope="col">Cantidad</th>
            <th scope="col">Unidad</th>
            <th className="recipe-detail-column-actions" scope="col">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((detail) => {
            const product =
              detail.product ??
              productsById.get(String(detail.productId ?? detail.product?.id));

            return (
              <tr key={detail.id}>
                <td>
                  <strong>{product?.name ?? "Producto no disponible"}</strong>
                </td>
                <td>{detail.amount ?? "—"}</td>
                <td>{detail.product?.unitsMeasurement?.abbreviation ?? "—"}</td>
                <td className="recipe-detail-column-actions">
                  <div className="table-actions">
                    <button
                      className="table-action"
                      onClick={() => onEdit(detail)}
                      type="button"
                    >
                      <span className="action-label">Modificar</span>
                    </button>
                    <button
                      className="table-action danger"
                      disabled={deletingId === detail.id}
                      onClick={() => onDelete(detail)}
                      type="button"
                    >
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

export default RecipeDetailTable;
