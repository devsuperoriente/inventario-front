function Sidebar({ modules, activeModule, onModuleChange }) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#inicio" onClick={() => onModuleChange('dashboard')}>
        <span className="brand-mark" aria-hidden="true">P</span>
        <span>
          <strong>PanControl</strong>
          <small>Inventario de planta</small>
        </span>
      </a>

      <p className="nav-heading">GESTION</p>
      <nav className="side-nav" aria-label="Navegacion principal">
        {modules.map((module) => (
          <button
            className={`nav-item${activeModule === module.id ? ' active' : ''}`}
            key={module.id}
            type="button"
            onClick={() => onModuleChange(module.id)}
            aria-current={activeModule === module.id ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">{module.icon}</span>
            {module.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="status-dot" />
        <span>Planta de produccion</span>
      </div>
    </aside>
  )
}

export default Sidebar
