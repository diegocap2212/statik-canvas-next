"use client";

interface ThroughputChartProps {
  data: { 
    label: string; 
    count: number; 
    leadTime: number;
    byType: { [type: string]: number };
  }[];
}

const TYPE_COLORS: { [key: string]: string } = {
  "Bug": "#EF4444",      // Vermelho
  "Tarefa": "#3B82F6",   // Azul
  "Task": "#3B82F6",     // Azul (eng)
  "História": "#10B981", // Verde
  "User Story": "#10B981", // Verde (eng)
  "Story": "#10B981",    // Verde (short)
  "US": "#10B981",       // Verde (abbr)
};

const DEFAULT_COLOR = "#94A3B8"; // Cinza para outros

export function ThroughputChart({ data }: ThroughputChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const maxLt = Math.max(...data.map(d => d.leadTime), 5);
  const H = 300;
  const W = 800;
  const PAD = 50;
  const chartW = W - PAD * 2;
  const chartH = H - PAD * 2 - 40; // Extra padding for labels
  const barW = Math.floor(chartW / data.length) - 10;

  // Generate points for Lead Time curve
  const points = data.map((d, i) => {
    const x = PAD + i * (chartW / data.length) + (chartW / data.length) / 2;
    const y = PAD + chartH - (d.leadTime / maxLt) * chartH;
    return `${x},${y}`;
  }).join(" ");

  // Collect all types for the legend
  const allTypes = Array.from(new Set(data.flatMap(d => Object.keys(d.byType))));

  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm overflow-hidden relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
           <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Vazão por Tipo de Item</h3>
           <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Últimas 12 Semanas</p>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[9px] font-extrabold text-gray-400 uppercase">
           {allTypes.map(type => (
              <span key={type} className="flex items-center gap-1.5">
                 <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: TYPE_COLORS[type] || DEFAULT_COLOR }}></div>
                 {type}
              </span>
           ))}
           <span className="flex items-center gap-1.5 ml-2 border-l pl-4 border-gray-100 italic">
              <div className="w-2 h-2 rounded-full bg-[#534AB7] opacity-80"></div> Lead Time
           </span>
        </div>
      </div>
      
      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto min-w-[600px]">
          {/* Y Axis Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
            <g key={`grid-${i}`}>
              <line 
                x1={PAD} 
                y1={PAD + chartH * (1 - p)} 
                x2={W - PAD} 
                y2={PAD + chartH * (1 - p)} 
                stroke="#F9F8F6" 
                strokeWidth="1"
              />
            </g>
          ))}

          {/* Stacked Bars */}
          {data.map((d, i) => {
            const x = PAD + i * (chartW / data.length) + (chartW / data.length - barW) / 2;
            let currentY = PAD + chartH;

            return (
              <g key={`bar-group-${i}`}>
                {Object.entries(d.byType).map(([type, count]) => {
                  const barH = (count / maxCount) * chartH;
                  const barY = currentY - barH;
                  currentY = barY; // Stack up

                  return (
                    <rect 
                      key={`${i}-${type}`}
                      x={x} 
                      y={barY} 
                      width={barW} 
                      height={Math.max(barH, 0)} 
                      fill={TYPE_COLORS[type] || DEFAULT_COLOR} 
                      rx="2"
                    />
                  );
                })}
                
                {/* Week Label */}
                <text 
                  x={x + barW / 2} 
                  y={PAD + chartH + 20} 
                  textAnchor="middle" 
                  fontSize="10" 
                  fill="#888780" 
                  fontWeight="bold"
                >
                  {d.label}
                </text>

                {/* Total Count Label */}
                {d.count > 0 && (
                   <text 
                     x={x + barW / 2} 
                     y={currentY - 8} 
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

          {/* Lead Time Trend Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#534AB7"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-60"
          />
          {/* Lead Time Data Points */}
          {data.map((d, i) => {
            const cx = PAD + i * (chartW / data.length) + (chartW / data.length) / 2;
            const cy = PAD + chartH - (d.leadTime / maxLt) * chartH;
            return (
              <g key={`dot-${i}`}>
                <circle cx={cx} cy={cy} r="3.5" fill="white" stroke="#534AB7" strokeWidth="2" />
                {d.leadTime > 0 && (
                  <text 
                    x={cx} y={cy - 12} 
                    textAnchor="middle" fontSize="11" fill="#534AB7" fontWeight="900" 
                    stroke="white" strokeWidth="3" strokeLinejoin="round" paintOrder="stroke"
                  >
                    {d.leadTime.toFixed(1)}d
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
