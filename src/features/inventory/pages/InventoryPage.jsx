import { useEffect, useMemo, useState } from 'react'
import EmptyState from '../../../components/feedback/EmptyState.jsx'
import PageHeading from '../../../components/ui/PageHeading.jsx'
import { getBatches } from '../../batches/services/batchesApi.js'
import InventoryBalancesTable from '../components/InventoryBalancesTable.jsx'
import InventoryMovementsTable from '../components/InventoryMovementsTable.jsx'
import InventorySectionTabs from '../components/InventorySectionTabs.jsx'
import { getInventoryMovements } from '../services/inventoryMovementsApi.js'
import { groupBatchesByProduct } from '../utils/inventoryStock.js'
import {
  getMovementBatch,
  getMovementDate,
} from '../utils/inventorySelectors.js'

function InventoryPage() {
  const [activeTab, setActiveTab] = useState('stock')
  const [batches, setBatches] = useState([])
  const [movements, setMovements] = useState([])
  const [stockSearch, setStockSearch] = useState('')
  const [movementSearch, setMovementSearch] = useState('')
  const [movementDate, setMovementDate] = useState('')
  const [batchesLoading, setBatchesLoading] = useState(true)
  const [movementsLoading, setMovementsLoading] = useState(true)
  const [batchesError, setBatchesError] = useState('')
  const [movementsError, setMovementsError] = useState('')

  async function refreshBatches() {
    setBatchesLoading(true)
    setBatchesError('')
    try {
      const result = await getBatches()
      if (!Array.isArray(result)) {
        throw new Error('El endpoint de lotes debe responder con una lista.')
      }
      setBatches(result)
    } catch (error) {
      console.error('Error al cargar existencias por lote:', error)
      setBatchesError(error.message)
    } finally {
      setBatchesLoading(false)
    }
  }

  async function refreshMovements() {
    setMovementsLoading(true)
    setMovementsError('')
    try {
      const result = await getInventoryMovements()
      if (!Array.isArray(result)) {
        throw new Error('El endpoint de movimientos debe responder con una lista.')
      }
      setMovements(result)
    } catch (error) {
      console.error('Error al cargar movimientos de inventario:', error)
      setMovementsError(error.message)
    } finally {
      setMovementsLoading(false)
    }
  }

  useEffect(() => {
    let isCurrent = true
    getBatches()
      .then((result) => {
        if (!Array.isArray(result)) {
          throw new Error('El endpoint de lotes debe responder con una lista.')
        }
        if (isCurrent) setBatches(result)
      })
      .catch((error) => {
        console.error('Error al cargar existencias por lote:', error)
        if (isCurrent) setBatchesError(error.message)
      })
      .finally(() => {
        if (isCurrent) setBatchesLoading(false)
      })

    getInventoryMovements()
      .then((result) => {
        if (!Array.isArray(result)) {
          throw new Error('El endpoint de movimientos debe responder con una lista.')
        }
        if (isCurrent) setMovements(result)
      })
      .catch((error) => {
        console.error('Error al cargar movimientos de inventario:', error)
        if (isCurrent) setMovementsError(error.message)
      })
      .finally(() => {
        if (isCurrent) setMovementsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const batchesById = useMemo(
    () => new Map(batches.map((batch) => [String(batch.id), batch])),
    [batches],
  )

  const allInventoryProducts = useMemo(() => groupBatchesByProduct(batches), [batches])

  const inventoryProducts = useMemo(() => {
    const query = stockSearch.trim().toLocaleLowerCase()
    return allInventoryProducts
      .filter((product) => [
        product.name,
        ...product.batches.flatMap((batch) => [
          batch.code,
          batch.provider?.name,
          batch.providerName,
        ]),
      ].some((value) => String(value ?? '').toLocaleLowerCase().includes(query)))
      .sort((first, second) => first.name.localeCompare(second.name))
  }, [allInventoryProducts, stockSearch])

  const filteredMovements = useMemo(() => {
    const query = movementSearch.trim().toLocaleLowerCase()
    return [...movements]
      .filter((movement) => (!movementDate || getMovementDate(movement) === movementDate))
      .filter((movement) => {
        const batch = getMovementBatch(movement, batchesById)
        const values = [
          movement.typeMovement?.name,
          movement.typeMovementName,
          movement.observation,
          movement.ordersProduction?.numberOrder,
          movement.orderProduction?.numberOrder,
          batch?.code,
          batch?.product?.name,
          batch?.productName,
          movement.quantity,
          movement.balancePrevius,
          movement.balanceCurrent,
        ]
        return values.some((value) => String(value ?? '').toLocaleLowerCase().includes(query))
      })
      .sort((first, second) => String(second.date ?? '').localeCompare(String(first.date ?? '')))
  }, [batchesById, movementDate, movementSearch, movements])

  const productCount = allInventoryProducts.length

  return (
    <>
      <PageHeading
        className="provider-page-heading"
        eyebrow="INVENTARIO"
        title="Inventario y movimientos"
        description="Consulta el disponible agrupado por producto, revisa sus lotes y explora los movimientos."
      />

      <div className="inventory-summary-grid">
        <article className="inventory-summary-card">
          <span>Productos con lotes</span>
          <strong>{productCount}</strong>
        </article>
        <article className="inventory-summary-card">
          <span>Lotes registrados</span>
          <strong>{batches.length}</strong>
        </article>
        <article className="inventory-summary-card">
          <span>Movimientos registrados</span>
          <strong>{movements.length}</strong>
        </article>
      </div>

      <InventorySectionTabs
        activeTab={activeTab}
        counts={{ products: productCount, movements: movements.length }}
        onTabChange={setActiveTab}
      />

      {activeTab === 'stock' ? (
        <section className="panel inventory-panel">
          <div className="panel-heading inventory-ledger-heading">
            <div>
              <h2>Existencias por producto</h2>
              <p>{inventoryProducts.length} de {productCount} productos</p>
            </div>
            <button
              className="btn-secondary"
              disabled={batchesLoading}
              onClick={refreshBatches}
              type="button"
            >
              {batchesLoading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
          {batchesError ? (
            <div className="feature-load-error" role="alert">
              <p>No se pudieron cargar las existencias: {batchesError}</p>
              <button className="btn-secondary" onClick={refreshBatches} type="button">
                Reintentar
              </button>
            </div>
          ) : batchesLoading ? (
            <p className="feature-loading" role="status">Cargando existencias...</p>
          ) : batches.length === 0 ? (
            <EmptyState
              title="Aún no hay lotes en inventario"
              description="Las existencias aparecerán cuando se registren lotes."
            />
          ) : (
            <>
              <div className="inventory-filters inventory-ledger-filters">
                <label className="search-field">
                  <span className="sr-only">Buscar existencias</span>
                  <span aria-hidden="true">Buscar</span>
                  <input
                    onChange={(event) => setStockSearch(event.target.value)}
                    placeholder="Producto, lote o proveedor"
                    type="search"
                    value={stockSearch}
                  />
                </label>
              </div>
              <InventoryBalancesTable products={inventoryProducts} />
            </>
          )}
        </section>
      ) : (
        <section className="panel inventory-panel">
          <div className="panel-heading inventory-ledger-heading">
            <div>
              <h2>Historial de movimientos</h2>
              <p>{filteredMovements.length} de {movements.length} movimientos</p>
            </div>
            <button
              className="btn-secondary"
              disabled={movementsLoading}
              onClick={refreshMovements}
              type="button"
            >
              {movementsLoading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
          {movementsError ? (
            <div className="feature-load-error" role="alert">
              <p>No se pudieron cargar los movimientos: {movementsError}</p>
              <button className="btn-secondary" onClick={refreshMovements} type="button">
                Reintentar
              </button>
            </div>
          ) : movementsLoading ? (
            <p className="feature-loading" role="status">Cargando movimientos...</p>
          ) : movements.length === 0 ? (
            <EmptyState
              title="Aún no hay movimientos registrados"
              description="Los movimientos registrados por el backend aparecerán aquí."
            />
          ) : (
            <>
              <div className="inventory-filters inventory-ledger-filters">
                <label className="search-field">
                  <span className="sr-only">Buscar movimientos</span>
                  <span aria-hidden="true">Buscar</span>
                  <input
                    onChange={(event) => setMovementSearch(event.target.value)}
                    placeholder="Producto, lote, tipo u observación"
                    type="search"
                    value={movementSearch}
                  />
                </label>
                <label className="filter-field">
                  <span className="sr-only">Filtrar movimientos por fecha</span>
                  <input
                    aria-label="Filtrar movimientos por fecha"
                    onChange={(event) => setMovementDate(event.target.value)}
                    type="date"
                    value={movementDate}
                  />
                </label>
              </div>
              <InventoryMovementsTable
                batchesById={batchesById}
                movements={filteredMovements}
              />
            </>
          )}
        </section>
      )}
    </>
  )
}

export default InventoryPage
