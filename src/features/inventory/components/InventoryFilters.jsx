function InventoryFilters({ search, onSearchChange, status, onStatusChange }) {
  return (
    <div className="inventory-filters">
      <label className="search-field">
        <span className="sr-only">Buscar insumo, lote o proveedor</span>
        <span aria-hidden="true">Buscar</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Insumo, lote o proveedor"
        />
      </label>
      <label className="filter-field">
        <span className="sr-only">Filtrar por estado</span>
        <select value={status} onChange={(event) => onStatusChange(event.target.value)}>
          <option value="all">Todos los estados</option>
          <option value="available">Disponible</option>
          <option value="low">Stock bajo</option>
          <option value="expiring">Por vencer</option>
        </select>
      </label>
    </div>
  )
}

export default InventoryFilters
