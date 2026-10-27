import { useEffect, useState } from "react";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

function AppLayout({
  modules,
  activeModule,
  onModuleChange,
  user,
  onLogout,
  logoutError,
  children,
}) {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isSidebarPreviewOpen, setIsSidebarPreviewOpen] = useState(false);
  const [isCompactViewport, setIsCompactViewport] = useState(
    () => window.matchMedia("(max-width: 1000px)").matches,
  );
  const activeLabel = modules.find(
    (module) => module.id === activeModule,
  )?.label;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1000px)");

    function handleViewportChange(event) {
      setIsCompactViewport(event.matches);
      if (!event.matches) setIsNavigationOpen(false);
      setIsSidebarPreviewOpen(false);
    }

    mediaQuery.addEventListener("change", handleViewportChange);
    return () => mediaQuery.removeEventListener("change", handleViewportChange);
  }, []);

  useEffect(() => {
    if (!isNavigationOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") setIsNavigationOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isNavigationOpen]);

  function handleModuleChange(moduleId, wasPointerActivation = false) {
    onModuleChange(moduleId);
    setIsNavigationOpen(false);
    if (wasPointerActivation && !isCompactViewport) {
      setIsSidebarPreviewOpen(false);
    }
  }

  function handleSidebarFocus(event) {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setIsSidebarPreviewOpen(true);
  }

  function handleSidebarBlur(event) {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setIsSidebarPreviewOpen(false);
  }

  function handleNavigationToggle() {
    if (window.matchMedia("(max-width: 1000px)").matches) {
      setIsNavigationOpen((isOpen) => !isOpen);
      return;
    }

    setIsSidebarCollapsed((isCollapsed) => !isCollapsed);
  }

  return (
    <div
      className={[
        "app-shell",
        isNavigationOpen ? "navigation-open" : "",
        isSidebarCollapsed ? "sidebar-collapsed" : "",
        isSidebarCollapsed && isSidebarPreviewOpen
          ? "sidebar-preview-open"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Sidebar
        modules={modules}
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
        onPointerEnter={(event) => {
          if (
            event.pointerType === "mouse" &&
            isSidebarCollapsed &&
            !isCompactViewport
          ) {
            setIsSidebarPreviewOpen(true);
          }
        }}
        onPointerLeave={() => setIsSidebarPreviewOpen(false)}
        onFocus={handleSidebarFocus}
        onBlur={handleSidebarBlur}
      />
      {isNavigationOpen && (
        <button
          aria-label="Cerrar menú de navegación"
          className="navigation-backdrop"
          onClick={() => setIsNavigationOpen(false)}
          type="button"
        />
      )}
      <div className="workspace">
        <Topbar
          currentSection={activeLabel}
          user={user}
          onLogout={onLogout}
          logoutError={logoutError}
          isNavigationExpanded={
            isCompactViewport ? isNavigationOpen : !isSidebarCollapsed
          }
          onNavigationToggle={handleNavigationToggle}
        />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}

export default AppLayout;
