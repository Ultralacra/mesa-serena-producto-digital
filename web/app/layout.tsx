import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import "./globals.css";

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: "Mesa Serena — Recetario de comida casera para diabetes",
  description:
    "Para la que cocina en casa y quiere dejar de improvisar: 50 recetas caseras con sabores venezolanos, menú de 7 días y lista de mercado. 5 USD a tasa BCV. El recetario llega a tu correo.",
  openGraph: {
    title: "Mesa Serena — Recetario de comida casera para diabetes",
    description:
      "Come lo de tu casa con más calma y mejor criterio. 50 recetas caseras con sabores venezolanos, menú semanal y guías prácticas. 5 USD a tasa BCV. El recetario llega a tu correo.",
    locale: "es_VE",
    type: "website",
    images: ["/img/ebook.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
