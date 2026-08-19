import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deliberate Guitar - Práctica Deliberada",
  description: "Aplicación personal de tracking de práctica deliberada de guitarra. Growth Mindset + Kaizen. Registra sesiones, analiza tu progreso y celebra cada mejora.",
  keywords: ["guitarra", "práctica deliberada", "growth mindset", "kaizen", "tracking", "progreso"],
  authors: [{ name: "Deliberate Guitar" }],
  creator: "Deliberate Guitar",
  robots: "noindex, nofollow", // Uso personal, no indexar
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FF00FF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
