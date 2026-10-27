import { useState } from "react";
import Modal from "../../../components/ui/Modal.jsx";

function CategoryForm({
  initialValues,
  onSubmit,
  onCancel,
  submitting,
  error,
}) {
  const [formData, setFormData] = useState(() => ({
    name: initialValues?.name ?? "",
  }));

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit({
      name: formData.name.trim(),
    });
  }

  return (
    <Modal
      closeDisabled={submitting}
      description="Registra el nombre de la categoria."
      onClose={onCancel}
      title={initialValues ? "Modificar categoria" : "Nueva categoria"}
    >
      <form className="entity-form" onSubmit={handleSubmit}>
        <div className="entity-form-grid category-form-grid">
          <label className="entity-form-field">
            <span>
              Nombre <span aria-hidden="true">*</span>
            </span>
            <input
              autoComplete="off"
              maxLength={80}
              name="name"
              onChange={handleChange}
              placeholder="Materia prima"
              required
              value={formData.name}
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
                : "Guardar categoria"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CategoryForm;
