"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      if (!response.ok) {
        setError(data.message || "Usuario o contraseña incorrectos.");
        return;
      }
      router.refresh();
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="admin-card admin-login">
      <p className="kicker">Panel privado</p>
      <h1>Compras de Mesa Serena</h1>
      <p className="lead">
        Entra con tu usuario y contraseña para ver quién compró, su correo y
        todo lo que llega al webhook de Skylink.
      </p>
      <form className="checkout" onSubmit={onSubmit}>
        <label htmlFor="admin-user">Usuario</label>
        <input
          id="admin-user"
          autoComplete="username"
          value={user}
          onChange={(event) => setUser(event.target.value)}
          placeholder="admin"
          required
        />
        <label htmlFor="admin-password">Contraseña</label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Tu contraseña de admin"
          required
        />
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Entrando…" : "Entrar al panel"}
        </button>
      </form>
    </section>
  );
}
