import { useState } from "react";
import Modal from "../../../components/ui/Modal.jsx";

const emptyFormData = {
  name: "",
  abbreviation: "",
  description: "",
};

function MeasurementUnitForm({
  initialValues,
  onSubmit,
  onCancel,
  submitting,
  error,
}) {
  const [formData, setFormData] = useState(() => ({
    ...emptyFormData,
    ...initialValues,
    name: initialValues?.name ?? "",
    abbreviation: initialValues?.abbreviation ?? "",
    description: initialValues?.description ?? "",
  }));

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit({
      name: formData.name.trim(),
      abbreviation: formData.abbreviation.trim(),
      description: formData.description.trim(),
    });
  }

  return (
    <Modal
      closeDisabled={submitting}
      description="Registra el nombre, simbolo y descripcion de la unidad."
      onClose={onCancel}
      title={
        initialValues ? "Modificar unidad de medida" : "Nueva unidad de medida"
      }
    >
      <form className="entity-form" onSubmit={handleSubmit}>
        <div className="entity-form-grid measurement-unit-form-grid">
          <label className="entity-form-field">
            <span>
              Nombre <span aria-hidden="true">*</span>
            </span>
            <input
              autoComplete="off"
              maxLength={80}
              name="name"
              onChange={handleChange}
              placeholder="Kilogramo"
              required
              value={formData.name}
            />
          </label>
          <label className="entity-form-field">
            <span>
              Simbolo o abreviatura <span aria-hidden="true">*</span>
            </span>
            <input
              autoComplete="off"
              maxLength={16}
              name="abbreviation"
              onChange={handleChange}
              placeholder="kg"
              required
              value={formData.abbreviation}
            />
          </label>
          <label className="entity-form-field measurement-unit-description-field">
            <span>Descripcion</span>
            <textarea
              maxLength={250}
              name="description"
              onChange={handleChange}
              placeholder="Unidad para medir peso"
              rows={3}
              value={formData.description}
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
                : "Guardar unidad"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default MeasurementUnitForm;
