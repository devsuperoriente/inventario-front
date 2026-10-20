import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import EmptyState from '../../../components/feedback/EmptyState.jsx'
import Toast from '../../../components/feedback/Toast.jsx'
import Modal from '../../../components/ui/Modal.jsx'
import PageHeading from '../../../components/ui/PageHeading.jsx'
import { getProducts } from '../../products/services/productsApi.js'
import DeleteOrderModal from '../components/DeleteOrderModal.jsx'
import OrderFilters from '../components/OrderFilters.jsx'
import OrderForm from '../components/OrderForm.jsx'
import OrderTable from '../components/OrderTable.jsx'
import OrderDetailForm from '../components/details/OrderDetailForm.jsx'
import OrderDetailTable from '../components/details/OrderDetailTable.jsx'
import {
  createOrder,
  deleteOrder,
  getOrders,
  updateOrder,
} from '../services/ordersApi.js'
import {
  createOrderDetail,
  deleteOrderDetail,
  getOrderDetails,
  updateOrderDetail,
} from '../services/orderDetailsApi.js'

function getOrderId(detail) {
  return detail.orderId ?? detail.order?.id
}

function getOrderLabel(order) {
  return order.numberOrder ?? order.orderNumber ?? `#${order.id}`
}

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [details, setDetails] = useState([])
  const [products, setProducts] = useState([])
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState(null)
  const [detailFormOpen, setDetailFormOpen] = useState(false)
  const [editingDetail, setEditingDetail] = useState(null)
  const [detailFormError, setDetailFormError] = useState(null)
  const [savingDetail, setSavingDetail] = useState(false)
  const [detailToDelete, setDetailToDelete] = useState(null)
  const [detailDeleteError, setDetailDeleteError] = useState(null)
  const [deletingDetailId, setDeletingDetailId] = useState(null)
  const [toast, setToast] = useState(null)
  const detailRequestId = useRef(0)

  const dismissToast = useCallback(() => setToast(null), [])

  const fetchOrders = useCallback(async () => {
    try {
      const ordersData = await getOrders()
      setOrders(ordersData)
      setLoadError(null)
    } catch (error) {
      console.error('Error al cargar pedidos:', error)
      setLoadError(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isCurrent = true

    getOrders()
      .then((ordersData) => {
        if (!isCurrent) return
        setOrders(ordersData)
        setLoadError(null)
      })
      .catch((error) => {
        console.error('Error al cargar pedidos:', error)
        if (isCurrent) setLoadError(error.message)
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase()

    return orders.filter((order) => [
      order.numberOrder,
      order.orderNumber,
      order.dateOrder?.slice(0, 10),
    ].some((value) => String(value ?? '').toLocaleLowerCase().includes(normalizedSearch)))
  }, [orders, search])

  const productsById = useMemo(
    () => new Map(products.map((product) => [String(product.id), product])),
    [products],
  )

  async function loadOrderDetails(order) {
    const requestId = detailRequestId.current + 1
    detailRequestId.current = requestId
    setSelectedOrder(order)
    setDetailsLoading(true)
    setDetailsError(null)
    setDetails([])

    try {
      const [allDetails, productList] = await Promise.all([getOrderDetails(), getProducts()])
      if (detailRequestId.current !== requestId) return

      setDetails(allDetails.filter((detail) => String(getOrderId(detail)) === String(order.id)))
      setProducts(productList)
    } catch (error) {
      console.error('Error al cargar el detalle del pedido:', error)
      if (detailRequestId.current === requestId) setDetailsError(error.message)
    } finally {
      if (detailRequestId.current === requestId) setDetailsLoading(false)
    }
  }

  async function handleSaveOrder(formData) {
    setSaving(true)
    setFormError(null)
    setToast(null)

    try {
      const wasEditing = Boolean(editingOrder)
      if (editingOrder) {
        await updateOrder(editingOrder.id, formData)
        setSelectedOrder((currentOrder) =>
          String(currentOrder?.id) === String(editingOrder.id)
            ? { ...currentOrder, ...formData }
            : currentOrder,
        )
      } else {
        await createOrder(formData)
      }

      setFormOpen(false)
      setEditingOrder(null)
      setLoading(true)
      await fetchOrders()
      setToast({
        type: 'success',
        message: wasEditing ? 'Pedido actualizado correctamente.' : 'Pedido creado. Ahora puedes agregar sus productos.',
      })
    } catch (error) {
      console.error('Error al guardar pedido:', error)
      setFormError(error.message)
    } finally {
      setSaving(false)
    }
  }

  function openCreateForm() {
    setEditingOrder(null)
    setFormError(null)
    setFormOpen(true)
  }

  function openEditForm(order) {
    setEditingOrder(order)
    setFormError(null)
    setFormOpen(true)
  }

  async function handleDeleteOrder() {
    if (!orderToDelete) return
    const order = orderToDelete

    setDeletingId(order.id)
    setDeleteError(null)
    setToast(null)

    try {
      await deleteOrder(order.id)
      setOrders((currentOrders) =>
        currentOrders.filter((currentOrder) => currentOrder.id !== order.id),
      )
      if (String(selectedOrder?.id) === String(order.id)) {
        detailRequestId.current += 1
        setSelectedOrder(null)
        setDetails([])
      }
      setOrderToDelete(null)
      setToast({ type: 'success', message: 'Pedido eliminado correctamente.' })
    } catch (error) {
      console.error('Error al eliminar pedido:', error)
      const message = `No se pudo eliminar el pedido. ${error.message}`
      setDeleteError(message)
      setToast({
        type: 'warning',
        message: `${message} Si tiene productos asociados, elimina primero sus detalles.`,
      })
    } finally {
      setDeletingId(null)
    }
  }

  async function handleSaveDetail(formData) {
    if (!selectedOrder) return

    setSavingDetail(true)
    setDetailFormError(null)
    setToast(null)

    try {
      const detailData = { orderId: selectedOrder.id, ...formData }
      const wasEditing = Boolean(editingDetail)
      if (editingDetail) {
        await updateOrderDetail(editingDetail.id, detailData)
      } else {
        await createOrderDetail(detailData)
      }

      setDetailFormOpen(false)
      setEditingDetail(null)
      await loadOrderDetails(selectedOrder)
      setToast({
        type: 'success',
        message: wasEditing ? 'Detalle actualizado correctamente.' : 'Producto agregado al pedido.',
      })
    } catch (error) {
      console.error('Error al guardar detalle de pedido:', error)
      setDetailFormError(error.message)
    } finally {
      setSavingDetail(false)
    }
  }

  async function handleDeleteDetail() {
    if (!detailToDelete || !selectedOrder) return
    const detail = detailToDelete
    const product = detail.product ?? productsById.get(String(detail.productId))

    setDeletingDetailId(detail.id)
    setDetailDeleteError(null)
    setToast(null)

    try {
      await deleteOrderDetail(detail.id)
      setDetails((currentDetails) =>
        currentDetails.filter((currentDetail) => currentDetail.id !== detail.id),
      )
      setDetailToDelete(null)
      setToast({
        type: 'success',
        message: `${product?.name ?? 'Producto'} eliminado del pedido.`,
      })
    } catch (error) {
      console.error('Error al eliminar detalle de pedido:', error)
      const message = `No se pudo quitar el producto del pedido. ${error.message}`
      setDetailDeleteError(message)
      setToast({ type: 'warning', message })
    } finally {
      setDeletingDetailId(null)
    }
  }

  function closeDetails() {
    detailRequestId.current += 1
    setSelectedOrder(null)
    setDetails([])
    setDetailsError(null)
    setDetailFormOpen(false)
    setEditingDetail(null)
    setDetailToDelete(null)
  }

  return (
    <>
      <PageHeading
        className="provider-page-heading"
        eyebrow="VENTAS Y PRODUCCIÓN"
        title="Pedidos"
        description="Crea pedidos y administra en cada uno los productos solicitados y sus cantidades."
      />

      <section className="panel provider-panel">
        <div className="panel-heading provider-panel-heading">
          <div>
            <h2>Pedidos registrados</h2>
            <p>{filteredOrders.length} de {orders.length} pedidos</p>
          </div>
          <button className="btn-primary" onClick={openCreateForm} type="button">
            + Nuevo pedido
          </button>
        </div>

        {loadError ? (
          <div className="feature-load-error" role="alert">
            <p>No se pudieron cargar los pedidos: {loadError}</p>
            <button
              className="btn-secondary"
              onClick={() => {
                setLoading(true)
                setLoadError(null)
                fetchOrders()
              }}
              type="button"
            >
              Reintentar
            </button>
          </div>
        ) : loading ? (
          <p className="feature-loading" role="status">Cargando pedidos...</p>
        ) : orders.length === 0 ? (
          <EmptyState
            title="Aún no hay pedidos"
            description="Crea un pedido con su número y fecha. Después podrás agregar los productos solicitados."
          />
        ) : (
          <>
            <OrderFilters search={search} onSearchChange={setSearch} />
            <OrderTable
              deletingId={deletingId}
              items={filteredOrders}
              onDelete={(order) => {
                setOrderToDelete(order)
                setDeleteError(null)
              }}
              onEdit={openEditForm}
              onViewDetails={loadOrderDetails}
            />
          </>
        )}
      </section>

      {selectedOrder && (
        <Modal
          closeDisabled={savingDetail || deletingDetailId !== null}
          className="order-details-modal"
          description={`Fecha del pedido: ${selectedOrder.dateOrder?.slice(0, 10) || '—'}. Administra los productos y cantidades solicitados.`}
          onClose={closeDetails}
          title={`Detalle del pedido ${getOrderLabel(selectedOrder)}`}
        >
          <div className="order-details-content">
            {detailFormOpen ? (
              <>
                <h3 className="order-details-form-title">
                  {editingDetail ? 'Modificar producto del pedido' : 'Agregar producto al pedido'}
                </h3>
                <OrderDetailForm
                  error={detailFormError}
                  initialValues={editingDetail}
                  key={editingDetail?.id ?? `new-order-detail-${selectedOrder.id}`}
                  onCancel={() => {
                    setDetailFormOpen(false)
                    setEditingDetail(null)
                    setDetailFormError(null)
                  }}
                  onSubmit={handleSaveDetail}
                  products={products}
                  submitting={savingDetail}
                />
              </>
            ) : detailToDelete ? (
              <div className="order-detail-delete-confirmation">
                <p>
                  ¿Seguro que deseas quitar{' '}
                  <strong>
                    {detailToDelete.product?.name
                      ?? productsById.get(String(detailToDelete.productId))?.name
                      ?? 'producto'}
                  </strong>{' '}
                  del pedido{detailToDelete.amount != null && (
                    <> (cantidad: <strong>{detailToDelete.amount}</strong>)</>
                  )}?
                </p>
                {detailDeleteError && <p className="form-error" role="alert">{detailDeleteError}</p>}
                <div className="entity-form-actions">
                  <button
                    className="btn-secondary"
                    disabled={deletingDetailId !== null}
                    onClick={() => {
                      setDetailToDelete(null)
                      setDetailDeleteError(null)
                    }}
                    type="button"
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn-danger"
                    disabled={deletingDetailId !== null}
                    onClick={handleDeleteDetail}
                    type="button"
                  >
                    {deletingDetailId !== null ? 'Eliminando...' : 'Quitar producto'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="order-details-toolbar">
                  <p>{details.length} producto{details.length === 1 ? '' : 's'} en el pedido</p>
                  <button
                    className="btn-primary"
                    disabled={detailsLoading || products.length === 0}
                    onClick={() => {
                      setEditingDetail(null)
                      setDetailFormError(null)
                      setDetailFormOpen(true)
                    }}
                    type="button"
                  >
                    + Agregar producto
                  </button>
                </div>
                {detailsError ? (
                  <div className="feature-load-error" role="alert">
                    <p>No se pudo cargar el detalle del pedido: {detailsError}</p>
                    <button
                      className="btn-secondary"
                      onClick={() => loadOrderDetails(selectedOrder)}
                      type="button"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : detailsLoading ? (
                  <p className="feature-loading" role="status">Cargando productos del pedido...</p>
                ) : products.length === 0 ? (
                  <EmptyState
                    title="No hay productos disponibles"
                    description="Registra productos en el catálogo antes de agregarlos a un pedido."
                  />
                ) : (
                  <OrderDetailTable
                    deletingId={deletingDetailId}
                    items={details}
                    onDelete={(detail) => {
                      setDetailToDelete(detail)
                      setDetailDeleteError(null)
                    }}
                    onEdit={(detail) => {
                      setEditingDetail(detail)
                      setDetailFormError(null)
                      setDetailFormOpen(true)
                    }}
                    productsById={productsById}
                  />
                )}
              </>
            )}
          </div>
        </Modal>
      )}

      {formOpen && (
        <OrderForm
          error={formError}
          initialValues={editingOrder}
          key={editingOrder?.id ?? 'new-order'}
          onCancel={() => {
            setFormOpen(false)
            setEditingOrder(null)
            setFormError(null)
          }}
          onSubmit={handleSaveOrder}
          submitting={saving}
        />
      )}

      {orderToDelete && (
        <DeleteOrderModal
          error={deleteError}
          deleting={deletingId === orderToDelete.id}
          onCancel={() => {
            if (deletingId === null) {
              setOrderToDelete(null)
              setDeleteError(null)
            }
          }}
          onConfirm={handleDeleteOrder}
          order={orderToDelete}
        />
      )}

      <Toast
        duration={4500}
        key={toast?.message ?? 'empty-order-toast'}
        message={toast?.message}
        onClose={dismissToast}
        type={toast?.type ?? 'success'}
      />
    </>
  )
}

export default OrdersPage
