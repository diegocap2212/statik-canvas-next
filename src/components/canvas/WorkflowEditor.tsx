"use client";

import { X, ArrowRight, Plus } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WorkflowEditorProps {
  stages: string[];
  onChange: (stages: string[]) => void;
}

export function WorkflowEditor({ stages, onChange }: WorkflowEditorProps) {
  const [newStage, setNewStage] = useState("");

  const addStage = () => {
    const val = newStage.trim();
    if (val && !stages.includes(val)) {
      onChange([...stages, val]);
      setNewStage("");
    }
  };

  const removeStage = (index: number) => {
    onChange(stages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 p-8 bg-white border-2 border-dashed border-gray-100 rounded-2xl min-h-[120px]">
        <AnimatePresence>
          {stages.map((stage, i) => (
            <div key={stage} className="flex items-center gap-4">
              {i > 0 && (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.5 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="text-gray-300"
                >
                  <ArrowRight size={20} />
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-[#534AB7] text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-3 shadow-md border-b-4 border-black/10 active:border-b-0 active:translate-y-1 transition-all"
              >
                {stage}
                <button onClick={() => removeStage(i)}>
                  <X size={16} className="hover:text-red-300 transition-colors" />
                </button>
              </motion.div>
            </div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex gap-3 max-w-sm">
        <input
          type="text"
          value={newStage}
          onChange={(e) => setNewStage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addStage()}
          placeholder="Nova etapa (ex: Em Revisão)"
          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#534AB7] transition-all"
        />
        <button 
          onClick={addStage}
          className="p-2 bg-[#534AB7] text-white rounded-xl hover:bg-[#4339A3] transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
}
