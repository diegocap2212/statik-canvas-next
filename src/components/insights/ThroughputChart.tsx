"use client";

interface ThroughputChartProps {
  data: { label: string; count: number }[];
}

export function ThroughputChart({ data }: ThroughputChartProps) {
  const max = Math.max(...data.map(d => d.count), 1);
  const H = 200;
  const W = 800;
  const PAD = 40;
  const chartW = W - PAD * 2;
  const chartH = H - PAD * 2;
  const barW = Math.floor(chartW / data.length) - 10;

  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm overflow-hidden">
      <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-8">Throughput Semanal (Últimas 12 Semanas)</h3>
      
      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto min-w-[600px]">
          {/* Y Axis Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
            <line 
              key={i}
              x1={PAD} 
              y1={PAD + chartH * (1 - p)} 
              x2={W - PAD} 
              y2={PAD + chartH * (1 - p)} 
              stroke="#F1EFE8" 
              strokeWidth="1"
            />
          ))}

          {/* Bars */}
          {data.map((d, i) => {
            const h = (d.count / max) * chartH;
            const x = PAD + i * (chartW / data.length) + (chartW / data.length - barW) / 2;
            const y = PAD + chartH - h;

            return (
              <g key={i}>
                <rect 
                  x={x} 
                  y={y} 
                  width={barW} 
                  height={h} 
                  fill="#1D9E75" 
                  rx="6"
                  className="transition-all duration-500 hover:fill-[#157A5A]"
                />
                <text 
                  x={x + barW / 2} 
                  y={H - 15} 
                  textAnchor="middle" 
                  fontSize="10" 
                  fill="#888780" 
                  fontWeight="bold"
                >
                  {d.label}
                </text>
                {d.count > 0 && (
                  <text 
                    x={x + barW / 2} 
                    y={y - 8} 
                    textAnchor="middle" 
                    fontSize="11" 
                    fill="#1D9E75" 
                    fontWeight="extrabold"
                  >
                    {d.count}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
