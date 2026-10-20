function ClientFilters({ search, onSearchChange }) {
  return (
    <div className="inventory-filters">
      <label className="search-field">
        <span className="sr-only">Buscar cliente por nombre, documento o contacto</span>
        <span aria-hidden="true">Buscar</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Nombre, documento o contacto"
        />
      </label>
    </div>
  )
}

export default ClientFilters
