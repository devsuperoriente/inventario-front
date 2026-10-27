import { useState } from "react";

function OrderDetailForm({
  products = [],
  initialValues,
  onSubmit,
  onCancel,
  submitting,
  error,
}) {
  // Filtramos para quedarnos solo con los productos de tipo final
  // (Ajusta 'product.type === "FINAL"' o la condición exacta que uses en tu base de datos)
  // Si tu producto guarda la categoría como un objeto (relación) o como un ID directo
  const finalProducts = products.filter(
    (product) => product.categoryId === 2 || product.category?.id === 2,
  );

  const [productId, setProductId] = useState(
    String(initialValues?.productId ?? initialValues?.product?.id ?? ""),
  );
  const [amount, setAmount] = useState(String(initialValues?.amount ?? "1"));

  async function handleSubmit(event) {
    event.preventDefault();
    // Buscamos dentro de los productos filtrados
    const product = finalProducts.find((item) => String(item.id) === productId);
    const numericAmount = Number(amount);

    if (!product || !Number.isFinite(numericAmount) || numericAmount <= 0)
      return;

    await onSubmit({ productId: product.id, amount: numericAmount });
  }

  return (
    <form className="entity-form order-detail-form" onSubmit={handleSubmit}>
      <div className="entity-form-grid order-detail-form-grid">
        <label className="entity-form-field">
          <span>
            Producto Final <span aria-hidden="true">*</span>
          </span>
          <select
            autoFocus
            onChange={(event) => setProductId(event.target.value)}
            required
            value={productId}
          >
            <option value="">Selecciona un producto final</option>
            {/* Mapeamos 'finalProducts' en lugar de 'products' */}
            {finalProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
                {product.code ? ` · ${product.code}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="entity-form-field">
          <span>
            Cantidad <span aria-hidden="true">*</span>
          </span>
          <input
            min="0.01"
            onChange={(event) => setAmount(event.target.value)}
            required
            step="any"
            type="number"
            value={amount}
          />
        </label>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="entity-form-actions">
        <button
          className="btn-secondary"
          disabled={submitting}
          onClick={onCancel}
          type="button"
        >
          Cancelar
        </button>
        <button className="btn-primary" disabled={submitting} type="submit">
          {submitting
            ? "Guardando..."
            : initialValues
              ? "Guardar cambios"
              : "Agregar producto"}
        </button>
      </div>
    </form>
  );
}

export default OrderDetailForm;
