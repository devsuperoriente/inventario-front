import { useEffect, useState } from 'react'
import EmptyState from '../../../components/feedback/EmptyState.jsx'
import Modal from '../../../components/ui/Modal.jsx'
import {
  getRequiredMaterials,
  registerRawMaterialConsumption,
} from '../services/productionOrdersApi.js'

function RequiredMaterialsModal({ order, onClose, onConsumptionRegistered }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [confirmingConsumption, setConfirmingConsumption] = useState(false)
  const [registeringConsumption, setRegisteringConsumption] = useState(false)
  const [consumptionError, setConsumptionError] = useState('')

  useEffect(() => {
    let isCurrent = true
    getRequiredMaterials(order.id)
      .then((result) => {
        if (isCurrent) setData(result)
      })
      .catch((requestError) => {
        console.error('Error al calcular insumos requeridos:', requestError)
        if (isCurrent) setError(requestError.message)
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })
    return () => {
      isCurrent = false
    }
  }, [order.id, retryCount])

  const recipe = data?.receta
  const materials = data?.insumos
  const productionOrder = data?.orden ?? order

  async function handleRegisterConsumption() {
    setRegisteringConsumption(true)
    setConsumptionError('')
    try {
      await registerRawMaterialConsumption(order.id)
      await onConsumptionRegistered()
    } catch (requestError) {
      console.error('Error al registrar el consumo de materia prima:', requestError)
      setConsumptionError(requestError.message)
      setConfirmingConsumption(false)
    } finally {
      setRegisteringConsumption(false)
    }
  }

  return (
    <Modal
      className="required-materials-modal"
      closeDisabled={registeringConsumption}
      description={`Insumos requeridos para la orden ${order.numberOrder ?? `#${order.id}`}.`}
      onClose={onClose}
      title="Consumo de materia prima"
    >
      <div className="required-materials-content">
        {loading ? (
          <p className="feature-loading" role="status">Calculando insumos...</p>
        ) : error ? (
          <div className="feature-load-error" role="alert">
            <p>No se pudieron calcular los insumos: {error}</p>
            <button
              className="btn-secondary"
              onClick={() => {
                setLoading(true)
                setError('')
                setRetryCount((current) => current + 1)
              }}
              type="button"
            >
              Reintentar
            </button>
          </div>
        ) : !Array.isArray(materials) || materials.length === 0 ? (
          <EmptyState
            title="La receta no tiene insumos"
            description="La orden no tiene materiales requeridos para mostrar."
          />
        ) : (
          <>
            <div className="required-materials-summary">
              <div>
                <span>Producto final</span>
                <strong>
                  {productionOrder.product?.name ?? order.product?.name ?? '—'}
                </strong>
              </div>
              <div>
                <span>Cantidad programada</span>
                <strong>{productionOrder.quantitySheduled ?? order.quantitySheduled ?? '—'}</strong>
              </div>
              <div>
                <span>Receta</span>
                <strong>
                  {recipe?.name ?? '—'}{recipe?.version ? ` · ${recipe.version}` : ''}
                </strong>
              </div>
            </div>

            <div className="table-wrap required-materials-table-wrap">
              <table className="required-materials-table">
                <caption className="sr-only">Materiales requeridos para la orden de producción</caption>
                <thead>
                  <tr>
                    <th scope="col">Insumo</th>
                    <th scope="col">Unidad</th>
                    <th scope="col">Cantidad requerida</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((material) => (
                    <tr key={material.id}>
                      <td data-label="Insumo"><strong>{material.nombre}</strong></td>
                      <td data-label="Unidad">
                        {material.unidadMedida?.abreviatura
                          ?? material.unidadMedida?.nombre
                          ?? '—'}
                      </td>
                      <td data-label="Cantidad requerida">{material.cantidadRequerida}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="required-materials-consumption">
              <p>
                Al confirmar, el backend iniciará la dosificación y registrará el consumo
                de los lotes vigentes según FEFO en una sola operación.
              </p>
              {consumptionError && (
                <p className="form-error" role="alert">
                  No se pudo registrar el consumo: {consumptionError}
                </p>
              )}
              {confirmingConsumption ? (
                <div className="required-materials-confirmation" role="group" aria-label="Confirmar consumo">
                  <span>
                    La orden cambiará a dosificación y se descontarán las existencias de los
                    lotes. ¿Deseas continuar?
                  </span>
                  <button
                    className="btn-secondary"
                    disabled={registeringConsumption}
                    onClick={() => setConfirmingConsumption(false)}
                    type="button"
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn-primary"
                    disabled={registeringConsumption}
                    onClick={handleRegisterConsumption}
                    type="button"
                  >
                    {registeringConsumption
                      ? 'Procesando consumo...'
                      : 'Confirmar dosificación y consumo'}
                  </button>
                </div>
              ) : (
                <button
                  className="btn-primary required-materials-register-button"
                  onClick={() => {
                    setConsumptionError('')
                    setConfirmingConsumption(true)
                  }}
                  type="button"
                >
                  Iniciar dosificación y registrar consumo
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default RequiredMaterialsModal