function ProductionOrdersFilters({
  date,
  onDateChange,
  onSubmit,
  loading,
  disabled,
  error,
}) {
  return (
    <section className="panel provider-panel production-orders-panel">
      <form className="entity-form" onSubmit={onSubmit}>
        <div className="entity-form-grid">
          <label className="entity-form-field">
            <span>Fecha de pedidos</span>
            <input
              disabled={disabled}
              onChange={(event) => onDateChange(event.target.value)}
              required
              type="date"
              value={date}
            />
          </label>
        </div>
        <div className="entity-form-actions">
          <button
            className="btn-primary"
            disabled={loading || disabled}
            type="submit"
          >
            {loading ? "Consultando..." : "Consolidar pedidos"}
          </button>
        </div>
      </form>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

export default ProductionOrdersFilters;
