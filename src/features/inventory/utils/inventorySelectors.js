export function getBatchId(batch) {
  return batch.batchId ?? batch.batch?.id;
}

export function getMovementBatch(movement, batchesById) {
  return movement.batch ?? batchesById.get(String(getBatchId(movement)));
}

export function getMovementProduct(movement, batch) {
  return movement.product ?? batch?.product;
}

export function getMovementDate(movement) {
  return String(movement.date ?? "").slice(0, 10);
}

export function getMovementOrderLabel(movement) {
  const order = movement.ordersProduction ?? movement.orderProduction;
  return order?.numberOrder ?? (order?.id ? `#${order.id}` : "—");
}
