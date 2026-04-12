import { getUserSessions } from "@/app/actions";
import Link from "next/link";
import { Plus, Clock, FileText, Bot, ChevronRight } from "lucide-react";

export default async function DashboardPage() {
  const sessions = await getUserSessions();

  return (
    <div className="min-h-screen bg-[#FAFAF8] p-16">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-end mb-16">
          <div>
            <h1 className="text-4xl font-serif text-gray-900 mb-2">Suas Sessões IA Statik</h1>
            <p className="text-gray-400 font-bold text-sm tracking-wide uppercase">Powered By Diego Caporusso</p>
          </div>
          <Link 
            href="/"
            className="bg-[#534AB7] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#4339A3] transition-all shadow-lg"
          >
            <Plus size={20} /> Nova Sessão
          </Link>
        </header>

        {sessions.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-[2rem] p-20 text-center shadow-sm">
             <div className="w-16 h-16 bg-[#F5F4FF] text-[#534AB7] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bot size={32} />
             </div>
             <h2 className="text-xl font-bold text-gray-900 mb-2">Nenhuma sessão encontrada</h2>
             <p className="text-gray-400 max-w-sm mx-auto mb-8">Comece sua primeira análise STATIK co-facilitada por IA agora mesmo.</p>
             <Link href="/" className="text-[#534AB7] font-bold hover:underline">Criar nova análise →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((s) => (
              <Link 
                key={s.id} 
                href={`/session/${s.id}`}
                className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                   <div className="p-3 bg-[#F5F4FF] text-[#534AB7] rounded-xl group-hover:bg-[#534AB7] group-hover:text-white transition-colors">
                      <FileText size={20} />
                   </div>
                   <div className="text-[10px] font-extrabold text-[#1D9E75] bg-[#E1F5EE] px-3 py-1 rounded-full uppercase">
                      {s.isDone ? "Finalizado" : "Em Aberto"}
                   </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{s.productName}</h3>
                <p className="text-sm text-gray-400 mb-6 flex items-center gap-2">
                   <Clock size={14} /> {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                </p>
                <div className="pt-6 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-[#534AB7]">
                   <span>Ver Detalhes</span>
                   <ChevronRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
