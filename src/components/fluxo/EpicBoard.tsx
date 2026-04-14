"use client";

import { motion } from "framer-motion";
import { Info, Diamond, AlertCircle, CheckCircle2 } from "lucide-react";

const COLUMNS = [
  {
    title: "Ideação",
    tasks: ["Capturar demandas brutas", "Registrar contexto e origem", "Classificar por frente"],
    exit: ["Problema declarado", "Frente identificada", "PO responsável alocado"],
    color: "purple"
  },
  {
    title: "Discovery",
    tasks: ["Entrevistas e mapeamento", "Análise de viabilidade", "Hipóteses e métricas"],
    exit: ["Problema validado", "Métrica de sucesso", "Hipótese documentada"],
    color: "purple"
  },
  {
    title: "Design",
    tasks: ["Fluxos e wireframes", "Validação com usuário", "Definição de escopo"],
    exit: ["Solução validada/descartada", "Escopo fechado", "Protótipo aprovado"],
    color: "purple"
  },
  {
    title: "Refin. tech",
    tasks: ["Análise com Feature Lead", "Estimativa de esforço", "Mapear dependências"],
    exit: ["Esforço estimado", "Dependências mapeadas", "Squad e raia definidas"],
    color: "purple"
  },
  {
    title: "Pronto p/ dev",
    isGate: true,
    criteria: [
      "DOR 100% preenchida",
      "Stories quebradas/estimadas",
      "Classe de serviço definida",
      "Squad alocada downstream",
      "WIP da raia tem espaço"
    ],
    color: "teal"
  },
  {
    title: "Em desenv.",
    tasks: ["Acompanhamento downstream", "Remoção impedimentos", "Revisão de métricas"],
    warning: "WIP atual: 12 (Limite: 4–5)",
    color: "gray"
  },
  {
    title: "Ag. aprovação",
    tasks: ["Validação stakeholder", "Homologação em prod", "Sign-off final"],
    exit: ["Aprovação registrada", "Métricas verificadas"],
    color: "gray"
  },
  {
    title: "Concluído",
    tasks: ["Retrospectiva do épico", "Apreendizados", "Atualização roadmap"],
    exit: ["Aprovação recebida", "Sucesso verificado"],
    color: "green"
  }
];

export function EpicBoard() {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-1 bg-gray-100 rounded-full">
          Nível FL 2
        </div>
        <h2 className="text-3xl font-serif text-gray-900">Esteira de Épicos & Discovery</h2>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm overflow-hidden relative">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-50">
          <div className="p-2 bg-purple-50 text-[#534AB7] rounded-xl">
            <Info size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Fluxo de Gestão de Produto</h3>
            <p className="text-sm text-gray-400 font-medium">O épico só entra para o FL1 após atravessar o gate de prontidão.</p>
          </div>
          
          <div className="ml-auto flex items-center gap-2 bg-[#534AB7]/5 px-4 py-2 rounded-2xl border border-[#534AB7]/10">
            <div className="w-2 h-2 bg-[#534AB7] rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-[#534AB7] uppercase tracking-wider">Zona PM: Discovery & DOR</span>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
          {COLUMNS.map((col, idx) => (
            <motion.div 
              key={col.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex-shrink-0 w-56 rounded-3xl p-5 border transition-all duration-300 ${
                col.isGate 
                  ? "bg-[#1D9E75]/5 border-[#1D9E75]/20 shadow-lg shadow-[#1D9E75]/5" 
                  : col.color === "green"
                  ? "bg-green-50/50 border-green-100"
                  : "bg-gray-50/50 border-gray-100 hover:bg-white hover:border-[#534AB7]/20 hover:shadow-xl hover:shadow-[#534AB7]/5"
              }`}
            >
              <div className={`text-[9px] font-bold uppercase tracking-widest mb-4 inline-block px-2 py-0.5 rounded ${
                col.color === "purple" ? "text-[#534AB7] bg-purple-50" : 
                col.color === "teal" ? "text-[#1D9E75] bg-teal-50" :
                col.color === "green" ? "text-green-600 bg-green-100" : "text-gray-400 bg-gray-100"
              }`}>
                {col.isGate ? "Quality Gate" : `Etapa ${idx + 1}`}
              </div>

              <h4 className={`text-sm font-bold mb-4 ${col.isGate ? "text-[#1D9E75]" : "text-gray-900"}`}>
                {col.title}
              </h4>

              {col.isGate && (
                <div className="flex flex-col items-center py-4 mb-4 bg-teal-50/50 rounded-2xl border border-teal-100/50">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1], rotate: [45, 45, 45] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-8 h-8 bg-[#1D9E75] rounded-sm transform shadow-lg shadow-teal-500/30 mb-2" 
                  />
                  <span className="text-[9px] font-bold text-[#1D9E75] uppercase tracking-tighter">Entrada p/ FL1</span>
                </div>
              )}

              <div className="space-y-4">
                {col.tasks && (
                  <div>
                    <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest block mb-2">Processo</span>
                    <ul className="space-y-1.5">
                      {col.tasks.map(t => (
                        <li key={t} className="text-[11px] text-gray-500 leading-tight flex gap-1.5">
                          <span className="text-[#534AB7] opacity-40 mt-0.5 font-bold">·</span> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {col.exit && (
                  <div>
                    <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest block mb-1.5">Exit Criteria</span>
                    <ul className="space-y-1">
                      {col.exit.map(e => (
                        <li key={e} className="text-[10px] text-gray-400 font-medium flex items-center gap-1.5 bg-white/50 p-1 rounded-md">
                          <CheckCircle2 size={10} className="text-gray-300" /> {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {col.criteria && (
                  <ul className="space-y-2">
                    {col.criteria.map(c => (
                      <li key={c} className="text-[10px] text-[#1D9E75] font-bold flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-teal-100">
                        <Diamond size={10} fill="currentColor" /> {c}
                      </li>
                    ))}
                  </ul>
                )}

                {col.warning && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl mt-4">
                    <div className="flex items-center gap-2 text-red-500 mb-1">
                      <AlertCircle size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Atenção</span>
                    </div>
                    <p className="text-[10px] text-red-700 font-medium leading-snug">{col.warning}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
