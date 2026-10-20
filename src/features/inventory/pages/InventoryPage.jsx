import { useMemo, useState } from 'react'
import PageHeading from '../../../components/ui/PageHeading.jsx'
import InventoryFilters from '../components/InventoryFilters.jsx'
import InventoryTable from '../components/InventoryTable.jsx'
import { inventoryItems } from '../data/inventoryItems.js'

function InventoryPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase()

    return inventoryItems.filter((item) => {
      const matchesSearch = [
        item.name,
        item.lot,
        item.supplier,
        item.location,
      ].some((value) => value.toLocaleLowerCase().includes(normalizedSearch))

      return matchesSearch && (status === 'all' || item.status === status)
    })
  }, [search, status])

  return (
    <>
      <PageHeading
        eyebrow="MATERIAS PRIMAS"
        title="Inventario"
        description="Controla existencias, lotes, condiciones y fechas de vencimiento."
      />
      <section className="panel inventory-panel">
        <div className="panel-heading">
          <div>
            <h2>Insumos registrados</h2>
            <p>{filteredItems.length} de {inventoryItems.length} materias primas</p>
          </div>
          <span className="panel-count">Datos de ejemplo</span>
        </div>
        <InventoryFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
        />
        <InventoryTable items={filteredItems} />
      </section>
    </>
  )
}

export default InventoryPage
