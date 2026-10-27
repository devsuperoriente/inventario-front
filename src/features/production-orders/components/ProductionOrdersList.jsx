import { useMemo, useState } from "react";
import EmptyState from "../../../components/feedback/EmptyState.jsx";
import { getOrderDate } from "../utils/consolidateOrderDetails.js";

function getProductionOrderLabel(order) {
  return order.numberOrder ?? `#${order.id}`;
}

function getUserLabel(user) {
  if (typeof user === "string") return user;
  return user?.username ?? user?.name ?? user?.email ?? "—";
}

function ProductionOrdersList({
  orders,
  loading,
  error,
  onRetry,
  onViewMaterials,
}) {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const filteredOrders = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return [...orders]
      .filter((order) => !dateFilter || getOrderDate(order) === dateFilter)
      .filter((order) =>
        [
          getProductionOrderLabel(order),
          order.product?.name,
          order.productName,
          order.state?.name,
          order.quantitySheduled,
          order.quantityProduced,
          order.stateName,
          getUserLabel(order.user),
          order.observation,
        ].some((value) =>
          String(value ?? "")
            .toLocaleLowerCase()
            .includes(query),
        ),
      )
      .sort(
        (first, second) =>
          getOrderDate(second).localeCompare(getOrderDate(first)) ||
          Number(second.id) - Number(first.id),
      );
  }, [dateFilter, orders, search]);

  return (
    <section className="panel provider-panel production-orders-panel production-orders-list">
      <div className="panel-heading provider-panel-heading">
        <div>
          <h2>Órdenes de producción creadas</h2>
          <p>
            {filteredOrders.length} de {orders.length} órdenes
          </p>
        </div>
        <button
          className="btn-secondary"
          disabled={loading}
          onClick={onRetry}
          type="button"
        >
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {error ? (
        <div className="feature-load-error" role="alert">
          <p>No se pudieron cargar las órdenes de producción: {error}</p>
          <button className="btn-secondary" onClick={onRetry} type="button">
            Reintentar
          </button>
        </div>
      ) : loading ? (
        <p className="feature-loading" role="status">
          Cargando órdenes de producción...
        </p>
      ) : orders.length === 0 ? (
        <EmptyState
          title="Aún no hay órdenes de producción"
          description="Cuando crees órdenes, aparecerán aquí."
        />
      ) : (
        <>
          <div className="inventory-filters production-orders-search">
            <label className="search-field">
              <span className="sr-only">Buscar orden de producción</span>
              <span aria-hidden="true">Buscar</span>
              <input
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Número, producto, estado o usuario"
                type="search"
                value={search}
              />
            </label>
            <label className="filter-field">
              <span className="sr-only">Filtrar por fecha</span>
              <input
                aria-label="Filtrar por fecha"
                onChange={(event) => setDateFilter(event.target.value)}
                type="date"
                value={dateFilter}
              />
            </label>
          </div>
          {filteredOrders.length === 0 ? (
            <EmptyState
              title="No se encontraron órdenes"
              description="Cambia el texto de búsqueda para ver otros resultados."
            />
          ) : (
            <div className="table-wrap production-orders-records-wrap">
              <table className="production-orders-records-table">
                <caption className="sr-only">
                  Todas las órdenes de producción registradas
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Número</th>
                    <th scope="col">Fecha</th>
                    <th scope="col">Producto</th>
                    <th scope="col">Programada</th>
                    <th scope="col">Producida</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Responsable</th>
                    <th scope="col">Observación</th>
                    <th scope="col">Insumos</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td data-label="Número">
                        <strong>{getProductionOrderLabel(order)}</strong>
                      </td>
                      <td data-label="Fecha">{getOrderDate(order) || "—"}</td>
                      <td data-label="Producto">
                        {order.product?.name ?? order.productName ?? "—"}
                      </td>
                      <td data-label="Programada">
                        {order.quantitySheduled ?? "—"}
                      </td>
                      <td data-label="Producida">
                        {order.quantityProduced ?? "—"}
                      </td>
                      <td data-label="Estado">
                        <span className="production-order-status">
                          {order.state?.name ?? order.stateName ?? "—"}
                        </span>
                      </td>
                      <td data-label="Responsable">
                        {getUserLabel(order.user)}
                      </td>
                      <td data-label="Observación">
                        {order.observation || "—"}
                      </td>
                      <td data-label="Insumos">
                        <button
                          aria-label={`Ver insumos requeridos de ${getProductionOrderLabel(order)}`}
                          className="production-order-calculate-button"
                          onClick={() => onViewMaterials(order)}
                          type="button"
                        >
                          Ver insumos
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default ProductionOrdersList;
