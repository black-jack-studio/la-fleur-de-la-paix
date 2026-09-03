import type { Metadata } from "next";
import { Pinyon_Script, Spectral } from "next/font/google";
import "./globals.css";

const pinyon = Pinyon_Script({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
});

const spectral = Spectral({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "La Fleur de la Paix — Fleuriste événementiel & mariage",
  description:
    "Fleuriste événementiel. Composez votre devis en quelques clics avant de contacter l'atelier.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${pinyon.variable} ${spectral.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
