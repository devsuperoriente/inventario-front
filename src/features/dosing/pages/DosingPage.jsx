import { useCallback, useEffect, useState } from "react";
import Toast from "../../../components/feedback/Toast.jsx";
import PageHeading from "../../../components/ui/PageHeading.jsx";
import { useAuth } from "../../../auth/useAuth.js";
import "../styles.css";
import RequiredMaterialsModal from "../../production-orders/components/RequiredMaterialsModal.jsx";
import { getProductionOrders } from "../../production-orders/services/productionOrdersApi.js";
import DosingOrdersList from "../components/DosingOrdersList.jsx";

async function requestProductionOrders() {
  const result = await getProductionOrders();
  if (!Array.isArray(result)) {
    throw new Error(
      "El endpoint de órdenes de producción debe responder con una lista.",
    );
  }
  return result;
}

function DosingPage() {
  const { canConsumeProductionOrders } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setOrders(await requestProductionOrders());
      return true;
    } catch (requestError) {
      console.error("Error al cargar órdenes para dosificación:", requestError);
      setError(requestError.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;
    requestProductionOrders()
      .then((result) => {
        if (isCurrent) setOrders(result);
      })
      .catch((requestError) => {
        console.error(
          "Error al cargar órdenes para dosificación:",
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
  }, []);

  async function handleConsumptionRegistered() {
    const refreshed = await loadOrders();
    setSelectedOrder(null);
    setToast({
      type: refreshed ? "success" : "error",
      message: refreshed
        ? "Dosificación iniciada y consumo registrado."
        : "El consumo se registró, pero no se pudo actualizar la lista. Intenta actualizarla.",
    });
  }

  return (
    <>
      <PageHeading
        className="provider-page-heading"
        description="Consulta los insumos requeridos por cada orden e inicia la dosificación registrando el consumo."
        eyebrow="PRODUCCIÓN"
        title="Dosificación"
      />

      <DosingOrdersList
        error={error}
        loading={loading}
        onRetry={loadOrders}
        onViewMaterials={setSelectedOrder}
        orders={orders}
      />

      {selectedOrder && (
        <RequiredMaterialsModal
          canRegisterConsumption={canConsumeProductionOrders()}
          onClose={() => setSelectedOrder(null)}
          onConsumptionRegistered={handleConsumptionRegistered}
          order={selectedOrder}
          showRecordedConsumption
        />
      )}

      <Toast
        duration={4500}
        key={toast?.message ?? "empty-dosing-toast"}
        message={toast?.message}
        onClose={() => setToast(null)}
        type={toast?.type ?? "success"}
      />
    </>
  );
}

export default DosingPage;
