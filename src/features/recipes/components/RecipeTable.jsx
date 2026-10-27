import EmptyState from "../../../components/feedback/EmptyState.jsx";

function RecipeTable({ items, onEdit, onDelete, onViewDetails, deletingId }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No se encontraron recetas"
        description="Prueba con otro nombre, código o versión."
      />
    );
  }

  return (
    <div className="table-wrap recipe-table-wrap">
      <table className="recipe-table">
        <caption className="sr-only">
          Recetas, productos finales y versiones registradas
        </caption>
        <thead>
          <tr>
            <th scope="col">Producto final</th>
            <th scope="col">Nombre</th>
            <th scope="col">Versión</th>
            <th className="recipe-column-description" scope="col">
              Rendimiento base
            </th>
            <th className="recipe-column-description" scope="col">
              Descripción
            </th>
            <th className="recipe-column-actions" scope="col">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((recipe) => (
            <tr key={recipe.id}>
              <td>{recipe.product?.name ?? recipe.productName ?? "—"}</td>
              <td>
                <strong>{recipe.name}</strong>
              </td>
              <td>{recipe.version}</td>
              <td>{recipe.baseYield}</td>
              <td className="recipe-column-description">
                {recipe.description || "—"}
              </td>
              <td className="recipe-column-actions">
                <div className="table-actions">
                  <button
                    className="table-action"
                    onClick={() => onViewDetails(recipe)}
                    type="button"
                  >
                    <span className="action-label">Ingredientes</span>
                  </button>
                  <button
                    className="table-action"
                    onClick={() => onEdit(recipe)}
                    type="button"
                  >
                    <span className="action-label">Modificar</span>
                  </button>
                  <button
                    className="table-action danger"
                    disabled={deletingId === recipe.id}
                    onClick={() => onDelete(recipe)}
                    type="button"
                  >
                    <span className="action-label">
                      {deletingId === recipe.id ? "Eliminando..." : "Eliminar"}
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

export default RecipeTable;
