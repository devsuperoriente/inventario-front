function OrderStateFilters({ search, onSearchChange }) {
  return (
    <div className="inventory-filters">
      <label className="search-field">
        <span className="sr-only">Buscar estado de orden de produccion</span>
        <span aria-hidden="true">Buscar</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Nombre"
        />
      </label>
    </div>
  );
}

export default OrderStateFilters;
