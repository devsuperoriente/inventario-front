import { useState } from 'react'
import AppLayout from './layouts/AppLayout.jsx'
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

const modules = [
  { id: 'dashboard', label: 'Resumen', icon: 'R' },
  { id: 'inventory', label: 'Inventario', icon: 'I' },
  { id: 'categories', label: 'Categorias', icon: 'C' },
  { id: 'products', label: 'Productos', icon: 'P' },
  { id: 'providers', label: 'Proveedores', icon: 'P' },
  { id: 'clients', label: 'Clientes', icon: 'C' },
  { id: 'orders', label: 'Pedidos de clientes', icon: 'P' },
  { id: 'recipes', label: 'Recetas', icon: 'F' },
  { id: 'production-orders', label: 'Ordenes de produccion', icon: 'O' },
  { id: 'order-states', label: 'Estados de orden', icon: 'E' },
  { id: 'measurement-units', label: 'Unidades de medida', icon: 'U' },
  { id: 'types-movement', label: 'Tipos de movimiento', icon: 'M' },
  { id: 'dispatch', label: 'Despachos', icon: 'D' },
]

const moduleDescriptions = {
  providers: 'Administra los proveedores de materias primas y sus datos de contacto.',
  clients: 'Administra los clientes y sus datos de contacto.',
  categories: 'Organiza las materias primas por categoria.',
  products: 'Administra productos relacionados con una categoria y una unidad de medida.',
  orders: 'Registra pedidos por número y fecha, y agrega en cada uno sus productos y cantidades.',
  'order-states': 'Configura los estados disponibles para las ordenes de produccion.',
  'measurement-units': 'Administra las unidades usadas para registrar cantidades de insumos.',
  'types-movement': 'Configura los tipos de movimiento para entradas, salidas y ajustes de inventario.',
  recipes: 'Consulta las recetas y las cantidades de insumos necesarias para producir.',
  'production-orders': 'Revisa las ordenes de produccion y calcula los insumos requeridos.',
  dispatch: 'Confirma el consumo de insumos y los lotes utilizados en cada orden.',
}

function App() {
  const [activeModule, setActiveModule] = useState('dashboard')

  function renderPage() {
    if (activeModule === 'dashboard') return <DashboardPage />
    if (activeModule === 'inventory') return <InventoryPage />
    if (activeModule === 'categories') return <CategoriesPage />
    if (activeModule === 'products') return <ProductsPage />
    if (activeModule === 'providers') return <ProviderPage />
    if (activeModule === 'clients') return <ClientPage />
    if (activeModule === 'orders') return <OrdersPage />
    if (activeModule === 'order-states') return <OrderStatesPage />
    if (activeModule === 'measurement-units') return <MeasurementUnitsPage />
    if (activeModule === 'types-movement') return <MovementTypesPage />

    const currentModule = modules.find((module) => module.id === activeModule)

    return (
      <ModulePlaceholderPage
        title={currentModule.label}
        description={moduleDescriptions[activeModule]}
      />
    )
  }

  return (
    <AppLayout
      modules={modules}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
    >
      {renderPage()}
    </AppLayout>
  )
}

export default App
