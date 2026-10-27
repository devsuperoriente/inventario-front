function MeasurementUnitFilters({ search, onSearchChange }) {
  return (
    <div className="inventory-filters">
      <label className="search-field">
        <span className="sr-only">Buscar unidad de medida</span>
        <span aria-hidden="true">Buscar</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Nombre, simbolo o descripcion"
        />
      </label>
    </div>
  );
}

export default MeasurementUnitFilters;
