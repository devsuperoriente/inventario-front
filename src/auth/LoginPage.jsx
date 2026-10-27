import { useState } from "react";
import { useAuth } from "./useAuth.js";

function LoginPage({ connectionError }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({
        username: username.trim(),
        password,
      });
    } catch (loginError) {
      if (loginError.status === 401) {
        setError("El usuario o la contraseña son incorrectos.");
      } else if (loginError.status === 404) {
        setError("El backend no tiene configurada la ruta POST /auth/login.");
      } else {
        setError(loginError.message || "No fue posible iniciar sesión.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand">
          <span className="brand-mark" aria-hidden="true">
            P
          </span>
          <span>
            <strong>PanControl</strong>
            <small>Inventario de planta</small>
          </span>
        </div>

        <p className="eyebrow">ACCESO AL SISTEMA</p>
        <h1 id="login-title">Inicia sesión</h1>
        <p className="login-description">
          Ingresa con tu cuenta para acceder a las funcionalidades autorizadas.
        </p>

        {connectionError && (
          <div className="login-connection-warning" role="status">
            <p>No se pudo renovar la sesión existente.</p>
            <small>{connectionError}</small>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            Usuario o correo electrónico
            <input
              autoComplete="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Usuario o nombre@empresa.com"
              required
            />
          </label>
          <label className="login-field">
            Contraseña
            <input
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ingresa tu contraseña"
              required
            />
          </label>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="btn-primary login-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Validando acceso..." : "Ingresar"}
          </button>
        </form>
        <p className="login-security-note">
          Tus permisos de acceso son administrados por tu organización.
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
