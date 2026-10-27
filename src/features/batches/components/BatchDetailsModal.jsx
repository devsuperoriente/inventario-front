import Modal from "../../../components/ui/Modal.jsx";

function BatchDetailsModal({ batch, onClose }) {
  const productName = batch.product?.name ?? batch.productName ?? "—";
  const providerName = batch.provider?.name ?? batch.providerName ?? "—";

  return (
    <Modal
      className="batch-details-modal"
      description={`Información detallada del lote ${batch.code}.`}
      onClose={onClose}
      title={`Lote ${batch.code}`}
    >
      <div className="batch-details-content">
        <div className="batch-details-image">
          {batch.imageUrl ? (
            <a href={batch.imageUrl} rel="noreferrer" target="_blank">
              <img alt={`Imagen del lote ${batch.code}`} src={batch.imageUrl} />
              <span>Ver imagen en tamaño completo</span>
            </a>
          ) : (
            <p>Este lote no tiene una imagen registrada.</p>
          )}
        </div>

        <dl className="batch-details-grid">
          <div>
            <dt>Código</dt>
            <dd>{batch.code || "—"}</dd>
          </div>
          <div>
            <dt>Producto</dt>
            <dd>{productName}</dd>
          </div>
          <div>
            <dt>Proveedor</dt>
            <dd>{providerName}</dd>
          </div>
          <div>
            <dt>Cantidad</dt>
            <dd>{batch.quantityInitial ?? "—"}</dd>
          </div>
          <div>
            <dt>Cantidad disponible</dt>
            <dd>{batch.quantityAvailable ?? "—"}</dd>
          </div>
          <div>
            <dt>Fecha de ingreso</dt>
            <dd>{batch.entryDate?.slice(0, 10) ?? "—"}</dd>
          </div>
          <div>
            <dt>Fecha de vencimiento</dt>
            <dd>{batch.expirationDate?.slice(0, 10) ?? "—"}</dd>
          </div>
          <div>
            <dt>Temperatura</dt>
            <dd>
              {batch.temperature == null ? "—" : `${batch.temperature} °C`}
            </dd>
          </div>
          <div className="batch-details-observation">
            <dt>Observación</dt>
            <dd>{batch.observation || "Sin observaciones."}</dd>
          </div>
        </dl>
      </div>
    </Modal>
  );
}

export default BatchDetailsModal;
