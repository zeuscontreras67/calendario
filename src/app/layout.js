import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Horario — organiza tu semana con IA",
  description:
    "Tu horario semanal inteligente: escribe pendientes en cada hora y pregúntale a la IA qué tienes que hacer.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
