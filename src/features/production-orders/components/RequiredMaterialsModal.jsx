import { useEffect, useState } from "react";
import EmptyState from "../../../components/feedback/EmptyState.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import {
  getMaterialConsumptionByOrderProduction,
  getRequiredMaterials,
  registerRawMaterialConsumption,
} from "../services/productionOrdersApi.js";

function formatDate(value, includeTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" } : {}),
  }).format(date);
}

function RequiredMaterialsModal({
  order,
  onClose,
  onConsumptionRegistered,
  canRegisterConsumption = true,
  showRecordedConsumption = false,
  isAlreadyDosing = false,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [consumptions, setConsumptions] = useState([]);
  const [consumptionLoading, setConsumptionLoading] = useState(true);
  const [consumptionQueryError, setConsumptionQueryError] = useState("");
  const [consumptionRetryCount, setConsumptionRetryCount] = useState(0);
  const [confirmingConsumption, setConfirmingConsumption] = useState(false);
  const [registeringConsumption, setRegisteringConsumption] = useState(false);
  const [consumptionError, setConsumptionError] = useState("");

  useEffect(() => {
    let isCurrent = true;
    getRequiredMaterials(order.id)
      .then((result) => {
        if (isCurrent) setData(result);
      })
      .catch((requestError) => {
        console.error("Error al calcular insumos requeridos:", requestError);
        if (isCurrent) setError(requestError.message);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [order.id, retryCount]);

  useEffect(() => {
    if (!showRecordedConsumption) return undefined;
    let isCurrent = true;
    getMaterialConsumptionByOrderProduction(order.id)
      .then((result) => {
        if (!Array.isArray(result)) {
          throw new Error(
            "El endpoint de consumo debe responder con una lista.",
          );
        }
        if (isCurrent) setConsumptions(result);
      })
      .catch((requestError) => {
        console.error(
          "Error al consultar el consumo de la orden:",
          requestError,
        );
        if (isCurrent) setConsumptionQueryError(requestError.message);
      })
      .finally(() => {
        if (isCurrent) setConsumptionLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [order.id, consumptionRetryCount, showRecordedConsumption]);

  const recipe = data?.receta;
  const materials = data?.insumos;
  const productionOrder = data?.orden ?? order;
  const hasRecordedConsumption = consumptions.length > 0;
  const canStartConsumption =
    !isAlreadyDosing &&
    (!showRecordedConsumption ||
      (!consumptionLoading &&
        !consumptionQueryError &&
        !hasRecordedConsumption));

  async function handleRegisterConsumption() {
    setRegisteringConsumption(true);
    setConsumptionError("");
    try {
      await registerRawMaterialConsumption(order.id);
      await onConsumptionRegistered();
    } catch (requestError) {
      console.error(
        "Error al registrar el consumo de materia prima:",
        requestError,
      );
      setConsumptionError(requestError.message);
      setConfirmingConsumption(false);
    } finally {
      setRegisteringConsumption(false);
    }
  }

  return (
    <Modal
      className="required-materials-modal"
      closeDisabled={registeringConsumption}
      description={`Insumos requeridos para la orden ${order.numberOrder ?? `#${order.id}`}.`}
      onClose={onClose}
      title="Consumo de materia prima"
    >
      <div className="required-materials-content">
        {showRecordedConsumption && (
          <section
            aria-label="Consumo registrado"
            className="required-materials-record"
          >
            <h3>Consumo registrado</h3>
            {consumptionLoading ? (
              <p className="feature-loading" role="status">
                Consultando consumo...
              </p>
            ) : consumptionQueryError ? (
              <div className="feature-load-error" role="alert">
                <p>No se pudo consultar el consumo: {consumptionQueryError}</p>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setConsumptionLoading(true);
                    setConsumptionQueryError("");
                    setConsumptionRetryCount((current) => current + 1);
                  }}
                  type="button"
                >
                  Reintentar consulta
                </button>
              </div>
            ) : consumptions.length === 0 ? (
              <p className="required-materials-state-notice" role="status">
                No hay un consumo registrado para esta orden.
              </p>
            ) : (
              <div className="required-materials-record-list">
                {consumptions.map((consumption, index) => {
                  const batch = consumption.batch;
                  return (
                    <article
                      className="required-materials-record-item"
                      key={consumption.id ?? `${batch?.id ?? "batch"}-${index}`}
                    >
                      <h4>
                        Consumo {index + 1}
                        {batch?.code ? ` · Lote ${batch.code}` : ""}
                      </h4>
                      <dl className="required-materials-record-details">
                        <div>
                          <dt>Cantidad consumida</dt>
                          <dd>{consumption.quantity ?? "—"}</dd>
                        </div>
                        <div>
                          <dt>Fecha</dt>
                          <dd>{formatDate(consumption.date, true)}</dd>
                        </div>
                        <div>
                          <dt>Código del lote</dt>
                          <dd>{batch?.code ?? "—"}</dd>
                        </div>
                        <div>
                          <dt>Cantidad inicial del lote</dt>
                          <dd>{batch?.quantityInitial ?? "—"}</dd>
                        </div>
                        <div>
                          <dt>Cantidad disponible</dt>
                          <dd>{batch?.quantityAvailable ?? "—"}</dd>
                        </div>
                        <div>
                          <dt>Vencimiento del lote</dt>
                          <dd>{formatDate(batch?.expirationDate)}</dd>
                        </div>
                        <div>
                          <dt>Temperatura</dt>
                          <dd>{batch?.temperature ?? "—"}</dd>
                        </div>
                      </dl>
                      {consumption.observation && (
                        <p className="required-materials-record-observation">
                          <strong>Observación:</strong>{" "}
                          {consumption.observation}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {loading ? (
          <p className="feature-loading" role="status">
            Calculando insumos...
          </p>
        ) : error ? (
          <div className="feature-load-error" role="alert">
            <p>No se pudieron calcular los insumos: {error}</p>
            <button
              className="btn-secondary"
              onClick={() => {
                setLoading(true);
                setError("");
                setRetryCount((current) => current + 1);
              }}
              type="button"
            >
              Reintentar
            </button>
          </div>
        ) : !Array.isArray(materials) || materials.length === 0 ? (
          <EmptyState
            title="La receta no tiene insumos"
            description="La orden no tiene materiales requeridos para mostrar."
          />
        ) : (
          <>
            <div className="required-materials-summary">
              <div>
                <span>Producto final</span>
                <strong>
                  {productionOrder.product?.name ?? order.product?.name ?? "—"}
                </strong>
              </div>
              <div>
                <span>Cantidad programada</span>
                <strong>
                  {productionOrder.quantitySheduled ??
                    order.quantitySheduled ??
                    "—"}
                </strong>
              </div>
              <div>
                <span>Receta</span>
                <strong>
                  {recipe?.name ?? "—"}
                  {recipe?.version ? ` · ${recipe.version}` : ""}
                </strong>
              </div>
            </div>

            <div className="table-wrap required-materials-table-wrap">
              <table className="required-materials-table">
                <caption className="sr-only">
                  Materiales requeridos para la orden de producción
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Insumo</th>
                    <th scope="col">Cantidad requerida</th>
                    <th scope="col">Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((material) => (
                    <tr key={material.id}>
                      <td data-label="Insumo">
                        <strong>{material.nombre}</strong>
                      </td>
                      <td data-label="Cantidad requerida">
                        {material.cantidadRequerida}
                      </td>
                      <td data-label="Unidad">
                        {material.unidadMedida?.abreviatura ??
                          material.unidadMedida?.nombre ??
                          "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {canRegisterConsumption && !canStartConsumption ? (
              <p className="required-materials-state-notice" role="status">
                {isAlreadyDosing
                  ? "La orden ya está en dosificación. No se puede iniciar ni registrar el consumo nuevamente."
                  : consumptionLoading
                    ? "Verificando si ya se registró el consumo..."
                    : consumptionQueryError
                      ? "No se puede iniciar la dosificación porque no fue posible verificar el consumo registrado."
                      : "El consumo ya está registrado para esta orden. No se puede iniciar la dosificación nuevamente."}
              </p>
            ) : canRegisterConsumption ? (
              <div className="required-materials-consumption">
                <p>
                  Al confirmar, el backend iniciará la dosificación y registrará
                  el consumo de los lotes vigentes según FEFO en una sola
                  operación.
                </p>
                {consumptionError && (
                  <p className="form-error" role="alert">
                    No se pudo registrar el consumo: {consumptionError}
                  </p>
                )}
                {confirmingConsumption ? (
                  <div
                    className="required-materials-confirmation"
                    role="group"
                    aria-label="Confirmar consumo"
                  >
                    <span>
                      La orden cambiará a dosificación y se descontarán las
                      existencias de los lotes. ¿Deseas continuar?
                    </span>
                    <button
                      className="btn-secondary"
                      disabled={registeringConsumption}
                      onClick={() => setConfirmingConsumption(false)}
                      type="button"
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn-primary"
                      disabled={registeringConsumption}
                      onClick={handleRegisterConsumption}
                      type="button"
                    >
                      {registeringConsumption
                        ? "Procesando consumo..."
                        : "Confirmar dosificación y consumo"}
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn-primary required-materials-register-button"
                    onClick={() => {
                      setConsumptionError("");
                      setConfirmingConsumption(true);
                    }}
                    type="button"
                  >
                    Iniciar dosificación y registrar consumo
                  </button>
                )}
              </div>
            ) : (
              <p className="required-materials-state-notice" role="status">
                Puedes consultar los insumos, pero necesitas el permiso
                production-orders:consume para iniciar la dosificación y
                registrar el consumo.
              </p>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

export default RequiredMaterialsModal;
