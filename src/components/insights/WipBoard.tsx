"use client";

interface WipBoardProps {
  data: { stage: string; count: number }[];
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
    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
      <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-8">Itens em WIP por Estágio</h3>
      
      <div className="flex flex-wrap gap-4">
        {data.map((item, i) => (
          <div 
            key={i} 
            className="flex-1 min-w-[140px] bg-[#F5F4FF] border border-[#AFA9EC] rounded-2xl p-6 text-center group hover:bg-[#534AB7] transition-all"
          >
            <div className="text-3xl font-serif font-bold text-[#534AB7] group-hover:text-white mb-1">
              {item.count}
            </div>
            <div className="text-[10px] font-extrabold text-[#3C3489] group-hover:text-white/80 uppercase tracking-widest line-clamp-1">
              {item.stage}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
