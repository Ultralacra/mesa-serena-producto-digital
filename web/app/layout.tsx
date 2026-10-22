import type { Metadata } from "next";
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
  title: "Mesa Serena — Recetario criollo para diabetes",
  description:
    "50 recetas venezolanas para diabetes. Arepa, pabellón y pollo del mercado, para todos los bolsillos. 5 USD a tasa BCV. Pago con Skylink Pay. Recetario al correo.",
  openGraph: {
    title: "Mesa Serena — Recetario criollo para diabetes",
    description:
      "Come criollo, sin pico y sin comprar como rico. 50 recetas. 5 USD a tasa BCV. El recetario llega a tu correo.",
    locale: "es_VE",
    type: "website",
    images: ["/img/ebook.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
