function ProductionOrderForm({
  states,
  stateId,
  onStateChange,
  observation,
  onObservationChange,
  creating,
  dateChanged,
  invalidQuantities,
  createError,
  pendingCount,
  onCreate,
}) {
  return (
    <div className="entity-form production-order-controls">
      <div className="entity-form-grid">
        <label className="entity-form-field">
          <span>Estado inicial</span>
          <select
            disabled={creating}
            onChange={(event) => onStateChange(event.target.value)}
            required
            value={stateId}
          >
            <option value="">Selecciona un estado</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
        </label>
        <label className="entity-form-field">
          <span>Observación (opcional)</span>
          <input
            disabled={creating}
            maxLength={255}
            onChange={(event) => onObservationChange(event.target.value)}
            value={observation}
          />
        </label>
      </div>
      {invalidQuantities && (
        <p className="form-error" role="alert">
          Cada cantidad debe ser mayor que cero y tener máximo dos decimales.
        </p>
      )}
      {dateChanged && (
        <p className="form-error" role="status">
          La fecha cambió. Consolida los pedidos nuevamente antes de crear
          órdenes.
        </p>
      )}
      {createError && (
        <p className="form-error" role="alert">
          {createError}
        </p>
      )}
      <div className="entity-form-actions">
        <button
          className="btn-primary"
          disabled={
            creating ||
            dateChanged ||
            pendingCount === 0 ||
            invalidQuantities ||
            !stateId
          }
          onClick={onCreate}
          type="button"
        >
          {creating
            ? "Creando órdenes..."
            : pendingCount === 0
              ? "Órdenes creadas"
              : `Crear ${pendingCount} orden${pendingCount === 1 ? "" : "es"} de producción`}
        </button>
      </div>
    </div>
  );
}

export default ProductionOrderForm;
