"use client";

import { motion } from "framer-motion";

export function FlowHeader() {
  return (
    <motion.header 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-10 md:p-12 mb-8 shadow-2xl shadow-purple-500/5 group"
    >
      {/* Animated Glow Backgrounds */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#1D9E75]/10 rounded-full blur-[80px] group-hover:bg-[#1D9E75]/20 transition-colors duration-1000" />
      <div className="absolute -bottom-24 -left-12 w-64 h-64 bg-[#534AB7]/10 rounded-full blur-[60px] group-hover:bg-[#534AB7]/20 transition-colors duration-1000" />

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-[#1D9E75] rounded-sm rotate-45 shadow-[0_0_15px_rgba(29,158,117,0.5)]" />
            <span className="font-serif text-2xl font-bold text-gray-900 tracking-tight">
              ót<em className="not-italic text-[#1D9E75]">mow</em>
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-serif text-gray-900 leading-[1.1] tracking-tight">
            Modelo de <span className="text-[#1D9E75]">fluxo</span> <br className="hidden md:block" />
            de produto
          </h1>

          <div className="flex items-center gap-3 text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">
            <span>FL 2</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span>FL 1</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span className="text-[#534AB7]">Statik Canvas</span>
          </div>
        </div>

        <div className="text-right space-y-2 md:pb-2">
          <div className="inline-block px-4 py-1 bg-[#534AB7]/5 border border-[#534AB7]/10 rounded-full text-[10px] font-bold text-[#534AB7] uppercase tracking-widest mb-4">
            Referência de Processo
          </div>
          <div className="text-gray-900 font-bold text-lg">Ótmow</div>
          <div className="text-gray-400 text-sm font-medium">
            Abril 2025 · v1.2<br />
            Alinhamento Estratégico
          </div>
        </div>
      </div>
    </motion.header>
  );
}
