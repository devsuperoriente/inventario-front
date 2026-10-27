import { useCallback, useEffect, useMemo, useState } from "react";
import EmptyState from "../../../components/feedback/EmptyState.jsx";
import Toast from "../../../components/feedback/Toast.jsx";
import PageHeading from "../../../components/ui/PageHeading.jsx";
import { getProducts } from "../../products/services/productsApi.js";
import { getProviders } from "../../providers/services/ProviderApi.js";
import BatchFilters from "../components/BatchFilters.jsx";
import BatchDetailsModal from "../components/BatchDetailsModal.jsx";
import BatchForm from "../components/BatchForm.jsx";
import BatchTable from "../components/BatchTable.jsx";
import DeleteBatchModal from "../components/DeleteBatchModal.jsx";
import {
  createBatch,
  deleteBatch,
  getBatches,
  updateBatch,
  uploadBatchImage,
} from "../services/batchesApi.js";

function BatchesPage() {
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [viewingBatch, setViewingBatch] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const fetchData = useCallback(async () => {
    try {
      const [batchData, productData, providerData] = await Promise.all([
        getBatches(),
        getProducts(),
        getProviders(),
      ]);
      setBatches(batchData);
      setProducts(productData);
      setProviders(providerData);
      setLoadError("");
    } catch (error) {
      console.error("Error al cargar lotes, productos o proveedores:", error);
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    Promise.all([getBatches(), getProducts(), getProviders()])
      .then(([batchData, productData, providerData]) => {
        if (!isCurrent) return;
        setBatches(batchData);
        setProducts(productData);
        setProviders(providerData);
      })
      .catch((error) => {
        console.error("Error al cargar lotes, productos o proveedores:", error);
        if (isCurrent) setLoadError(error.message);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const filteredBatches = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return batches.filter((batch) =>
      [
        batch.product?.name,
        batch.productName,
        batch.provider?.name,
        batch.providerName,
        batch.observation,
      ].some((value) =>
        String(value ?? "")
          .toLocaleLowerCase()
          .includes(normalizedSearch),
      ),
    );
  }, [batches, search]);

  async function handleSave({ batchData, imageFile }) {
    setSaving(true);
    setFormError("");
    setToast(null);
    try {
      const wasEditing = Boolean(editingBatch);
      const imageUrl = imageFile
        ? await uploadBatchImage(imageFile)
        : batchData.imageUrl;
      const payload = imageUrl ? { ...batchData, imageUrl } : batchData;
      if (editingBatch) {
        await updateBatch(editingBatch.id, payload);
      } else {
        await createBatch(payload);
      }
      setFormOpen(false);
      setEditingBatch(null);
      setLoading(true);
      await fetchData();
      setToast({
        type: "success",
        message: wasEditing
          ? "Lote actualizado correctamente."
          : "Lote creado correctamente.",
      });
    } catch (error) {
      console.error("Error al guardar lote:", error);
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  }

  function openCreateForm() {
    setEditingBatch(null);
    setFormError("");
    setFormOpen(true);
  }

  function openEditForm(batch) {
    setEditingBatch(batch);
    setFormError("");
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!batchToDelete) return;
    const batch = batchToDelete;
    setDeletingId(batch.id);
    setDeleteError("");
    setToast(null);
    try {
      await deleteBatch(batch.id);
      setBatches((current) => current.filter((item) => item.id !== batch.id));
      setBatchToDelete(null);
      setToast({
        type: "success",
        message: `Lote "${batch.code}" eliminado correctamente.`,
      });
    } catch (error) {
      console.error("Error al eliminar lote:", error);
      const message = `No se pudo eliminar el lote "${batch.code}". ${error.message}`;
      setDeleteError(message);
      setToast({ type: "warning", message });
    } finally {
      setDeletingId(null);
    }
  }

  const referencesReady = products.length > 0 && providers.length > 0;

  return (
    <>
      <PageHeading
        className="provider-page-heading"
        eyebrow="INVENTARIO"
        title="Lotes"
        description="Controla cantidades, fechas y condiciones de lotes recibidos de proveedores."
      />

      <section className="panel provider-panel">
        <div className="panel-heading provider-panel-heading">
          <div>
            <h2>Lotes registrados</h2>
            <p>
              {filteredBatches.length} de {batches.length} lotes
            </p>
          </div>
          <button
            className="btn-primary"
            disabled={!referencesReady}
            onClick={openCreateForm}
            type="button"
          >
            + Nuevo lote
          </button>
        </div>

        {loadError ? (
          <div className="feature-load-error" role="alert">
            <p>
              No se pudieron cargar lotes, productos o proveedores: {loadError}
            </p>
            <button
              className="btn-secondary"
              onClick={() => {
                setLoading(true);
                setLoadError("");
                fetchData();
              }}
              type="button"
            >
              Reintentar
            </button>
          </div>
        ) : loading ? (
          <p className="feature-loading" role="status">
            Cargando lotes...
          </p>
        ) : products.length === 0 ? (
          <EmptyState
            title="Primero registra un producto"
            description="Cada lote debe estar relacionado con un producto."
          />
        ) : providers.length === 0 ? (
          <EmptyState
            title="Primero registra un proveedor"
            description="Cada lote debe estar relacionado con su proveedor."
          />
        ) : batches.length === 0 ? (
          <EmptyState
            title="Aún no hay lotes"
            description="Crea un lote y relaciónalo con un producto y su proveedor."
          />
        ) : (
          <>
            <BatchFilters search={search} onSearchChange={setSearch} />
            <BatchTable
              deletingId={deletingId}
              items={filteredBatches}
              onViewDetails={setViewingBatch}
              onDelete={(batch) => {
                setBatchToDelete(batch);
                setDeleteError("");
              }}
              onEdit={openEditForm}
            />
          </>
        )}
      </section>

      {formOpen && (
        <BatchForm
          error={formError}
          initialValues={editingBatch}
          key={editingBatch?.id ?? "new-batch"}
          onCancel={() => {
            setFormOpen(false);
            setEditingBatch(null);
            setFormError("");
          }}
          onSubmit={handleSave}
          products={products}
          providers={providers}
          submitting={saving}
        />
      )}

      {viewingBatch && (
        <BatchDetailsModal
          batch={viewingBatch}
          onClose={() => setViewingBatch(null)}
        />
      )}

      {batchToDelete && (
        <DeleteBatchModal
          batch={batchToDelete}
          deleting={deletingId === batchToDelete.id}
          error={deleteError}
          onCancel={() => {
            if (deletingId === null) {
              setBatchToDelete(null);
              setDeleteError("");
            }
          }}
          onConfirm={handleDelete}
        />
      )}

      <Toast
        duration={4500}
        key={toast?.message ?? "empty-batch-toast"}
        message={toast?.message}
        onClose={dismissToast}
        type={toast?.type ?? "success"}
      />
    </>
  );
}

export default BatchesPage;
