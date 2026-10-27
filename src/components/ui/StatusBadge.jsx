const statusLabels = {
  available: "Disponible",
  low: "Stock bajo",
  expiring: "Por vencer",
};

function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${status}`}>
      {statusLabels[status] ?? status}
    </span>
  );
}

export default StatusBadge;
