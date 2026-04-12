import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "IA Statik Canvas — Powered By Diego Caporusso",
  description: "Co-facilitador IA para sessões STATIK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${dmSans.variable} ${dmSerif.variable} antialiased`}
    >
      <body className="min-h-screen bg-[#FAFAF8] text-[#1A1A18] font-sans">
        {children}
      </body>
    </html>
  );
}
