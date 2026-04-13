"use client";

import { Target } from "lucide-react";

interface ProbabilitiesConeProps {
  data?: {
    backlogSize: number;
    p50Weeks: number;
    p85Weeks: number;
    p95Weeks: number;
  };
}

export function ProbabilitiesCone({ data }: ProbabilitiesConeProps) {
  if (!data) {
    return (
      <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden h-full min-h-[300px]">
        <Target className="text-gray-200 mb-4" size={48} />
        <h3 className="text-sm font-bold text-gray-900 mb-2">Cone de Incerteza (Monte Carlo)</h3>
        <p className="text-xs text-gray-400 max-w-[200px]">
          Dados insuficientes para projeção. É necessário ter itens no Backlog e histórico recente de vazão.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm h-full flex flex-col justify-between">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#F5F4FF] flex items-center justify-center">
          <Target className="text-[#534AB7]" size={20} />
        </div>
        <div>
          <h3 className="text-[10px] font-extrabold text-[#534AB7] uppercase tracking-widest">
            Cone de Incerteza (Monte Carlo)
          </h3>
          <p className="text-xl font-serif text-gray-900 leading-none mt-1">
            Previsão para {data.backlogSize} itens no Backlog
          </p>
        </div>
      </div>

      <div className="relative pt-8 pb-4 px-4 overflow-hidden">
        {/* The Cone Visual */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <svg preserveAspectRatio="none" viewBox="0 0 100 100" className="w-full h-full">
            <polygon points="0,50 100,0 100,100" fill="#534AB7" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex justify-between items-center group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-100 shadow-sm flex items-center justify-center font-bold text-gray-500 group-hover:border-[#534AB7] group-hover:text-[#534AB7] transition-colors">
                50%
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">Otimista</div>
                <div className="text-[10px] uppercase text-gray-400 font-extrabold tracking-wider">Alta Incerteza</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-serif font-bold text-gray-900">{Math.ceil(data.p50Weeks)}</div>
              <div className="text-xs uppercase font-bold text-gray-400">Semanas</div>
            </div>
          </div>

          <div className="flex justify-between items-center group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white border-2 border-[#534AB7] shadow-sm flex items-center justify-center font-bold text-[#534AB7] bg-[#F5F4FF]">
                85%
              </div>
              <div>
                <div className="text-sm font-bold text-[#534AB7]">Provável (Compromisso)</div>
                <div className="text-[10px] uppercase text-[#534AB7]/70 font-extrabold tracking-wider">Risco Moderado</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-serif font-bold text-[#534AB7]">{Math.ceil(data.p85Weeks)}</div>
              <div className="text-xs uppercase font-bold text-[#534AB7]/70">Semanas</div>
            </div>
          </div>

          <div className="flex justify-between items-center group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-100 shadow-sm flex items-center justify-center font-bold text-gray-500 group-hover:border-gray-900 group-hover:text-gray-900 transition-colors">
                95%
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">Conservador</div>
                <div className="text-[10px] uppercase text-gray-400 font-extrabold tracking-wider">Alta Confiança</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-serif font-bold text-gray-900">{Math.ceil(data.p95Weeks)}</div>
              <div className="text-xs uppercase font-bold text-gray-400">Semanas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
