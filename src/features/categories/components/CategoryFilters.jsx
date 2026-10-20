function CategoryFilters({ search, onSearchChange }) {
  return (
    <div className="inventory-filters">
      <label className="search-field">
        <span className="sr-only">Buscar categoria por nombre o descripcion</span>
        <span aria-hidden="true">Buscar</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Nombre"
        />
      </label>
    </div>
  )
}

export default CategoryFilters
