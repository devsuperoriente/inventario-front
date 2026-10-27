function Sidebar({
  modules,
  activeModule,
  onModuleChange,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
}) {
  return (
    <aside
      className="sidebar"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <a
        className="brand"
        href="#inicio"
        onClick={(event) => {
          onModuleChange("dashboard", event.detail > 0);
          if (event.detail > 0) event.currentTarget.blur();
        }}
      >
        <span className="brand-mark" aria-hidden="true">
          P
        </span>
        <span className="brand-copy">
          <strong>SuperOriente</strong>
          <small>Inventario de planta</small>
        </span>
      </a>

      <p className="nav-heading">GESTION</p>
      <nav
        className="side-nav"
        id="primary-navigation"
        aria-label="Navegacion principal"
      >
        {modules.map((module) => (
          <button
            className={`nav-item${activeModule === module.id ? " active" : ""}`}
            key={module.id}
            type="button"
            onClick={(event) => {
              onModuleChange(module.id, event.detail > 0);
              if (event.detail > 0) event.currentTarget.blur();
            }}
            aria-current={activeModule === module.id ? "page" : undefined}
            aria-label={module.label}
            title={module.label}
          >
            <span className="nav-icon" aria-hidden="true">
              {module.icon}
            </span>
            <span className="nav-label">{module.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="status-dot" />
        <span className="sidebar-footer-label">Planta de produccion</span>
      </div>
    </aside>
  );
}

export default Sidebar;
