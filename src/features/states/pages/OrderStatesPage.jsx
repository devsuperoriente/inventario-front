import { useCallback, useEffect, useMemo, useState } from 'react'
import EmptyState from '../../../components/feedback/EmptyState.jsx'
import Toast from '../../../components/feedback/Toast.jsx'
import PageHeading from '../../../components/ui/PageHeading.jsx'
import DeleteOrderStateModal from '../components/DeleteOrderStateModal.jsx'
import OrderStateFilters from '../components/OrderStateFilters.jsx'
import OrderStateForm from '../components/OrderStateForm.jsx'
import OrderStateTable from '../components/OrderStateTable.jsx'
import {
  createOrderState,
  deleteOrderState,
  getOrderStates,
  updateOrderState,
} from '../services/orderStatesApi.js'

function OrderStatesPage() {
  const [states, setStates] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingState, setEditingState] = useState(null)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [stateToDelete, setStateToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [toast, setToast] = useState(null)

  const dismissToast = useCallback(() => setToast(null), [])

  const fetchStates = useCallback(async () => {
    try {
      const data = await getOrderStates()
      setStates(data)
      setLoadError(null)
    } catch (err) {
      console.error('Error al cargar estados de orden:', err)
      setLoadError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isCurrent = true

    getOrderStates()
      .then((data) => {
        if (isCurrent) setStates(data)
      })
      .catch((err) => {
        console.error('Error al cargar estados de orden:', err)
        if (isCurrent) setLoadError(err.message)
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const filteredStates = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase()

    return states.filter((state) =>
      [state.name, state.description]
        .some((value) => String(value ?? '').toLocaleLowerCase().includes(normalizedSearch)),
    )
  }, [search, states])

  async function handleSaveState(formData) {
    setSaving(true)
    setFormError(null)
    setToast(null)

    try {
      const wasEditing = Boolean(editingState)
      if (editingState) {
        await updateOrderState(editingState.id, formData)
      } else {
        await createOrderState(formData)
      }

      setFormOpen(false)
      setEditingState(null)
      setLoading(true)
      await fetchStates()
      setToast({
        type: 'success',
        message: wasEditing ? 'Estado actualizado correctamente.' : 'Estado creado correctamente.',
      })
    } catch (err) {
      console.error('Error al guardar estado de orden:', err)
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function openCreateForm() {
    setEditingState(null)
    setFormError(null)
    setFormOpen(true)
  }

  function openEditForm(state) {
    setEditingState(state)
    setFormError(null)
    setFormOpen(true)
  }

  async function handleDeleteState() {
    if (!stateToDelete) return
    const state = stateToDelete

    setDeletingId(state.id)
    setDeleteError(null)
    setToast(null)

    try {
      await deleteOrderState(state.id)
      setStates((currentStates) =>
        currentStates.filter((currentState) => currentState.id !== state.id),
      )
      setStateToDelete(null)
      setToast({
        type: 'success',
        message: `Estado "${state.name}" eliminado correctamente.`,
      })
    } catch (err) {
      console.error('Error al eliminar estado de orden:', err)
      const message = `No se pudo eliminar el estado "${state.name}". ${err.message}`
      setDeleteError(message)
      setToast({
        type: 'warning',
        message: `${message} Puede estar asociado a ordenes de produccion.`,
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <PageHeading
        className="provider-page-heading"
        eyebrow="PRODUCCION"
        title="Estados de orden"
        description="Administra los estados disponibles para el seguimiento de las ordenes de produccion."
      />

      <section className="panel provider-panel">
        <div className="panel-heading provider-panel-heading">
          <div>
            <h2>Estados registrados</h2>
            <p>{filteredStates.length} de {states.length} estados</p>
          </div>
          <button className="btn-primary" onClick={openCreateForm} type="button">
            + Nuevo estado
          </button>
        </div>

        {loadError ? (
          <div className="feature-load-error" role="alert">
            <p>No se pudieron cargar los estados: {loadError}</p>
            <button
              className="btn-secondary"
              onClick={() => {
                setLoading(true)
                setLoadError(null)
                fetchStates()
              }}
              type="button"
            >
              Reintentar
            </button>
          </div>
        ) : loading ? (
          <p className="feature-loading" role="status">Cargando estados...</p>
        ) : states.length === 0 ? (
          <EmptyState
            title="Aun no hay estados configurados"
            description="Crea estados para representar las etapas de tus ordenes de produccion."
          />
        ) : (
          <>
            <OrderStateFilters search={search} onSearchChange={setSearch} />
            <OrderStateTable
              deletingId={deletingId}
              items={filteredStates}
              onDelete={(state) => {
                setStateToDelete(state)
                setDeleteError(null)
              }}
              onEdit={openEditForm}
            />
          </>
        )}
      </section>

      {formOpen && (
        <OrderStateForm
          key={editingState?.id ?? 'new-order-state'}
          error={formError}
          initialValues={editingState}
          onCancel={() => {
            setFormOpen(false)
            setEditingState(null)
            setFormError(null)
          }}
          onSubmit={handleSaveState}
          submitting={saving}
        />
      )}

      {stateToDelete && (
        <DeleteOrderStateModal
          error={deleteError}
          deleting={deletingId === stateToDelete.id}
          onCancel={() => {
            if (deletingId === null) {
              setStateToDelete(null)
              setDeleteError(null)
            }
          }}
          onConfirm={handleDeleteState}
          state={stateToDelete}
        />
      )}

      <Toast
        duration={4500}
        key={toast?.message ?? 'empty-order-state-toast'}
        message={toast?.message}
        onClose={dismissToast}
        type={toast?.type ?? 'success'}
      />
    </>
  )
}

export default OrderStatesPage
