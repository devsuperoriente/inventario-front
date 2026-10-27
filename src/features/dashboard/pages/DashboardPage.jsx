import PageHeading from "../../../components/ui/PageHeading.jsx";
import ExpiryAlerts from "../components/ExpiryAlerts.jsx";
import { inventoryItems } from "../../inventory/data/inventoryItems.js";

const stats = [
  {
    label: "Insumos registrados",
    value: "128",
    detail: "Materias primas activas",
    style: "green",
  },
  {
    label: "Stock bajo",
    value: "06",
    detail: "Requieren revision",
    style: "orange",
  },
  {
    label: "Por vencer",
    value: "04",
    detail: "Proximos 30 dias",
    style: "red",
  },
  {
    label: "Ordenes abiertas",
    value: "12",
    detail: "En produccion",
    style: "blue",
  },
];

function DashboardPage() {
  const expiringItems = inventoryItems.filter(
    (item) => item.status === "expiring",
  );
  const todayLabel = new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <>
      <PageHeading
        eyebrow={todayLabel.toLocaleUpperCase("es-CO")}
        title="Resumen de planta"
        description="Estado general de materias primas y produccion."
        action={<span className="panel-count">Datos de ejemplo</span>}
      />

      <section className="stats-grid" aria-label="Indicadores de inventario">
        {stats.map((stat) => (
          <article className={`stat-card ${stat.style}`} key={stat.label}>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
            <span>{stat.detail}</span>
          </article>
        ))}
      </section>

      <ExpiryAlerts items={expiringItems} />
    </>
  );
}

export default DashboardPage;
