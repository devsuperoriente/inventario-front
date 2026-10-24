export function groupBatchesByProduct(batches) {
  const products = new Map()

  batches.forEach((batch) => {
    const product = batch.product
    const productId = batch.productId ?? product?.id
    const name = product?.name ?? batch.productName ?? 'Producto sin nombre'
    const key = productId == null ? `name:${name}` : `id:${productId}`

    if (!products.has(key)) {
      products.set(key, {
        key,
        id: productId,
        name,
        unit: product?.unitsMeasurement?.abbreviation ?? '',
        batches: [],
      })
    }

    products.get(key).batches.push(batch)
  })

  return [...products.values()].map((product) => ({
    ...product,
    available: sumStockQuantities(
      product.batches.map((batch) => batch.quantityAvailable),
    ),
  }))
}

export function sumStockQuantities(values) {
  let totalInCents = 0

  for (const value of values) {
    if (value == null || value === '') return null
    const quantity = Number(value)
    if (!Number.isFinite(quantity)) return null
    totalInCents += Math.round(quantity * 100)
  }

  return totalInCents / 100
}

export function formatStockQuantity(quantity) {
  if (quantity == null) return '—'
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(quantity)
}
