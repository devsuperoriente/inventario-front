import { useEffect, useState } from "react";
import Modal from "../../../components/ui/Modal.jsx";
import { getStock } from "../services/inventoryStockApi.js";
import { formatStockQuantity } from "../utils/inventoryStock.js";

function InventoryProductStockModal({ product, onClose }) {
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    getStock()
      .then((result) => {
        if (!result || !Array.isArray(result.stock)) {
          throw new Error(
            "El endpoint de existencias debe responder con una lista de productos.",
          );
        }
        const productStock = result.stock.find(
          (item) => String(item.productId) === String(product.id),
        );
        if (isCurrent) setStock(productStock ?? null);
      })
      .catch((requestError) => {
        console.error(
          `Error al cargar existencias del producto ${product.id}:`,
          requestError,
        );
        if (isCurrent) setError(requestError.message);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [product.id, retry]);

  const unit = stock?.unitMeasurement || product.unit;
  const batches = Array.isArray(product.batches) ? product.batches : [];

  return (
    <Modal
      className="inventory-product-stock-modal"
      description={`Existencias totales de ${product.name}.`}
      onClose={onClose}
      title={stock?.product ?? product.name}
    >
      {loading ? (
        <p className="feature-loading" role="status">
          Cargando existencias del producto...
        </p>
      ) : error ? (
        <div className="feature-load-error" role="alert">
          <p>No se pudieron cargar las existencias del producto: {error}</p>
          <button
            className="btn-secondary"
            onClick={() => {
              setError("");
              setLoading(true);
              setRetry((value) => value + 1);
            }}
            type="button"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div className="inventory-product-stock-content">
          <div className="inventory-product-stock-total">
            <span>Disponible total</span>
            <strong>
              {formatStockQuantity(stock?.quantityStock)}
              {unit ? ` ${unit}` : ""}
            </strong>
            <span>
              {batches.length} {batches.length === 1 ? "lote" : "lotes"}
            </span>
          </div>
          {batches.length === 0 ? (
            <p className="inventory-product-stock-empty">
              Este producto no tiene lotes registrados.
            </p>
          ) : (
            <div className="inventory-product-batch-list">
              {batches.map((batch) => (
                <article
                  className="inventory-product-batch-card"
                  key={batch.id}
                >
                  <div className="inventory-product-batch-heading">
                    <strong>{batch.code || `Lote #${batch.id}`}</strong>
                    <span>
                      {batch.provider?.name ??
                        batch.providerName ??
                        "Sin proveedor"}
                    </span>
                  </div>
                  <dl>
                    <div>
                      <dt>Disponible</dt>
                      <dd>
                        {formatStockQuantity(batch.quantityAvailable)}
                        {unit ? ` ${unit}` : ""}
                      </dd>
                    </div>
                    <div>
                      <dt>Cantidad inicial</dt>
                      <dd>
                        {formatStockQuantity(batch.quantityInitial)}
                        {unit ? ` ${unit}` : ""}
                      </dd>
                    </div>
                    <div>
                      <dt>Ingreso</dt>
                      <dd>
                        {String(batch.entryDate ?? "").slice(0, 10) || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt>Vencimiento</dt>
                      <dd>
                        {String(batch.expirationDate ?? "").slice(0, 10) || "—"}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export default InventoryProductStockModal;
