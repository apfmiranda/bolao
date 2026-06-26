import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Bolão Copa 2026 🇧🇷 — Jogos do Brasil",
  description:
    "Bolão familiar para os jogos da Seleção Brasileira na Copa do Mundo 2026. Faça seus palpites!",
  keywords: ["bolão", "copa 2026", "brasil", "palpites", "futebol"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${outfit.className} font-outfit`}>{children}</body>
    </html>
  );
}
