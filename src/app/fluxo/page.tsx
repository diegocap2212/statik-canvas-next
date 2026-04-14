"use client";

import { FlowHeader } from "@/components/fluxo/FlowHeader";
import { EpicBoard } from "@/components/fluxo/EpicBoard";
import { KanbanSection } from "@/components/fluxo/KanbanSection";
import { motion } from "framer-motion";

export default function FlowExplanationPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-24">
      <div className="max-w-[1400px] mx-auto px-8 pt-12">
        
        {/* Entrance Animation Wrapper */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <FlowHeader />
          
          <div className="space-y-12">
            <EpicBoard />
            
            <div className="relative py-8">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-100 italic" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#FAFAF8] px-6 text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">
                  Transição Estratégica para Operacional
                </span>
              </div>
            </div>

            <KanbanSection />
          </div>

          <footer className="mt-24 pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-serif font-bold text-xs">
                S
              </div>
              <div className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">
                Statik Canvas · Referência de Processo · 2025
              </div>
            </div>
            
            <div className="flex gap-8 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
              <span>Upstream & Downstream</span>
              <span>FL 2 → FL 1</span>
            </div>
          </footer>
        </motion.div>

      </div>
    </div>
  );
}
