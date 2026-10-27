function ConsolidatedProductsTable({
  items,
  createdProductIds,
  creating,
  onQuantityChange,
}) {
  return (
    <div className="table-wrap orders-table-wrap">
      <table className="orders-table production-orders-table">
        <caption className="sr-only">
          Cantidades consolidadas por producto
        </caption>
        <thead>
          <tr>
            <th scope="col">Producto</th>
            <th scope="col">Código</th>
            <th scope="col">Cantidad total a producir</th>
            <th scope="col">Unidad</th>
            <th scope="col">Estado</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const created = createdProductIds.has(String(item.productId));
            return (
              <tr key={item.productId}>
                <td data-label="Producto">
                  <strong>{item.productName}</strong>
                </td>
                <td data-label="Código">{item.productCode || "—"}</td>
                <td data-label="Cantidad a producir">
                  <label>
                    <span className="sr-only">
                      Cantidad total a producir de {item.productName}
                    </span>
                    <input
                      aria-label={`Cantidad total a producir de ${item.productName}`}
                      className="production-order-quantity"
                      disabled={creating || created}
                      min="0.01"
                      onChange={(event) =>
                        onQuantityChange(item.productId, event.target.value)
                      }
                      step="0.01"
                      type="number"
                      value={item.quantity}
                    />
                  </label>
                </td>
                <td data-label="Unidad">{item.unit}</td>
                <td data-label="Estado">
                  <span
                    className={`production-order-status${created ? " is-created" : ""}`}
                  >
                    {created ? "Creada" : "Pendiente"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ConsolidatedProductsTable;
