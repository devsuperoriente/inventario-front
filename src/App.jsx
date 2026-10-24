import { useState } from 'react'
import AppLayout from './layouts/AppLayout.jsx'
import LoginPage from './auth/LoginPage.jsx'
import { useAuth } from './auth/useAuth.js'
import DashboardPage from './features/dashboard/pages/DashboardPage.jsx'
import InventoryPage from './features/inventory/pages/InventoryPage.jsx'
import ModulePlaceholderPage from './features/shared/ModulePlaceholderPage.jsx'
import ProviderPage from './features/providers/pages/ProviderPage.jsx'
import ClientPage from './features/clients/pages/ClientPage.jsx'
import OrderStatesPage from './features/states/pages/OrderStatesPage.jsx'
import MeasurementUnitsPage from './features/measurement-units/pages/MeasurementUnitsPage.jsx'
import MovementTypesPage from './features/types-movement/pages/MovementTypesPage.jsx'
import OrdersPage from './features/orders/pages/OrdersPage.jsx'
import CategoriesPage from './features/categories/pages/CategoriesPage.jsx'
import ProductsPage from './features/products/pages/ProductsPage.jsx'
import BatchesPage from './features/batches/pages/BatchesPage.jsx'
import RecipesPage from './features/recipes/pages/RecipesPage.jsx'
import ProductionOrdersPage from './features/production-orders/pages/ProductionOrdersPage.jsx'

const modules = [
  //{ id: 'dashboard', label: 'Resumen', icon: 'R' },
  { id: 'inventory', label: 'Inventario', icon: 'I' },
  { id: 'dispatch', label: 'Despachos', icon: 'D' },
  { id: 'products', label: 'Productos', icon: 'P' },
  { id: 'batches', label: 'Lotes', icon: 'L' },
  { id: 'providers', label: 'Proveedores', icon: 'P' },
  { id: 'clients', label: 'Clientes', icon: 'C' },
  { id: 'orders', label: 'Pedidos de clientes', icon: 'P' },
  { id: 'recipes', label: 'Recetas', icon: 'F' },
  { id: 'production-orders', label: 'Ordenes de produccion', icon: 'O' },
  { id: 'order-states', label: 'Estados de orden', icon: 'E' },
  { id: 'measurement-units', label: 'Unidades de medida', icon: 'U' },
  { id: 'types-movement', label: 'Tipos de movimiento', icon: 'M' },
  { id: 'categories', label: 'Categorias', icon: 'C' },

]

const moduleDescriptions = {
  //providers: 'Administra los proveedores de materias primas y sus datos de contacto.',
  inventory: 'Consulta las existencias actuales por lote y el historial de movimientos de inventario.',
  clients: 'Administra los clientes y sus datos de contacto.',
  dispatch: 'Confirma el consumo de insumos y los lotes utilizados en cada orden.',
  products: 'Administra productos relacionados con una categoria y una unidad de medida.',
  batches: 'Registra y consulta lotes asociados a productos y proveedores.',
  orders: 'Registra pedidos por número y fecha, y agrega en cada uno sus productos y cantidades.',
  'order-states': 'Configura los estados disponibles para las ordenes de produccion.',
  'measurement-units': 'Administra las unidades usadas para registrar cantidades de insumos.',
  'types-movement': 'Configura los tipos de movimiento para entradas, salidas y ajustes de inventario.',
  recipes: 'Consulta las recetas y las cantidades de insumos necesarias para producir.',
  'production-orders': 'Revisa las ordenes, calcula insumos y registra su consumo durante la dosificacion.',
  categories: 'Organiza las materias primas por categoria.',
}

function App() {
  const {
    user,
    logout,
    canAccessFeature,
    isLoading,
    authError,
  } = useAuth()
  const [activeModule, setActiveModule] = useState('dashboard')
  const [logoutError, setLogoutError] = useState('')
  const availableModules = modules.filter((module) => canAccessFeature(module.id))

  async function handleLogout() {
    setLogoutError('')
    try {
      await logout()
    } catch (error) {
      setLogoutError(error.message || 'No fue posible cerrar la sesión.')
    }
  }

  if (isLoading) {
    return <main className="auth-loading" role="status">Verificando sesión...</main>
  }

  if (!user) return <LoginPage connectionError={authError} />

  if (availableModules.length === 0) {
    return (
      <div className="no-feature-access">
        <div>
          <p className="eyebrow">ACCESO RESTRINGIDO</p>
          <h1>No tienes funcionalidades asignadas</h1>
          <p>Solicita al administrador que asigne permisos a tu usuario.</p>
          {logoutError && <p className="login-error" role="alert">{logoutError}</p>}
          <button className="btn-secondary" type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    )
  }

  const visibleModule = availableModules.find((module) => module.id === activeModule)
  const selectedModule = visibleModule ?? availableModules[0]

  function renderPage() {
    //if (selectedModule.id === 'dashboard') return <DashboardPage />
    if (selectedModule.id === 'inventory') return <InventoryPage />
    if (selectedModule.id === 'types-movement') return <MovementTypesPage />
    if (selectedModule.id === 'products') return <ProductsPage />
    if (selectedModule.id === 'batches') return <BatchesPage />
    if (selectedModule.id === 'recipes') return <RecipesPage />
    if (selectedModule.id === 'providers') return <ProviderPage />
    if (selectedModule.id === 'clients') return <ClientPage />
    if (selectedModule.id === 'orders') return <OrdersPage />
    if (selectedModule.id === 'production-orders') return <ProductionOrdersPage />
    if (selectedModule.id === 'order-states') return <OrderStatesPage />
    if (selectedModule.id === 'measurement-units') return <MeasurementUnitsPage />
    if (selectedModule.id === 'categories') return <CategoriesPage />

    return (
      <ModulePlaceholderPage
        title={selectedModule.label}
        description={moduleDescriptions[selectedModule.id]}
      />
    )
  }

  return (
    <AppLayout
      modules={availableModules}
      activeModule={selectedModule.id}
      onModuleChange={setActiveModule}
      user={user}
      onLogout={handleLogout}
      logoutError={logoutError}
    >
      {renderPage()}
    </AppLayout>
  )
}

export default App
