import { useEffect } from 'react'

function Toast({ message, type = 'success', onClose, duration = 4500 }) {
  const isUrgent = type === 'error' || type === 'warning'

  useEffect(() => {
    if (!message || duration <= 0) return undefined

    const timeoutId = window.setTimeout(onClose, duration)
    return () => window.clearTimeout(timeoutId)
  }, [duration, message, onClose])

  if (!message) return null

  return (
    <div
      className={`toast toast-${type}`}
      role={isUrgent ? 'alert' : 'status'}
      aria-live={isUrgent ? 'assertive' : 'polite'}
    >
      <span className="toast-icon" aria-hidden="true">
        {type === 'success' ? '✓' : type === 'warning' ? '⚠' : type === 'error' ? '!' : 'i'}
      </span>

      <p>{message}</p>

      <button
        type="button"
        className="toast-close"
        onClick={onClose}
        aria-label="Cerrar notificación"
      >
        ×
      </button>
      {duration > 0 && <span aria-hidden="true" className="toast-progress" style={{ '--toast-duration': `${duration}ms` }} />}
    </div>
  )
}

export default Toast
