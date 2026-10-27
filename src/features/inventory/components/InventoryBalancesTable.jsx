import { useState } from "react";
import EmptyState from "../../../components/feedback/EmptyState.jsx";
import InventoryProductStockModal from "./InventoryProductStockModal.jsx";
import { formatStockQuantity } from "../utils/inventoryStock.js";

function InventoryBalancesTable({ products, batches = [] }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  if (!products || products.length === 0) {
    return (
      <EmptyState
        title="No se encontraron existencias"
        description="Prueba otra búsqueda o registra existencias para consultar el inventario."
      />
    );
  }

  return (
    <>
      <div className="table-wrap inventory-ledger-table-wrap">
        <table className="inventory-ledger-table inventory-product-stock-table">
          <caption className="sr-only">
            Existencias actuales agrupadas por producto
          </caption>
          <thead>
            <tr>
              <th scope="col">Producto</th>
              <th scope="col">Disponible total</th>
              <th scope="col">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => {
              // Filtramos los lotes que corresponden a este productId
              const productBatches = batches.filter(
                (batch) =>
                  String(batch.productId ?? batch.product?.id) ===
                  String(item.productId),
              );

              return (
                <tr key={item.productId}>
                  <td data-label="Producto">
                    <strong>{item.product}</strong>
                  </td>
                  <td data-label="Disponible total">
                    <strong>
                      {formatStockQuantity(item.quantityStock)}
                      {item.unitMeasurement ? ` ${item.unitMeasurement}` : ""}
                    </strong>
                  </td>
                  <td data-label="Detalle">
                    <button
                      aria-label={`Ver lotes de ${item.product}`}
                      className="inventory-product-details-button"
                      disabled={item.productId == null}
                      onClick={() =>
                        setSelectedProduct({
                          id: item.productId,
                          name: item.product,
                          unit: item.unitMeasurement,
                          available: item.quantityStock,
                          batches: productBatches,
                        })
                      }
                      type="button"
                    >
                      Ver lotes
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {selectedProduct && (
        <InventoryProductStockModal
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
        />
      )}
    </>
  );
}

export default InventoryBalancesTable;
