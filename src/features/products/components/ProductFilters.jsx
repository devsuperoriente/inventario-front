function ProductFilters({ search, onSearchChange }) {
  return (
    <div className="inventory-filters">
      <label className="search-field">
        <span className="sr-only">Buscar producto por nombre, codigo, categoria o unidad</span>
        <span aria-hidden="true">Buscar</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Nombre, codigo, categoria o unidad"
        />
      </label>
    </div>
  )
}

export default ProductFilters
