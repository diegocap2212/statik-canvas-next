"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Bot, LayoutDashboard } from "lucide-react";
import { createSession } from "./actions";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const product = formData.get("product") as string;
    const facilitator = formData.get("facilitator") as string;
    const context = formData.get("context") as string;

    try {
      const session = await createSession(product, facilitator, context);
      router.push(`/session/${session.id}`);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-[#F5F4FF] text-[#534AB7] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
          <Sparkles size={40} />
        </div>
        
        <h1 className="text-4xl font-serif text-gray-900 mb-2">IA Statik Canvas</h1>
        <p className="text-gray-400 font-bold text-[10px] tracking-[0.2em] uppercase mb-12">Powered By Diego Caporusso</p>

        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 text-left space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Produto ou Serviço</label>
            <input 
              name="product"
              required
              className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#534AB7]/20 transition-all font-medium"
              placeholder="Ex: App de Logística"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Facilitador</label>
              <input 
                name="facilitator"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#534AB7]/20 transition-all font-medium"
                placeholder="Seu nome"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Data</label>
              <input 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none text-gray-300 font-medium cursor-default"
                value={new Date().toLocaleDateString("pt-BR")}
                readOnly
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Contexto Adicional</label>
            <textarea 
              name="context"
              rows={3}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#534AB7]/20 transition-all font-medium resize-none"
              placeholder="Descreva o momento do time..."
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#534AB7] text-white py-5 rounded-[2rem] font-bold shadow-lg shadow-[#534AB7]/20 hover:bg-[#4339A3] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Iniciando..." : <span>Iniciar Sessão <ArrowRight size={20} className="inline ml-1" /></span>}
          </button>
        </form>

        <Link 
            href="/dashboard"
            className="mt-12 inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#534AB7] transition-colors"
        >
            <LayoutDashboard size={18} /> Ver histórico de sessões
        </Link>
      </div>
    </main>
  );
}
