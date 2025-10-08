import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deliberate Guitar",
  description: "Tracking de práctica deliberada de guitarra",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
