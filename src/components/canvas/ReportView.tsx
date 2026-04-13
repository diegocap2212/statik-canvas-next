"use client";

import { CheckCircle2, AlertCircle, ArrowRight, Zap, Target, TrendingUp } from "lucide-react";

interface Session {
  productName: string;
  facilitator?: string | null;
  context?: string | null;
  createdAt: Date | string;
  data?: any;
  diagnosis?: any;
}

interface ReportViewProps {
  session: Session;
  svgMarkup: string;
}

export function ReportView({ session, svgMarkup }: ReportViewProps) {
  const date = new Date(session.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const diagnosis = session.diagnosis || {
    overview: "Diagnóstico completo da sessão STATIK.",
    patterns: [],
    nextsteps: [],
  };

  return (
    <div className="print-only">
      {/* PAGE 1: COVER & VISUAL CANVAS */}
      <div className="print-page min-h-screen flex flex-col">
        <header className="mb-20">
          <div className="flex justify-between items-start mb-12">
            <div>
              <p className="text-[10px] font-bold text-[#534AB7] uppercase tracking-[0.2em] mb-4">Relatrio Executivo STATIK</p>
              <h1 className="text-6xl font-serif text-gray-900 leading-tight">{session.productName}</h1>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">{date}</p>
              <p className="text-xs text-gray-400 mt-1">Sessão IA Statik</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-12 border-t border-gray-100 pt-12">
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Target size={12} className="text-[#534AB7]" /> Propósito do Serviço
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed font-serif italic">
                "{session.data?.steps?.s1Purpose || "Não informado"}"
              </p>
            </div>
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Zap size={12} className="text-[#EF9F27]" /> Contexto
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {session.context || "Não detalhado"}
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col justify-center border border-gray-100 rounded-[2rem] p-12 bg-white shadow-sm">
           <div className="mb-8 text-center">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Visual Diagnostic Canvas</h2>
           </div>
           <div 
             className="w-full"
             dangerouslySetInnerHTML={{ __html: svgMarkup }} 
           />
        </div>

        <footer className="mt-12 flex justify-between items-center pt-8 border-t border-gray-100">
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Pag. 01</span>
           <span className="text-[10px] font-bold text-[#1D9E75] uppercase tracking-[0.2em]">Facilitado por {session.facilitator || "Statik IA"}</span>
        </footer>
      </div>

      {/* PAGE 2: DIAGNOSIS & ACTION PLAN */}
      <div className="print-page min-h-screen flex flex-col">
        <div className="mb-20">
          <p className="text-[10px] font-bold text-[#534AB7] uppercase tracking-[0.2em] mb-4">Insights e Direcionamento</p>
          <h2 className="text-4xl font-serif text-gray-900">Síntese do Sistema</h2>
        </div>

        <div className="space-y-12">
          {/* Overview Section */}
          <section className="bg-[#F5F4FF] rounded-3xl p-10 border border-[#AFA9EC]/30">
            <h3 className="text-[10px] font-bold text-[#534AB7] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Bot size={14} /> Visão Geral da IA
            </h3>
            <p className="text-xl text-[#3C3489] leading-relaxed font-serif">
              {diagnosis.overview}
            </p>
          </section>

          <div className="grid grid-cols-2 gap-12">
            {/* Patterns Section */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle size={14} className="text-[#D85A30]" /> Padrões Observados
              </h3>
              <div className="space-y-4">
                {diagnosis.patterns.map((p: string, i: number) => (
                  <div key={i} className="flex gap-4 items-start bg-white p-5 rounded-2xl border border-gray-50">
                    <div className="w-5 h-5 rounded-full bg-orange-50 text-[#D85A30] flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-700 leading-normal">{p}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Next Steps Section */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={14} className="text-[#1D9E75]" /> Plano de Ação (Próximos Passos)
              </h3>
              <div className="space-y-4">
                {diagnosis.nextsteps.map((n: string, i: number) => (
                  <div key={i} className="flex gap-4 items-start bg-[#E1F5EE] p-5 rounded-2xl border border-[#5DCAA5]/30">
                    <CheckCircle2 size={18} className="text-[#1D9E75] flex-shrink-0" />
                    <p className="text-sm text-[#085041] font-medium leading-normal">{n}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="mt-auto bg-gray-50 p-8 rounded-[2rem] border border-gray-100 flex items-center gap-6 no-print-hide">
           <Zap className="text-yellow-500 fill-yellow-500" size={24} />
           <div>
              <p className="text-xs font-bold text-gray-900 mb-1 leading-none uppercase">Dica do Especialista</p>
              <p className="text-[11px] text-gray-500 italic leading-normal">
                Este diagnóstico é baseado nas práticas do Kanban Maturity Model (KMM). Comece focando na estabilização do fluxo antes de otimizar a capacidade.
              </p>
           </div>
        </div>

        <footer className="mt-12 flex justify-between items-center pt-8 border-t border-gray-100">
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Pag. 02</span>
           <span className="text-[10px] font-bold text-[#534AB7] uppercase tracking-[0.2em]">Statik Session Report</span>
        </footer>
      </div>
    </div>
  );
}

function Bot({ size = 20 }: { size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}
