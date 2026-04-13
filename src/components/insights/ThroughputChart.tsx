"use client";

interface ThroughputChartProps {
  data: { label: string; count: number; leadTime: number }[];
}

export function ThroughputChart({ data }: ThroughputChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  // Ensure we have a reasonable max for Lead Time to prevent extreme spikes dominating
  const maxLt = Math.max(...data.map(d => d.leadTime), 5); // Minimum scale of 5 days
  const H = 240;
  const W = 800;
  const PAD = 50;
  const chartW = W - PAD * 2;
  const chartH = H - PAD * 2;
  const barW = Math.floor(chartW / data.length) - 10;

  // Generate points for Lead Time curve
  const points = data.map((d, i) => {
    const x = PAD + i * (chartW / data.length) + (chartW / data.length) / 2;
    const y = PAD + chartH - (d.leadTime / maxLt) * chartH;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm overflow-hidden relative">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Throughput Semanal (Últimas 12 Semanas)</h3>
        <div className="flex gap-4 text-[10px] font-bold text-gray-400 uppercase">
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-[#1D9E75]"></div> Vazão (Itens)</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#534AB7] opacity-80"></div> Lead Time (Dias)</span>
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
              {/* Optional: Y-axis labels could go here, but omitted for clean Stitch style */}
            </g>
          ))}

          {/* Bars for Throughput */}
          {data.map((d, i) => {
            const h = (d.count / maxCount) * chartH;
            const x = PAD + i * (chartW / data.length) + (chartW / data.length - barW) / 2;
            const y = PAD + chartH - h;

            return (
              <g key={`bar-${i}`}>
                <rect 
                  x={x} 
                  y={y} 
                  width={barW} 
                  height={Math.max(h, 0)} 
                  fill="#1D9E75" 
                  rx="6"
                  className="transition-all duration-500 hover:fill-[#157A5A]"
                />
                <text 
                  x={x + barW / 2} 
                  y={H - 20} 
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

          {/* Lead Time Trend Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#534AB7"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-70 drop-shadow-sm"
          />
          {/* Lead Time Data Points (subtle dots with explicit numbers) */}
          {data.map((d, i) => {
            const cx = PAD + i * (chartW / data.length) + (chartW / data.length) / 2;
            const cy = PAD + chartH - (d.leadTime / maxLt) * chartH;
            return (
              <g key={`dot-${i}`}>
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r="4" 
                  fill="white" 
                  stroke="#534AB7" 
                  strokeWidth="2"
                  className="opacity-90"
                />
                
                {d.leadTime > 0 && (
                  <>
                    {/* Outline (Stroke) for readability over bars */}
                    <text 
                      x={cx} 
                      y={cy - 10} 
                      textAnchor="middle" 
                      fontSize="10" 
                      fontWeight="bold"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    >
                      {d.leadTime.toFixed(1)}d
                    </text>
                    
                    {/* Inner Text */}
                    <text 
                      x={cx} 
                      y={cy - 10} 
                      textAnchor="middle" 
                      fontSize="10" 
                      fill="#534AB7" 
                      fontWeight="extrabold"
                    >
                      {d.leadTime.toFixed(1)}d
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
