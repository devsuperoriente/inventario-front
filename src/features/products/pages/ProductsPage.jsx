import { useCallback, useEffect, useMemo, useState } from 'react'
import EmptyState from '../../../components/feedback/EmptyState.jsx'
import Toast from '../../../components/feedback/Toast.jsx'
import PageHeading from '../../../components/ui/PageHeading.jsx'
import { getCategories } from '../../categories/services/categoriesApi.js'
import { getMeasurementUnits } from '../../measurement-units/services/measurementUnitsApi.js'
import DeleteProductModal from '../components/DeleteProductModal.jsx'
import ProductFilters from '../components/ProductFilters.jsx'
import ProductForm from '../components/ProductForm.jsx'
import ProductTable from '../components/ProductTable.jsx'
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../services/productsApi.js'

const productGroups = [
  { id: 'all', label: 'Todos' },
  { id: 'raw-material', label: 'Materia prima' },
  { id: 'final-product', label: 'Producto final' },
  { id: 'other', label: 'Otras categorías' },
]

function loadProductsData() {
  return Promise.all([getProducts(), getCategories(), getMeasurementUnits()])
}

function normalizeCategoryName(name) {
  return String(name ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase()
}

function getProductGroup(product, categoriesById) {
  const category = product.category ?? categoriesById.get(
    String(product.categoryId ?? product.category?.id ?? ''),
  )
  const categoryId = String(product.categoryId ?? category?.id ?? '')
  const categoryName = normalizeCategoryName(category?.name)

  if (categoryName.includes('producto final')) return 'final-product'
  if (categoryName.includes('materia prima')) return 'raw-material'
  if (categoryId === '1') return 'raw-material'
  if (categoryId === '2') return 'final-product'
  return 'other'
}

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [measurementUnits, setMeasurementUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [search, setSearch] = useState('')
  const [activeGroup, setActiveGroup] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [toast, setToast] = useState(null)

  const dismissToast = useCallback(() => setToast(null), [])

  const fetchData = useCallback(async () => {
    try {
      const [productsData, categoriesData, unitsData] = await loadProductsData()
      setProducts(productsData)
      setCategories(categoriesData)
      setMeasurementUnits(unitsData)
      setLoadError(null)
    } catch (err) {
      console.error('Error al cargar productos, categorias o unidades:', err)
      setLoadError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isCurrent = true

    loadProductsData()
      .then(([productsData, categoriesData, unitsData]) => {
        if (!isCurrent) return
        setProducts(productsData)
        setCategories(categoriesData)
        setMeasurementUnits(unitsData)
      })
      .catch((err) => {
        console.error('Error al cargar productos, categorias o unidades:', err)
        if (isCurrent) setLoadError(err.message)
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [String(category.id), category])),
    [categories],
  )
  const unitsById = useMemo(
    () => new Map(measurementUnits.map((unit) => [String(unit.id), unit])),
    [measurementUnits],
  )

  const searchedProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase()

    return products.filter((product) => {
      const category = product.category ?? categoriesById.get(String(product.categoryId))
      const unit = product.measurementUnit
        ?? product.unit
        ?? unitsById.get(String(product.measurementUnitId ?? product.unitId ?? product.unit?.id))

      return [
        product.name,
        product.code,
        product.description,
        category?.name,
        unit?.name,
        unit?.abbreviation,
      ].some((value) => String(value ?? '').toLocaleLowerCase().includes(normalizedSearch))
    })
  }, [categoriesById, products, search, unitsById])

  const groupCounts = useMemo(() => {
    const counts = { all: products.length, 'raw-material': 0, 'final-product': 0, other: 0 }
    products.forEach((product) => {
      counts[getProductGroup(product, categoriesById)] += 1
    })
    return counts
  }, [categoriesById, products])

  const filteredProducts = useMemo(
    () => searchedProducts.filter(
      (product) => activeGroup === 'all' || getProductGroup(product, categoriesById) === activeGroup,
    ),
    [activeGroup, categoriesById, searchedProducts],
  )

  async function handleSaveProduct(formData) {
    setSaving(true)
    setFormError(null)
    setToast(null)

    try {
      const wasEditing = Boolean(editingProduct)
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData)
      } else {
        await createProduct(formData)
      }

      setFormOpen(false)
      setEditingProduct(null)
      setLoading(true)
      await fetchData()
      setToast({
        type: 'success',
        message: wasEditing
          ? 'Producto actualizado correctamente.'
          : 'Producto creado correctamente.',
      })
    } catch (err) {
      console.error('Error al guardar producto:', err)
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function openCreateForm() {
    setEditingProduct(null)
    setFormError(null)
    setFormOpen(true)
  }

  function openEditForm(product) {
    setEditingProduct(product)
    setFormError(null)
    setFormOpen(true)
  }

  async function handleDeleteProduct() {
    if (!productToDelete) return
    const product = productToDelete

    setDeletingId(product.id)
    setDeleteError(null)
    setToast(null)

    try {
      await deleteProduct(product.id)
      setProducts((currentProducts) =>
        currentProducts.filter((currentProduct) => currentProduct.id !== product.id),
      )
      setProductToDelete(null)
      setToast({
        type: 'success',
        message: `Producto "${product.name}" eliminado correctamente.`,
      })
    } catch (err) {
      console.error('Error al eliminar producto:', err)
      const message = `No se pudo eliminar el producto "${product.name}". ${err.message}`
      setDeleteError(message)
      setToast({
        type: 'warning',
        message: `${message} Puede estar relacionado con inventario o movimientos.`,
      })
    } finally {
      setDeletingId(null)
    }
  }

  const referenceDataReady = categories.length > 0 && measurementUnits.length > 0

  return (
    <>
      <PageHeading
        className="provider-page-heading"
        eyebrow="CATALOGO"
        title="Productos"
        description="Registra productos vinculados a una categoria y una unidad de medida."
      />

      <section className="panel provider-panel">
        <div className="panel-heading provider-panel-heading">
          <div>
            <h2>Productos registrados</h2>
            <p>{filteredProducts.length} producto{filteredProducts.length === 1 ? '' : 's'} mostrados</p>
          </div>
          <button
            className="btn-primary"
            disabled={!referenceDataReady}
            onClick={openCreateForm}
            type="button"
          >
            + Nuevo producto
          </button>
        </div>

        {loadError ? (
          <div className="feature-load-error" role="alert">
            <p>No se pudieron cargar los productos, categorias o unidades: {loadError}</p>
            <button
              className="btn-secondary"
              onClick={() => {
                setLoading(true)
                setLoadError(null)
                fetchData()
              }}
              type="button"
            >
              Reintentar
            </button>
          </div>
        ) : loading ? (
          <p className="feature-loading" role="status">Cargando productos...</p>
        ) : categories.length === 0 ? (
          <EmptyState
            title="Primero registra una categoria"
            description="Cada producto pertenece a una categoria. Crea una categoria antes de agregar productos."
          />
        ) : measurementUnits.length === 0 ? (
          <EmptyState
            title="Primero registra una unidad de medida"
            description="Cada producto debe tener una unidad de medida. Crea una unidad antes de agregar productos."
          />
        ) : products.length === 0 ? (
          <EmptyState
            title="Aun no hay productos"
            description="Crea un producto y asignalo a una categoria y unidad de medida."
          />
        ) : (
          <>
            <ProductFilters search={search} onSearchChange={setSearch} />
            <nav aria-label="Filtrar productos por tipo" className="product-category-tabs">
              {productGroups.map((group) => (
                <button
                  aria-pressed={activeGroup === group.id}
                  className={`product-category-tab${activeGroup === group.id ? ' is-active' : ''}`}
                  key={group.id}
                  onClick={() => setActiveGroup(group.id)}
                  type="button"
                >
                  <span>{group.label}</span>
                  <span className="product-category-tab-count">{groupCounts[group.id]}</span>
                </button>
              ))}
            </nav>
            <ProductTable
              categoriesById={categoriesById}
              deletingId={deletingId}
              items={filteredProducts}
              onDelete={(product) => {
                setProductToDelete(product)
                setDeleteError(null)
              }}
              onEdit={openEditForm}
              unitsById={unitsById}
            />
          </>
        )}
      </section>

      {formOpen && (
        <ProductForm
          categories={categories}
          error={formError}
          initialValues={editingProduct}
          key={editingProduct?.id ?? 'new-product'}
          measurementUnits={measurementUnits}
          preferredCategoryId={
            activeGroup === 'raw-material'
              ? '1'
              : activeGroup === 'final-product'
                ? '2'
                : ''
          }
          onCancel={() => {
            setFormOpen(false)
            setEditingProduct(null)
            setFormError(null)
          }}
          onSubmit={handleSaveProduct}
          submitting={saving}
        />
      )}

      {productToDelete && (
        <DeleteProductModal
          error={deleteError}
          deleting={deletingId === productToDelete.id}
          onCancel={() => {
            if (deletingId === null) {
              setProductToDelete(null)
              setDeleteError(null)
            }
          }}
          onConfirm={handleDeleteProduct}
          product={productToDelete}
        />
      )}

      <Toast
        duration={4500}
        key={toast?.message ?? 'empty-product-toast'}
        message={toast?.message}
        onClose={dismissToast}
        type={toast?.type ?? 'success'}
      />
    </>
  )
}

export default ProductsPage
