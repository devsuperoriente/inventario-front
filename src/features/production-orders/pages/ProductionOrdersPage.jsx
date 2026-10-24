import { useEffect, useMemo, useState } from 'react'
import EmptyState from '../../../components/feedback/EmptyState.jsx'
import Toast from '../../../components/feedback/Toast.jsx'
import PageHeading from '../../../components/ui/PageHeading.jsx'
import { getOrderDetails } from '../../orders/services/orderDetailsApi.js'
import { getProducts } from '../../products/services/productsApi.js'
import { getOrderStates } from '../../states/services/orderStatesApi.js'
import ConsolidatedProductsTable from '../components/ConsolidatedProductsTable.jsx'
import ProductionOrderForm from '../components/ProductionOrderForm.jsx'
import ProductionOrdersFilters from '../components/ProductionOrdersFilters.jsx'
import ProductionOrdersList from '../components/ProductionOrdersList.jsx'
import RequiredMaterialsModal from '../components/RequiredMaterialsModal.jsx'
import {
  createProductionOrder,
  getOrdersByDate,
  getProductionOrders,
} from '../services/productionOrdersApi.js'
import {
  consolidateOrderDetails,
  getOrderDate,
} from '../utils/consolidateOrderDetails.js'

function getLocalDate() {
  const now = new Date()
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}

function ProductionOrdersPage() {
  const [date, setDate] = useState(getLocalDate)
  const [filteredDate, setFilteredDate] = useState('')
  const [products, setProducts] = useState([])
  const [states, setStates] = useState([])
  const [stateId, setStateId] = useState('')
  const [observation, setObservation] = useState('')
  const [items, setItems] = useState([])
  const [productionOrders, setProductionOrders] = useState([])
  const [locallyCreatedProductKeys, setLocallyCreatedProductKeys] = useState(() => new Set())
  const [referencesLoading, setReferencesLoading] = useState(true)
  const [referencesError, setReferencesError] = useState('')
  const [productionOrdersLoading, setProductionOrdersLoading] = useState(true)
  const [productionOrdersError, setProductionOrdersError] = useState('')
  const [filtering, setFiltering] = useState(false)
  const [filterError, setFilterError] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [toast, setToast] = useState(null)
  const [activeSection, setActiveSection] = useState('history')
  const [orderForMaterials, setOrderForMaterials] = useState(null)

  async function loadReferences() {
    setReferencesLoading(true)
    setReferencesError('')
    try {
      const [productList, stateList] = await Promise.all([getProducts(), getOrderStates()])
      setProducts(productList)
      setStates(stateList)
      setStateId((current) => current || String(stateList[0]?.id ?? ''))
    } catch (error) {
      console.error('Error al cargar productos y estados de producción:', error)
      setReferencesError(error.message)
    } finally {
      setReferencesLoading(false)
    }
  }

  async function loadProductionOrders() {
    setProductionOrdersLoading(true)
    setProductionOrdersError('')
    try {
      const orders = await getProductionOrders()
      if (!Array.isArray(orders)) {
        throw new Error('El endpoint de órdenes de producción debe responder con una lista.')
      }
      setProductionOrders(orders)
      return true
    } catch (error) {
      console.error('Error al cargar órdenes de producción:', error)
      setProductionOrdersError(error.message)
      return false
    } finally {
      setProductionOrdersLoading(false)
    }
  }

  async function handleConsumptionRegistered() {
    const ordersRefreshed = await loadProductionOrders()
    setOrderForMaterials(null)
    setToast({
      type: ordersRefreshed ? 'success' : 'error',
      message: ordersRefreshed
        ? 'Consumo de materia prima registrado y órdenes actualizadas.'
        : 'Consumo registrado, pero no se pudo actualizar la lista de órdenes. Intenta actualizarla.',
    })
  }

  useEffect(() => {
    let isCurrent = true
    Promise.all([getProducts(), getOrderStates()])
      .then(([productList, stateList]) => {
        if (!isCurrent) return
        setProducts(productList)
        setStates(stateList)
        setStateId((current) => current || String(stateList[0]?.id ?? ''))
      })
      .catch((error) => {
        console.error('Error al cargar productos y estados de producción:', error)
        if (isCurrent) setReferencesError(error.message)
      })
      .finally(() => {
        if (isCurrent) setReferencesLoading(false)
      })

    getProductionOrders()
      .then((orders) => {
        if (!Array.isArray(orders)) {
          throw new Error('El endpoint de órdenes de producción debe responder con una lista.')
        }
        if (isCurrent) setProductionOrders(orders)
      })
      .catch((error) => {
        console.error('Error al cargar órdenes de producción:', error)
        if (isCurrent) setProductionOrdersError(error.message)
      })
      .finally(() => {
        if (isCurrent) setProductionOrdersLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const createdProductIds = useMemo(
    () => {
      const ids = new Set(
        productionOrders
          .filter((order) => getOrderDate(order) === filteredDate)
          .map((order) => String(order.productId ?? order.product?.id)),
      )
      locallyCreatedProductKeys.forEach((key) => {
        const [createdDate, productId] = key.split(':')
        if (createdDate === filteredDate) ids.add(productId)
      })
      return ids
    },
    [filteredDate, locallyCreatedProductKeys, productionOrders],
  )
  const pendingItems = useMemo(
    () => items.filter((item) => !createdProductIds.has(String(item.productId))),
    [createdProductIds, items],
  )
  const invalidQuantities = pendingItems.some((item) => (
    !Number.isFinite(Number(item.quantity))
    || Number(item.quantity) <= 0
    || !/^\d+(\.\d{1,2})?$/.test(String(item.quantity))
  ))

  function handleQuantityChange(productId, value) {
    setItems((currentItems) => currentItems.map((item) => (
      String(item.productId) === String(productId)
        ? { ...item, quantity: value === '' ? '' : Number(value) }
        : item
    )))
  }

  async function handleFilter(event) {
    event.preventDefault()
    setFiltering(true)
    setFilterError('')
    setCreateError('')
    setToast(null)
    try {
      const orders = await getOrdersByDate(date)
      if (!Array.isArray(orders)) {
        throw new Error('El endpoint de pedidos por fecha debe responder con una lista.')
      }
      const details = orders.length > 0 ? await getOrderDetails() : []
      setItems(consolidateOrderDetails(orders, details, products))
      setFilteredDate(date)
    } catch (error) {
      console.error('Error al consolidar pedidos por fecha:', error)
      setFilterError(error.message)
      setItems([])
      setFilteredDate('')
    } finally {
      setFiltering(false)
    }
  }

  async function handleCreateProductionOrders() {
    if (
      !filteredDate
      || date !== filteredDate
      || pendingItems.length === 0
      || invalidQuantities
      || !stateId
    ) return

    setCreating(true)
    setCreateError('')
    setToast(null)
    let completed = 0

    try {
      for (const item of pendingItems) {
        // Tomamos el valor de quantity o quantitySheduled de forma segura
        const rawQuantity = item.quantity ?? item.quantitySheduled;
        const scheduledValue = Number(rawQuantity);

        await createProductionOrder({
          productId: Number(item.productId),
          stateId: Number(stateId),
          date: new Date(`${filteredDate}T00:00:00`).toISOString(),
          quantitySheduled: Number.isFinite(scheduledValue) ? scheduledValue : 0,
          observation: observation.trim() || null,
        })
        completed += 1
        setLocallyCreatedProductKeys((current) => {
          const next = new Set(current)
          next.add(`${filteredDate}:${item.productId}`)
          return next
        })
      }

      setToast({
        type: 'success',
        message: `Se crearon ${completed} orden${completed === 1 ? '' : 'es'} de producción.`,
      })
      await loadProductionOrders()
      setActiveSection('history')
    } catch (error) {
      console.error('Error al crear órdenes de producción:', error)
      setCreateError(
        completed > 0
          ? `Se crearon ${completed} orden${completed === 1 ? '' : 'es'}; el resto no se pudo crear. Actualiza el listado antes de reintentar. ${error.message}`
          : `No se pudieron crear las órdenes de producción. ${error.message}`,
      )
      if (completed > 0) await loadProductionOrders()
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <PageHeading
        className="provider-page-heading"
        eyebrow="PRODUCCIÓN"
        title="Órdenes de producción"
        description="Consulta las órdenes registradas o consolida pedidos para planificar nueva producción."
      />

      <nav aria-label="Secciones de órdenes de producción" className="production-orders-tabs">
        <button
          aria-pressed={activeSection === 'history'}
          className={`production-orders-tab${activeSection === 'history' ? ' is-active' : ''}`}
          id="production-orders-history-tab"
          onClick={() => setActiveSection('history')}
          type="button"
        >
          Historial
          <span className="production-orders-tab-count">{productionOrders.length}</span>
        </button>
        <button
          aria-pressed={activeSection === 'planning'}
          className={`production-orders-tab${activeSection === 'planning' ? ' is-active' : ''}`}
          id="production-orders-planning-tab"
          onClick={() => setActiveSection('planning')}
          type="button"
        >
          Crear órdenes
          {pendingItems.length > 0 && filteredDate && (
            <span className="production-orders-tab-count">{pendingItems.length}</span>
          )}
        </button>
      </nav>

      {activeSection === 'history' ? (
        <div
          aria-label="Historial de órdenes de producción"
          id="production-orders-history"
          role="region"
        >
          <ProductionOrdersList
            error={productionOrdersError}
            loading={productionOrdersLoading}
            onRetry={loadProductionOrders}
            onViewMaterials={setOrderForMaterials}
            orders={productionOrders}
          />
        </div>
      ) : (
        <section
          aria-label="Crear órdenes de producción"
          className="production-orders-planning"
          id="production-orders-planning"
          role="region"
        >
          {referencesError ? (
            <div className="feature-load-error" role="alert">
              <p>No se pudieron cargar productos y estados: {referencesError}</p>
              <button className="btn-secondary" onClick={loadReferences} type="button">
                Reintentar
              </button>
            </div>
          ) : referencesLoading ? (
            <p className="feature-loading" role="status">Cargando productos y estados...</p>
          ) : (
            <>
              <ProductionOrdersFilters
                date={date}
                disabled={creating}
                error={filterError}
                loading={filtering}
                onDateChange={setDate}
                onSubmit={handleFilter}
              />

              {filteredDate && !filtering && !filterError && (
                <section className="panel provider-panel production-orders-panel">
                  <div className="panel-heading provider-panel-heading">
                    <div>
                      <h2>Consolidado del {filteredDate}</h2>
                      <p>
                        {pendingItems.length} de {items.length} producto{items.length === 1 ? '' : 's'} pendiente{items.length === 1 ? '' : 's'} por programar
                      </p>
                    </div>
                  </div>
                  {items.length === 0 ? (
                    <EmptyState
                      title="No hay productos para producir"
                      description="No se encontraron detalles de pedidos para la fecha seleccionada."
                    />
                  ) : (
                    <>
                      <ConsolidatedProductsTable
                        createdProductIds={createdProductIds}
                        creating={creating}
                        items={items}
                        onQuantityChange={handleQuantityChange}
                      />
                      <ProductionOrderForm
                        createError={createError}
                        creating={creating}
                        dateChanged={date !== filteredDate}
                        invalidQuantities={invalidQuantities}
                        observation={observation}
                        onCreate={handleCreateProductionOrders}
                        onObservationChange={setObservation}
                        onStateChange={setStateId}
                        pendingCount={pendingItems.length}
                        stateId={stateId}
                        states={states}
                      />
                    </>
                  )}
                </section>
              )}
            </>
          )}
        </section>
      )}

      {orderForMaterials && (
        <RequiredMaterialsModal
          onClose={() => setOrderForMaterials(null)}
          onConsumptionRegistered={handleConsumptionRegistered}
          order={orderForMaterials}
        />
      )}

      <Toast
        duration={4500}
        key={toast?.message ?? 'empty-production-toast'}
        message={toast?.message}
        onClose={() => setToast(null)}
        type={toast?.type ?? 'success'}
      />
    </>
  )
}

export default ProductionOrdersPage
