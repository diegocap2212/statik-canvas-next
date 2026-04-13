import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import Link from "next/link";
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
        <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 px-8 flex items-center justify-between">
          <div className="font-serif text-lg text-[#534AB7] font-bold">STATIK IA</div>
          <div className="flex gap-8">
            <Link href="/dashboard" className="text-sm font-bold text-gray-400 hover:text-[#534AB7] transition-colors uppercase tracking-wider">Sessões</Link>
            <Link href="/insights" className="text-sm font-bold text-gray-400 hover:text-[#534AB7] transition-colors uppercase tracking-wider">Insights do Fluxo</Link>
          </div>
        </nav>
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
