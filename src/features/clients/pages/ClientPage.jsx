import { useCallback, useEffect, useMemo, useState } from 'react'
import EmptyState from '../../../components/feedback/EmptyState.jsx'
import Toast from '../../../components/feedback/Toast.jsx'
import PageHeading from '../../../components/ui/PageHeading.jsx'
import ClientFilters from '../components/ClientFilters.jsx'
import ClientForm from '../components/ClientForm.jsx'
import ClientTable from '../components/ClientTable.jsx'
import DeleteClientModal from '../components/DeleteClientModal.jsx'
import {
  createClient,
  deleteClient,
  getClients,
  updateClient,
} from '../services/clientsApi.js'

function ClientPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [clientToDelete, setClientToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [toast, setToast] = useState(null)

  const dismissToast = useCallback(() => setToast(null), [])

  const fetchClients = useCallback(async () => {
    try {
      const data = await getClients()
      setClients(data)
      setError(null)
    } catch (err) {
      console.error('Error al cargar clientes:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isCurrent = true

    getClients()
      .then((data) => {
        if (isCurrent) setClients(data)
      })
      .catch((err) => {
        console.error('Error al cargar clientes:', err)
        if (isCurrent) setError(err.message)
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const filteredClients = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase()

    return clients.filter((client) =>
      [client.name, client.nit, client.email, client.phone]
        .some((value) => String(value ?? '').toLocaleLowerCase().includes(normalizedSearch)),
    )
  }, [clients, search])

  async function handleSaveClient(formData) {
    setSaving(true)
    setFormError(null)
    setToast(null)

    try {
      const wasEditing = Boolean(editingClient)
      if (editingClient) {
        await updateClient(editingClient.id, formData)
      } else {
        await createClient(formData)
      }
      setFormOpen(false)
      setEditingClient(null)
      setLoading(true)
      await fetchClients()
      setToast({
        type: 'success',
        message: wasEditing ? 'Cliente actualizado correctamente.' : 'Cliente creado correctamente.',
      })
    } catch (err) {
      console.error('Error al guardar cliente:', err)
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function openCreateForm() {
    setEditingClient(null)
    setFormError(null)
    setFormOpen(true)
  }

  function openEditForm(client) {
    setEditingClient(client)
    setFormError(null)
    setFormOpen(true)
  }

  async function handleDeleteClient() {
    if (!clientToDelete) return
    const client = clientToDelete

    setDeletingId(client.id)
    setDeleteError(null)
    setToast(null)

    try {
      await deleteClient(client.id)
      setClients((currentClients) =>
        currentClients.filter((currentClient) => currentClient.id !== client.id),
      )
      setClientToDelete(null)
      setToast({
        type: 'success',
        message: `Cliente "${client.name}" eliminado correctamente.`,
      })
    } catch (err) {
      console.error('Error al eliminar cliente:', err)
      const message = `No se pudo eliminar a "${client.name}". ${err.message}`
      setDeleteError(message)
      setToast({
        type: 'warning',
        message: `${message} Verifica si esta asociado a otros registros e intentalo de nuevo.`,
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <PageHeading
        className="provider-page-heading"
        eyebrow="GESTION"
        title="Clientes"
        description="Administra la informacion de tus clientes y contactos."
      />

      <section className="panel provider-panel">
        <div className="panel-heading provider-panel-heading">
          <div>
            <h2>Clientes registrados</h2>
            <p>{filteredClients.length} de {clients.length} clientes</p>
          </div>
          <button className="btn-primary" onClick={openCreateForm} type="button">
            + Nuevo cliente
          </button>
        </div>

        {error ? (
          <div className="feature-load-error" role="alert">
            <p>No se pudieron cargar los clientes: {error}</p>
            <button
              className="btn-secondary"
              onClick={() => {
                setLoading(true)
                setError(null)
                fetchClients()
              }}
              type="button"
            >
              Reintentar
            </button>
          </div>
        ) : loading ? (
          <p className="feature-loading" role="status">Cargando clientes...</p>
        ) : clients.length === 0 ? (
          <EmptyState
            title="Aun no hay clientes"
            description="Agrega el primer cliente para empezar a gestionar sus datos."
          />
        ) : (
          <>
            <ClientFilters search={search} onSearchChange={setSearch} />
            <ClientTable
              deletingId={deletingId}
              items={filteredClients}
              onDelete={(client) => {
                setClientToDelete(client)
                setDeleteError(null)
              }}
              onEdit={openEditForm}
            />
          </>
        )}
      </section>

      {formOpen && (
        <ClientForm
          key={editingClient?.id ?? 'new-client'}
          error={formError}
          initialValues={editingClient}
          onCancel={() => {
            setFormOpen(false)
            setEditingClient(null)
            setFormError(null)
          }}
          onSubmit={handleSaveClient}
          submitting={saving}
        />
      )}

      {clientToDelete && (
        <DeleteClientModal
          client={clientToDelete}
          deleting={deletingId === clientToDelete.id}
          error={deleteError}
          onCancel={() => {
            if (deletingId === null) {
              setClientToDelete(null)
              setDeleteError(null)
            }
          }}
          onConfirm={handleDeleteClient}
        />
      )}

      <Toast
        duration={4500}
        key={toast?.message ?? 'empty-client-toast'}
        message={toast?.message}
        onClose={dismissToast}
        type={toast?.type ?? 'success'}
      />
    </>
  )
}

export default ClientPage
