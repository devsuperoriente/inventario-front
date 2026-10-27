import EmptyState from "../../../components/feedback/EmptyState.jsx";

function ProductTable({
  items,
  categoriesById,
  unitsById,
  onEdit,
  onDelete,
  deletingId,
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No se encontraron productos"
        description="Prueba con otro nombre, codigo, categoria o unidad."
      />
    );
  }

  return (
    <div className="table-wrap product-table-wrap">
      <table className="product-table">
        <caption className="sr-only">
          Productos registrados con sus categorias y unidades de medida
        </caption>
        <thead>
          <tr>
            <th scope="col">Producto</th>
            <th className="product-column-code" scope="col">
              Codigo
            </th>
            <th className="product-column-category" scope="col">
              Categoria
            </th>
            <th className="product-column-unit" scope="col">
              Unidad
            </th>
            <th className="product-column-actions" scope="col">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((product) => {
            const category =
              product.category ??
              categoriesById.get(String(product.categoryId));
            const measurementUnit =
              product.unitsMeasurement ??
              unitsById.get(String(product.unitsMeasurementId));

            return (
              <tr key={product.id}>
                <td>
                  <strong>{product.name}</strong>
                </td>
                <td className="product-column-code">{product.code || "—"}</td>
                <td className="product-column-category">
                  {category?.name ?? "—"}
                </td>
                <td className="product-column-category">
                  {measurementUnit?.abbreviation ?? "—"}
                </td>
                <td className="product-column-actions">
                  <div className="table-actions">
                    <button
                      aria-label={`Modificar producto ${product.name}`}
                      className="table-action"
                      onClick={() => onEdit(product)}
                      title="Modificar producto"
                      type="button"
                    >
                      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                        <path d="m13.5 3.5 3 3M4 16l3.4-.7L16 6.7a2.12 2.12 0 0 0-3-3l-8.6 8.6L4 16Z" />
                      </svg>
                      <span className="action-label">Modificar</span>
                    </button>
                    <button
                      aria-label={`${deletingId === product.id ? "Eliminando" : "Eliminar"} producto ${product.name}`}
                      className="table-action danger"
                      disabled={deletingId === product.id}
                      onClick={() => onDelete(product)}
                      title="Eliminar producto"
                      type="button"
                    >
                      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                        <path d="M3.5 5.5h13M8 5.5V3.8h4v1.7m-6.5 0 .7 10.7h7.6l.7-10.7M8.2 8.5v5m3.6-5v5" />
                      </svg>
                      <span className="action-label">
                        {deletingId === product.id
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

export default ProductTable;
