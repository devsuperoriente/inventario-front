function InventorySectionTabs({ activeTab, counts, onTabChange }) {
  return (
    <nav
      aria-label="Secciones de inventario"
      className="inventory-section-tabs"
    >
      <button
        aria-pressed={activeTab === "stock"}
        className={`inventory-section-tab${activeTab === "stock" ? " is-active" : ""}`}
        onClick={() => onTabChange("stock")}
        type="button"
      >
        Existencias
        <span className="inventory-section-tab-count">{counts.products}</span>
      </button>
      <button
        aria-pressed={activeTab === "movements"}
        className={`inventory-section-tab${activeTab === "movements" ? " is-active" : ""}`}
        onClick={() => onTabChange("movements")}
        type="button"
      >
        Movimientos
        <span className="inventory-section-tab-count">{counts.movements}</span>
      </button>
    </nav>
  );
}

export default InventorySectionTabs;
