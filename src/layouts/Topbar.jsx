function Topbar({
  currentSection,
  user,
  onLogout,
  logoutError,
  isNavigationExpanded,
  onNavigationToggle,
}) {
  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-section">
        <button
          aria-controls="primary-navigation"
          aria-expanded={isNavigationExpanded}
          aria-label={
            isNavigationExpanded
              ? "Contraer menú de navegación"
              : "Expandir menú de navegación"
          }
          className="navigation-toggle"
          onClick={onNavigationToggle}
          title={
            isNavigationExpanded
              ? "Contraer menú de navegación"
              : "Expandir menú de navegación"
          }
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
        <span className="breadcrumb">PanControl /</span>
        <strong>{currentSection}</strong>
      </div>
      <div className="user-chip">
        <span className="user-avatar" aria-hidden="true">
          {initials}
        </span>
        <span>
          <strong>{user.name}</strong>
          <small>{user.role || user.email || "Usuario"}</small>
        </span>
        <button className="logout-button" type="button" onClick={onLogout}>
          Cerrar sesión
        </button>
        {logoutError && (
          <span className="login-error" role="alert">
            {logoutError}
          </span>
        )}
      </div>
    </header>
  );
}

export default Topbar;
