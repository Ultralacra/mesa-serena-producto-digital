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
    "Para la que cocina en casa: 50 recetas venezolanas para diabetes. Arepa, pabellón y pollo del mercado, sin que se te dispare. 5 USD a tasa BCV. El recetario llega a tu correo.",
  openGraph: {
    title: "Mesa Serena — Recetario criollo para diabetes",
    description:
      "Come lo de tu casa sin que se te dispare. 50 recetas con lo de tu mercado, para la que cocina todos los días. 5 USD a tasa BCV. El recetario llega a tu correo.",
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
