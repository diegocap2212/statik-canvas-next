"use client";

interface WipBoardProps {
  data: { stage: string; count: number; keys?: string[] }[];
}

export function WipBoard({ data }: WipBoardProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-[2rem] p-12 shadow-sm text-center">
        <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-4">Itens em WIP por Estágio</h3>
        <p className="text-sm text-gray-400 font-medium italic">Nenhum item em andamento no momento.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm h-full">
      <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-8">Itens em WIP por Estágio</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.map((item, i) => (
          <div 
            key={i} 
            className="bg-[#F5F4FF] border border-[#AFA9EC] rounded-[2rem] p-6 text-center group transition-all flex flex-col items-center"
          >
            <div className="text-4xl font-serif font-bold text-[#534AB7] mb-1">
              {item.count}
            </div>
            <div className="text-[10px] font-extrabold text-[#3C3489] uppercase tracking-widest mb-4 line-clamp-1">
              {item.stage}
            </div>
            
            {/* Transparency Layer: Issue Keys */}
            {item.keys && item.keys.length > 0 && (
              <div className="w-full pt-4 border-t border-[#AFA9EC]/30">
                <div className="flex flex-wrap justify-center gap-1">
                  {item.keys.map(key => (
                    <span 
                      key={key} 
                      className="text-[9px] font-sans font-bold bg-white text-[#534AB7] px-2 py-0.5 rounded-md border border-[#AFA9EC]/50 shadow-sm"
                    >
                      {key}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
