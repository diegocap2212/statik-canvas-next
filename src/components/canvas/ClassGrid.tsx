"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const CLASSES = [
  {
    id: "expedite",
    label: "EXPEDITE",
    title: "Urgente / Crítico",
    desc: "Fura a fila. Impacto imediato se não for feito agora.",
    color: "#D85A30",
  },
  {
    id: "fixed-date",
    label: "DATA FIXA",
    title: "Com Prazo",
    desc: "Multas, eventos ou compromissos externos com data rígida.",
    color: "#EF9F27",
  },
  {
    id: "standard",
    label: "PADRÃO",
    title: "Fluxo Normal",
    desc: "Demandas do dia a dia. Chegam e entram na fila.",
    color: "#534AB7",
  },
  {
    id: "intangible",
    label: "INTANGÍVEL",
    title: "Melhoria",
    desc: "Custo do atraso baixo hoje, mas alto no longo prazo (ex: refatoração).",
    color: "#6B6B67",
  },
];

interface ClassGridProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function ClassGrid({ selected, onChange }: ClassGridProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {CLASSES.map((cls) => {
        const isActive = selected.includes(cls.id);
        return (
          <button
            key={cls.id}
            onClick={() => toggle(cls.id)}
            className={cn(
              "text-left p-6 rounded-2xl bg-white border-2 transition-all group relative",
              isActive 
                ? "border-[#534AB7] bg-[#F5F4FF] shadow-lg scale-[1.02]" 
                : "border-gray-100 hover:border-[#AFA9EC] shadow-sm hover:-translate-y-1"
            )}
          >
            <div 
              className="inline-block px-2.5 py-1 rounded-md text-[10px] font-extrabold text-white mb-4"
              style={{ backgroundColor: cls.color }}
            >
              {cls.label}
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{cls.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              {cls.desc}
            </p>

            {isActive && (
              <div className="absolute top-4 right-4 text-[#534AB7]">
                <Check size={20} strokeWidth={3} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
