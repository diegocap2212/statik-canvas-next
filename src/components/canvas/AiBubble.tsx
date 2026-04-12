"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";

interface AiBubbleProps {
  content?: string;
  loading?: boolean;
}

export function AiBubble({ content, loading }: AiBubbleProps) {
  const visible = !!(content || loading);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#F5F4FF] border border-[#AFA9EC] rounded-2xl p-6 mb-12 relative overflow-hidden"
        >
          <div className="flex items-center gap-2 text-[10px] font-extrabold text-[#534AB7] uppercase tracking-wider mb-3">
            <Bot size={14} />
            <span>STITCH — OBSERVAÇÃO</span>
            {loading && <Sparkles size={10} className="animate-pulse" />}
          </div>

          <div className="text-[15px] text-[#1A1A18] leading-relaxed">
            {loading ? (
              <div className="flex gap-1 items-center py-2 text-muted-foreground">
                 Pensando sistemicamente
                 <span className="flex gap-0.5 ml-2">
                   <span className="w-1.5 h-1.5 bg-[#534AB7] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                   <span className="w-1.5 h-1.5 bg-[#534AB7] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                   <span className="w-1.5 h-1.5 bg-[#534AB7] rounded-full animate-bounce"></span>
                 </span>
              </div>
            ) : (
              <p className="font-medium italic">{content}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
