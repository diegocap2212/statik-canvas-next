"use client";

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  percentiles?: { p50: number; p85: number; p95: number };
  description?: string;
  color?: string;
}

export function MetricCard({ title, value, unit, percentiles, description, color = "#534AB7" }: MetricCardProps) {
  const formattedValue = value % 1 === 0 ? value.toString() : value.toFixed(1);

  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{title}</h3>
        <div 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: color }}
        />
      </div>
      
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-4xl font-serif font-bold text-gray-900">{formattedValue}</span>
        <span className="text-sm font-bold text-gray-400 uppercase tracking-tighter">{unit}</span>
      </div>

      {description && (
        <p className="text-xs text-gray-400 mb-6 font-medium">{description}</p>
      )}

      {percentiles && (
        <div className="grid grid-cols-3 gap-2 pt-6 border-t border-gray-50">
          <div className="text-center">
            <div className="text-[9px] font-bold text-gray-300 uppercase mb-1">p50</div>
            <div className="text-sm font-bold text-gray-700">{percentiles.p50.toFixed(1)}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] font-bold text-gray-300 uppercase mb-1">p85</div>
            <div className="text-sm font-extrabold text-[#534AB7]">{percentiles.p85.toFixed(1)}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] font-bold text-gray-300 uppercase mb-1">p95</div>
            <div className="text-sm font-bold text-gray-700">{percentiles.p95.toFixed(1)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
