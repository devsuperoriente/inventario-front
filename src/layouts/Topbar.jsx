function Topbar({ currentSection }) {
  return (
    <header className="topbar">
      <div>
        <span className="breadcrumb">PanControl /</span>
        <strong>{currentSection}</strong>
      </div>
      <div className="user-chip">
        <span className="user-avatar" aria-hidden="true">OP</span>
        <span>
          <strong>Operador</strong>
          <small>Planta principal</small>
        </span>
      </div>
    </header>
  )
}

export default Topbar
