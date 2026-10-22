import { cookies } from "next/headers";
import type { Metadata } from "next";
import AdminLogin from "@/components/AdminLogin";
import AdminPanel from "@/components/AdminPanel";
import {
  ADMIN_COOKIE,
  adminConfigured,
  verifySessionToken,
} from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin — Mesa Serena",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const store = await cookies();
  const authed = verifySessionToken(store.get(ADMIN_COOKIE)?.value);

  return (
    <main className="admin-shell">
      <div className="thanks-brand">
        <span className="brand-mark" aria-hidden="true" />
        Mesa Serena · Admin
      </div>
      {!adminConfigured() ? (
        <section className="admin-card">
          <h1>Falta configurar el admin</h1>
          <p className="lead">
            Crea las variables <code>ADMIN_USER</code> y{" "}
            <code>ADMIN_PASSWORD</code> en el entorno (en Vercel: Settings →
            Environment Variables) y vuelve a entrar.
          </p>
        </section>
      ) : authed ? (
        <AdminPanel />
      ) : (
        <AdminLogin />
      )}
    </main>
  );
}
