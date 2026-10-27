import { useCallback, useEffect, useMemo, useState } from "react";
import EmptyState from "../../../components/feedback/EmptyState.jsx";
import PageHeading from "../../../components/ui/PageHeading.jsx";
import DeleteProviderModal from "../components/DeleteProviderModal.jsx";
import ProviderFilters from "../components/ProviderFilters.jsx";
import ProviderForm from "../components/ProviderForm.jsx";
import ProviderTable from "../components/ProviderTable.jsx";
import Toast from "../../../components/feedback/Toast.jsx";
import {
  createProvider,
  deleteProvider,
  getProviders,
  updateProvider,
} from "../services/ProviderApi.js";

function ProviderPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [providerToDelete, setProviderToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProviders = useCallback(async () => {
    try {
      const data = await getProviders();
      setProviders(data);
    } catch (err) {
      console.error("Error al cargar proveedores:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const [toast, setToast] = useState(null);

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    let isCurrent = true;

    getProviders()
      .then((data) => {
        if (isCurrent) setProviders(data);
      })
      .catch((err) => {
        console.error("Error al cargar proveedores:", err);
        if (isCurrent) setError(err.message);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const filteredProviders = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    return providers.filter((provider) =>
      [provider.name, provider.nit, provider.email, provider.phone].some(
        (value) =>
          String(value ?? "")
            .toLocaleLowerCase()
            .includes(normalizedSearch),
      ),
    );
  }, [providers, search]);

  async function handleSaveProvider(formData) {
    setIsSubmitting(true);
    setCreateError(null);
    setToast(null);

    try {
      const wasEditing = Boolean(editingProvider);
      if (editingProvider) {
        await updateProvider(editingProvider.id, formData);
      } else {
        await createProvider(formData);
      }
      setIsFormOpen(false);
      setEditingProvider(null);
      setLoading(true);
      setError(null);
      await fetchProviders();
      setToast({
        type: "success",
        message: wasEditing
          ? "Proveedor actualizado correctamente."
          : "Proveedor creado correctamente.",
      });
    } catch (err) {
      console.error("Error al guardar proveedor:", err);
      setCreateError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function openCreateForm() {
    setEditingProvider(null);
    setCreateError(null);
    setIsFormOpen(true);
  }

  function openEditForm(provider) {
    setEditingProvider(provider);
    setCreateError(null);
    setIsFormOpen(true);
  }

  function openDeleteModal(provider) {
    setProviderToDelete(provider);
    setDeleteError(null);
  }

  async function handleDeleteProvider() {
    if (!providerToDelete) return;

    const provider = providerToDelete;

    setDeletingId(provider.id);
    setDeleteError(null);
    setToast(null);

    try {
      await deleteProvider(provider.id);

      setProviders((currentProviders) =>
        currentProviders.filter(
          (currentProvider) => currentProvider.id !== provider.id,
        ),
      );

      setProviderToDelete(null);
      setToast({
        type: "success",
        message: `Proveedor "${provider.name}" eliminado correctamente.`,
      });
    } catch (err) {
      console.error("Error al eliminar proveedor:", err);
      const message = `No se pudo eliminar a "${provider.name}". ${err.message}`;
      setDeleteError(message);
      setToast({
        type: "warning",
        message: `${message} Verifica si está asociado a otros registros e inténtalo de nuevo.`,
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <PageHeading
        className="provider-page-heading"
        eyebrow="GESTION"
        title="Proveedores"
        description="Administra la informacion de tus proveedores y contactos."
      />

      <section className="panel inventory-panel provider-panel">
        <div className="panel-heading provider-panel-heading">
          <div>
            <h2>Proveedores registrados</h2>
            <p>
              {filteredProviders.length} de {providers.length} proveedores
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={openCreateForm}
            type="button"
          >
            + Nuevo proveedor
          </button>
        </div>

        {error ? (
          <div className="feature-load-error" role="alert">
            <p>No se pudieron cargar los proveedores: {error}</p>
            <button
              className="btn-secondary"
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchProviders();
              }}
              type="button"
            >
              Reintentar
            </button>
          </div>
        ) : loading ? (
          <p className="feature-loading" role="status">
            Cargando proveedores...
          </p>
        ) : providers.length === 0 ? (
          <EmptyState
            title="Aun no hay proveedores"
            description="Agrega el primer proveedor para empezar a gestionar tus contactos."
          />
        ) : (
          <>
            <ProviderFilters search={search} onSearchChange={setSearch} />
            <ProviderTable
              deletingId={deletingId}
              items={filteredProviders}
              onDelete={openDeleteModal}
              onEdit={openEditForm}
            />
          </>
        )}
      </section>

      {isFormOpen && (
        <ProviderForm
          key={editingProvider?.id ?? "new-provider"}
          error={createError}
          initialValues={editingProvider}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingProvider(null);
            setCreateError(null);
          }}
          onSubmit={handleSaveProvider}
          submitting={isSubmitting}
        />
      )}

      {providerToDelete && (
        <DeleteProviderModal
          deleting={deletingId === providerToDelete.id}
          error={deleteError}
          onCancel={() => {
            if (deletingId === null) {
              setProviderToDelete(null);
              setDeleteError(null);
            }
          }}
          onConfirm={handleDeleteProvider}
          provider={providerToDelete}
        />
      )}

      <Toast
        duration={4500}
        key={toast?.message ?? "empty-toast"}
        message={toast?.message}
        onClose={dismissToast}
        type={toast?.type ?? "success"}
      />
    </>
  );
}

export default ProviderPage;
