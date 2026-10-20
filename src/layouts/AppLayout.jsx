import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

function AppLayout({ modules, activeModule, onModuleChange, children }) {
  const activeLabel = modules.find((module) => module.id === activeModule)?.label

  return (
    <div className="app-shell">
      <Sidebar
        modules={modules}
        activeModule={activeModule}
        onModuleChange={onModuleChange}
      />
      <div className="workspace">
        <Topbar currentSection={activeLabel} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  )
}

export default AppLayout
