"use client";

import { Bot, Sparkles, ChevronRight } from "lucide-react";

interface Opportunity {
  title: string;
  description: string;
  statikStep: string;
}

interface OpportunityPanelProps {
  opportunities: Opportunity[];
  summary: string;
  loading?: boolean;
}

export function OpportunityPanel({ opportunities, summary, loading }: OpportunityPanelProps) {
  if (loading) {
    return (
      <div className="bg-[#534AB7] border border-[#3C3489] rounded-[2rem] p-12 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 text-[10px] font-extrabold text-white/60 uppercase tracking-widest mb-6">
          <Bot size={14} />
          <span>Análise Estratégica Stitch</span>
          <Sparkles size={10} className="animate-pulse" />
        </div>
        <div className="flex gap-2 items-center text-white/80 font-serif text-xl">
           Processando métricas e identificando alavancas...
           <span className="flex gap-1 ml-4 mt-1">
             <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
             <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
             <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
           </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#F5F4FF] border border-[#AFA9EC] rounded-[2rem] p-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Bot size={120} className="text-[#534AB7]" />
        </div>

        <div className="flex items-center gap-2 text-[10px] font-extrabold text-[#534AB7] uppercase tracking-widest mb-6 relative z-10 transition-colors">
          <Bot size={14} />
          <span>Síntese de Saúde do Fluxo</span>
        </div>

        <p className="text-xl font-serif text-[#1A1A18] leading-relaxed relative z-10 italic">
          "{summary}"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {opportunities.slice(0, 3).map((op, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-lg transition-all border-l-4 border-l-[#534AB7]">
            <div className="text-[9px] font-extrabold text-[#534AB7] bg-[#EEEDFE] px-3 py-1 rounded-full uppercase tracking-widest w-fit mb-6">
              STATIK: {op.statikStep}
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">{op.title}</h4>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">{op.description}</p>
            <div className="flex items-center gap-1 text-[10px] font-extrabold text-[#534AB7] uppercase cursor-pointer hover:underline">
              <span>Focar nesta etapa</span>
              <ChevronRight size={10} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
