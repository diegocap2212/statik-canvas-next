"use client";

import { Layers } from "lucide-react";

interface DemographicsItem {
  type: string;
  count: number;
}

interface DemographicsBoardProps {
  data: {
    done: DemographicsItem[];
    wip: DemographicsItem[];
    todo: DemographicsItem[];
  };
}

const COLORS = [
  "#534AB7", // Purple
  "#1D9E75", // Green
  "#BA7517", // Orange
  "#D85A30", // Red Orange
  "#28B6D4", // Cyan
  "#6B7280", // Gray
];

export function DemographicsBoard({ data }: DemographicsBoardProps) {
  // Sort and prep data
  const prepData = (items: DemographicsItem[]) => {
    const total = items.reduce((acc, curr) => acc + curr.count, 0);
    return items
      .sort((a, b) => b.count - a.count)
      .map((item, idx) => ({
        ...item,
        percent: total > 0 ? (item.count / total) * 100 : 0,
        color: COLORS[idx % COLORS.length],
      }));
  };

  const doneList = prepData(data.done);
  const wipList = prepData(data.wip);
  const todoList = prepData(data.todo);

  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-2 mb-8">
        <Layers className="text-gray-400" size={16} />
        <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
          Perfil da Demanda
        </h3>
      </div>

      <div className="flex-1 space-y-8">
        <DemographicSection title="Concluídos (Vazão Histórica)" total={data.done.reduce((a, b) => a + b.count, 0)} items={doneList} />
        <DemographicSection title="Em Andamento (WIP Atual)" total={data.wip.reduce((a, b) => a + b.count, 0)} items={wipList} />
        <DemographicSection title="Backlog (Fila)" total={data.todo.reduce((a, b) => a + b.count, 0)} items={todoList} />
      </div>
    </div>
  );
}

function DemographicSection({ title, total, items }: { title: string; total: number; items: any[] }) {
  if (total === 0) return null;

  return (
    <div>
      <div className="flex justify-between items-baseline mb-3">
        <h4 className="text-sm font-bold text-gray-800">{title}</h4>
        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{total} itens</span>
      </div>
      
      {/* Visual Stacked Bar */}
      <div className="w-full h-3 bg-gray-100 rounded-full flex overflow-hidden mb-3 gap-[1px]">
        {items.map((item) => (
          <div 
            key={item.type} 
            style={{ width: `${item.percent}%`, backgroundColor: item.color }} 
            className="h-full transition-all duration-500 hover:opacity-80"
            title={`${item.type}: ${item.count} (${item.percent.toFixed(1)}%)`}
          />
        ))}
      </div>

      {/* Legend Chips minimal */}
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {items.map((item) => (
          <div key={item.type} className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-gray-500 font-medium truncate max-w-[100px]">{item.type}</span>
            <span className="text-gray-900 font-extrabold">{item.count}</span>
            <span className="text-gray-400 text-[10px]">({Math.round(item.percent)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
