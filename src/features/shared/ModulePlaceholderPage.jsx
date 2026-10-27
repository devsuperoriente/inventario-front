import EmptyState from "../../components/feedback/EmptyState.jsx";
import PageHeading from "../../components/ui/PageHeading.jsx";

function ModulePlaceholderPage({ title, description }) {
  return (
    <>
      <PageHeading
        eyebrow="MODULO DE OPERACION"
        title={title}
        description={description}
      />
      <section className="panel">
        <EmptyState
          title="Modulo preparado para implementacion"
          description="La estructura de esta seccion ya esta creada. La conexion se completara al definir los endpoints y reglas del backend."
        />
      </section>
    </>
  );
}

export default ModulePlaceholderPage;
