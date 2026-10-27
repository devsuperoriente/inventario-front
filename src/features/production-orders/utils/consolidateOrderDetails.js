export function getOrderDate(order) {
  return String(order.date ?? order.dateOrder ?? "").slice(0, 10);
}

export function getOrderId(detail) {
  return detail.orderId ?? detail.order?.id;
}

export function getProductId(detail) {
  return detail.productId ?? detail.product?.id;
}

export function consolidateOrderDetails(orders, details, products) {
  const orderIds = new Set(orders.map((order) => String(order.id)));
  const productsById = new Map(
    products.map((product) => [String(product.id), product]),
  );
  const totalsByProduct = new Map();

  details
    .filter((detail) => orderIds.has(String(getOrderId(detail))))
    .forEach((detail) => {
      const productId = getProductId(detail);
      const quantity = Number(detail.amount);
      if (productId === undefined || productId === null) {
        throw new Error(
          "Un detalle de pedido no incluye el identificador de su producto.",
        );
      }
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error("Un detalle de pedido tiene una cantidad inválida.");
      }

      const key = String(productId);
      const current = totalsByProduct.get(key);
      const product = detail.product
        ? { ...productsById.get(key), ...detail.product }
        : productsById.get(key);
      totalsByProduct.set(key, {
        productId,
        productName: product?.name ?? `Producto ${productId}`,
        productCode: product?.code,
        unit: product?.unitsMeasurement?.abbreviation ?? "—",
        quantityCents:
          (current?.quantityCents ?? 0) +
          Math.round((quantity + Number.EPSILON) * 100),
      });
    });

  return [...totalsByProduct.values()]
    .map(({ quantityCents, ...product }) => ({
      ...product,
      quantity: quantityCents / 100,
    }))
    .sort((first, second) =>
      first.productName.localeCompare(second.productName),
    );
}
