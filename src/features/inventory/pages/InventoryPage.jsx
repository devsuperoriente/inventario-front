import { useEffect, useMemo, useState } from "react";
import EmptyState from "../../../components/feedback/EmptyState.jsx";
import PageHeading from "../../../components/ui/PageHeading.jsx";
import { getBatches } from "../../batches/services/batchesApi.js";
import InventoryBalancesTable from "../components/InventoryBalancesTable.jsx";
import InventoryMovementsTable from "../components/InventoryMovementsTable.jsx";
import InventorySectionTabs from "../components/InventorySectionTabs.jsx";
import { getInventoryMovements } from "../services/inventoryMovementsApi.js";
import { getStock } from "../services/inventoryStockApi.js";
import {
  getMovementBatch,
  getMovementDate,
} from "../utils/inventorySelectors.js";

function InventoryPage() {
  const [activeTab, setActiveTab] = useState("stock");
  const [stock, setStock] = useState([]);
  const [batches, setBatches] = useState([]);
  const [movements, setMovements] = useState([]);
  const [stockSearch, setStockSearch] = useState("");
  const [movementSearch, setMovementSearch] = useState("");
  const [movementDate, setMovementDate] = useState("");
  const [stockLoading, setStockLoading] = useState(true);
  const [movementsLoading, setMovementsLoading] = useState(true);
  const [stockError, setStockError] = useState("");
  const [movementsError, setMovementsError] = useState("");

  async function refreshStock() {
    setStockLoading(true);
    setStockError("");
    try {
      const result = await getStock();
      const stockList = Array.isArray(result) ? result : (result?.stock ?? []);
      setStock(stockList);
    } catch (error) {
      console.error("Error al cargar existencias:", error);
      setStockError(error.message);
    } finally {
      setStockLoading(false);
    }
  }

  async function refreshMovements() {
    setMovementsLoading(true);
    setMovementsError("");
    try {
      const result = await getInventoryMovements();
      if (!Array.isArray(result)) {
        throw new Error(
          "El endpoint de movimientos debe responder con una lista.",
        );
      }
      setMovements(result);
    } catch (error) {
      console.error("Error al cargar movimientos de inventario:", error);
      setMovementsError(error.message);
    } finally {
      setMovementsLoading(false);
    }
  }

  useEffect(() => {
    let isCurrent = true;

    // Cargar existencias desde /lotes/existencias
    getStock()
      .then((result) => {
        const stockList = Array.isArray(result)
          ? result
          : (result?.stock ?? []);
        if (isCurrent) setStock(stockList);
      })
      .catch((error) => {
        console.error("Error al cargar existencias:", error);
        if (isCurrent) setStockError(error.message);
      })
      .finally(() => {
        if (isCurrent) setStockLoading(false);
      });

    // Cargar lotes auxiliares para el detalle de movimientos
    getBatches()
      .then((result) => {
        if (Array.isArray(result) && isCurrent) setBatches(result);
      })
      .catch((error) => {
        console.error("Error al cargar lotes auxiliares:", error);
      });

    // Cargar movimientos de inventario
    getInventoryMovements()
      .then((result) => {
        if (!Array.isArray(result)) {
          throw new Error(
            "El endpoint de movimientos debe responder con una lista.",
          );
        }
        if (isCurrent) setMovements(result);
      })
      .catch((error) => {
        console.error("Error al cargar movimientos de inventario:", error);
        if (isCurrent) setMovementsError(error.message);
      })
      .finally(() => {
        if (isCurrent) setMovementsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const batchesById = useMemo(
    () => new Map(batches.map((batch) => [String(batch.id), batch])),
    [batches],
  );

  // Filtrado de la lista de existencias según la caja de búsqueda
  const filteredStock = useMemo(() => {
    const query = stockSearch.trim().toLowerCase();
    return stock
      .filter((item) =>
        [item.product, item.unitMeasurement].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query),
        ),
      )
      .sort((a, b) =>
        String(a.product ?? "").localeCompare(String(b.product ?? "")),
      );
  }, [stock, stockSearch]);

  const filteredMovements = useMemo(() => {
    const query = movementSearch.trim().toLowerCase();
    return [...movements]
      .filter(
        (movement) =>
          !movementDate || getMovementDate(movement) === movementDate,
      )
      .filter((movement) => {
        const batch = getMovementBatch(movement, batchesById);
        const values = [
          movement.typeMovement?.name,
          movement.typeMovementName,
          movement.observation,
          movement.ordersProduction?.numberOrder,
          movement.orderProduction?.numberOrder,
          batch?.code,
          batch?.product?.name,
          batch?.productName,
          movement.quantity,
          movement.balancePrevius,
          movement.balanceCurrent,
        ];
        return values.some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query),
        );
      })
      .sort((first, second) =>
        String(second.date ?? "").localeCompare(String(first.date ?? "")),
      );
  }, [batchesById, movementDate, movementSearch, movements]);

  const productCount = stock.length;

  return (
    <>
      <PageHeading
        className="provider-page-heading"
        eyebrow="INVENTARIO"
        title="Inventario y movimientos"
        description="Consulta el disponible total por producto y explora el historial de movimientos."
      />

      <div className="inventory-summary-grid">
        <article className="inventory-summary-card">
          <span>Productos en inventario</span>
          <strong>{productCount}</strong>
        </article>
        <article className="inventory-summary-card">
          <span>Lotes registrados</span>
          <strong>{batches.length}</strong>
        </article>
        <article className="inventory-summary-card">
          <span>Movimientos registrados</span>
          <strong>{movements.length}</strong>
        </article>
      </div>

      <InventorySectionTabs
        activeTab={activeTab}
        counts={{ products: productCount, movements: movements.length }}
        onTabChange={setActiveTab}
      />

      {activeTab === "stock" ? (
        <section className="panel inventory-panel">
          <div className="panel-heading inventory-ledger-heading">
            <div>
              <h2>Existencias por producto</h2>
              <p>
                {filteredStock.length} de {productCount} productos
              </p>
            </div>
            <button
              className="btn-secondary"
              disabled={stockLoading}
              onClick={refreshStock}
              type="button"
            >
              {stockLoading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
          {stockError ? (
            <div className="feature-load-error" role="alert">
              <p>No se pudieron cargar las existencias: {stockError}</p>
              <button
                className="btn-secondary"
                onClick={refreshStock}
                type="button"
              >
                Reintentar
              </button>
            </div>
          ) : stockLoading ? (
            <p className="feature-loading" role="status">
              Cargando existencias...
            </p>
          ) : stock.length === 0 ? (
            <EmptyState
              title="Aún no hay existencias en inventario"
              description="Las existencias aparecerán cuando se registren en el sistema."
            />
          ) : (
            <>
              <div className="inventory-filters inventory-ledger-filters">
                <label className="search-field">
                  <span className="sr-only">Buscar existencias</span>
                  <span aria-hidden="true">Buscar</span>
                  <input
                    onChange={(event) => setStockSearch(event.target.value)}
                    placeholder="Buscar producto o unidad"
                    type="search"
                    value={stockSearch}
                  />
                </label>
              </div>
              <InventoryBalancesTable
                products={filteredStock}
                batches={batches}
              />
            </>
          )}
        </section>
      ) : (
        <section className="panel inventory-panel">
          <div className="panel-heading inventory-ledger-heading">
            <div>
              <h2>Historial de movimientos</h2>
              <p>
                {filteredMovements.length} de {movements.length} movimientos
              </p>
            </div>
            <button
              className="btn-secondary"
              disabled={movementsLoading}
              onClick={refreshMovements}
              type="button"
            >
              {movementsLoading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
          {movementsError ? (
            <div className="feature-load-error" role="alert">
              <p>No se pudieron cargar los movimientos: {movementsError}</p>
              <button
                className="btn-secondary"
                onClick={refreshMovements}
                type="button"
              >
                Reintentar
              </button>
            </div>
          ) : movementsLoading ? (
            <p className="feature-loading" role="status">
              Cargando movimientos...
            </p>
          ) : movements.length === 0 ? (
            <EmptyState
              title="Aún no hay movimientos registrados"
              description="Los movimientos registrados por el backend aparecerán aquí."
            />
          ) : (
            <>
              <div className="inventory-filters inventory-ledger-filters">
                <label className="search-field">
                  <span className="sr-only">Buscar movimientos</span>
                  <span aria-hidden="true">Buscar</span>
                  <input
                    onChange={(event) => setMovementSearch(event.target.value)}
                    placeholder="Producto, lote, tipo u observación"
                    type="search"
                    value={movementSearch}
                  />
                </label>
                <label className="filter-field">
                  <span className="sr-only">Filtrar movimientos por fecha</span>
                  <input
                    aria-label="Filtrar movimientos por fecha"
                    onChange={(event) => setMovementDate(event.target.value)}
                    type="date"
                    value={movementDate}
                  />
                </label>
              </div>
              <InventoryMovementsTable
                batchesById={batchesById}
                movements={filteredMovements}
              />
            </>
          )}
        </section>
      )}
    </>
  );
}

export default InventoryPage;
