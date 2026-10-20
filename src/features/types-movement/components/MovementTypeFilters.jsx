function MovementTypeFilters({ search, onSearchChange }) {
  return (
    <div className="inventory-filters">
      <label className="search-field">
        <span className="sr-only">Buscar tipo de movimiento</span>
        <span aria-hidden="true">Buscar</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Nombre "
        />
      </label>
    </div>
  )
}

export default MovementTypeFilters
