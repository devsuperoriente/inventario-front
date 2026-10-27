import { useEffect, useMemo, useState } from "react";
import EmptyState from "../../../components/feedback/EmptyState.jsx";
import { getOrderDate } from "../../production-orders/utils/consolidateOrderDetails.js";
import { normalizeProductionOrderStateName } from "../../production-orders/utils/productionOrderStates.js";
import { getOrderStates } from "../../states/services/orderStatesApi.js";

function getOrderLabel(order) {
  return order.numberOrder ?? `#${order.id}`;
}

function DosingOrdersList({
  orders = [],
  loading,
  error,
  onRetry,
  onViewMaterials,
}) {
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState(null);
  const [statesFromApi, setStatesFromApi] = useState([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [statesError, setStatesError] = useState(null);

  // Cargar estados dinámicamente desde la API
  useEffect(() => {
    let isMounted = true;
    setLoadingStates(true);

    getOrderStates()
      .then((data) => {
        if (!isMounted) return;

        // Obtener arreglo de datos
        const rawStates = Array.isArray(data) ? data : (data?.data ?? []);

        // Filtrar solo los estados activos y mapearlos con su id y label
        const activeStates = rawStates
          .filter((state) => state.isActive !== false)
          .map((state) => ({
            id: String(state.id),
            label: state.name,
            normalizedName: normalizeProductionOrderStateName(state.name),
          }));

        setStatesFromApi(activeStates);

        // Establecer el primer estado como pestaña activa por defecto
        if (activeStates.length > 0) {
          setActiveGroup(activeStates[0].id);
        }

        setStatesError(null);
      })
      .catch((err) => {
        if (isMounted) {
          setStatesError(
            err.message || "Error al cargar los estados de la API",
          );
        }
      })
      .finally(() => {
        if (isMounted) setLoadingStates(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Agrupar órdenes filtradas dinámicamente según los estados de la API
  const groupedOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filteredOrders = [...orders]
      .filter((order) =>
        [
          getOrderLabel(order),
          order.product?.name,
          order.productName,
          order.state?.name,
          order.stateName,
          order.observation,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query),
        ),
      )
      .sort(
        (first, second) =>
          getOrderDate(second).localeCompare(getOrderDate(first)) ||
          Number(second.id) - Number(first.id),
      );

    return Object.fromEntries(
      statesFromApi.map((group) => [
        group.id,
        filteredOrders.filter((order) => {
          const orderState = normalizeProductionOrderStateName(
            order.state?.name ?? order.stateName,
          );
          // Compara si coinciden por ID o por Nombre de estado
          return (
            String(order.state?.id ?? order.stateId) === group.id ||
            orderState === group.normalizedName
          );
        }),
      ]),
    );
  }, [orders, search, statesFromApi]);

  const activeOrders = activeGroup ? (groupedOrders[activeGroup] ?? []) : [];

  const matchingOrderCount = statesFromApi.reduce(
    (total, group) => total + (groupedOrders[group.id]?.length ?? 0),
    0,
  );

  const isGlobalLoading = loading || loadingStates;
  const combinedError = error || statesError;

  return (
    <section className="panel provider-panel dosing-orders-panel">
      <div className="panel-heading provider-panel-heading">
        <div>
          <h2>Órdenes de producción</h2>
          <p>
            {matchingOrderCount} de {orders.length} órdenes
          </p>
        </div>
        <button
          className="btn-secondary"
          disabled={isGlobalLoading}
          onClick={onRetry}
          type="button"
        >
          {isGlobalLoading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {combinedError ? (
        <div className="feature-load-error" role="alert">
          <p>No se pudieron cargar los datos: {combinedError}</p>
          <button
            className="btn-secondary"
            disabled={isGlobalLoading}
            onClick={onRetry}
            type="button"
          >
            Reintentar
          </button>
        </div>
      ) : isGlobalLoading ? (
        <p className="feature-loading" role="status">
          Cargando órdenes de producción...
        </p>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No hay órdenes de producción"
          description="Las órdenes disponibles para consultar aparecerán aquí."
        />
      ) : (
        <>
          <div className="inventory-filters dosing-orders-search">
            <label className="search-field">
              <span className="sr-only">Buscar órdenes</span>
              <span aria-hidden="true">Buscar</span>
              <input
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Número, producto o estado"
                type="search"
                value={search}
              />
            </label>
          </div>

          <nav aria-label="Filtrar órdenes por estado" className="dosing-tabs">
            {statesFromApi.map((group) => (
              <button
                aria-pressed={activeGroup === group.id}
                className={`dosing-tab${activeGroup === group.id ? " is-active" : ""}`}
                key={group.id}
                onClick={() => setActiveGroup(group.id)}
                type="button"
              >
                {group.label}
                <span className="dosing-tab-count">
                  {groupedOrders[group.id]?.length ?? 0}
                </span>
              </button>
            ))}
          </nav>

          {matchingOrderCount === 0 ? (
            <EmptyState
              title="No se encontraron órdenes"
              description="Prueba con otro número, producto o estado."
            />
          ) : activeOrders.length === 0 ? (
            <EmptyState
              title="No hay órdenes en este estado"
              description="Selecciona otro estado para consultar órdenes de producción."
            />
          ) : (
            <div className="dosing-orders-grid">
              {activeOrders.map((order) => (
                <article className="dosing-order-card" key={order.id}>
                  <div className="dosing-order-heading">
                    <div>
                      <span className="dosing-order-label">Orden</span>
                      <h3>{getOrderLabel(order)}</h3>
                    </div>
                    <span className="production-order-status">
                      {order.state?.name ?? order.stateName ?? "Sin estado"}
                    </span>
                  </div>
                  <dl className="dosing-order-details">
                    <div>
                      <dt>Producto</dt>
                      <dd>{order.product?.name ?? order.productName ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>Fecha</dt>
                      <dd>{getOrderDate(order) || "—"}</dd>
                    </div>
                    <div>
                      <dt>Cantidad programada</dt>
                      <dd>{order.quantitySheduled ?? "—"}</dd>
                    </div>
                  </dl>
                  <button
                    aria-label={`Consultar insumos de la orden ${getOrderLabel(order)}`}
                    className="btn-primary dosing-order-action"
                    onClick={() => onViewMaterials(order)}
                    type="button"
                  >
                    Consultar insumos
                  </button>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default DosingOrdersList;
