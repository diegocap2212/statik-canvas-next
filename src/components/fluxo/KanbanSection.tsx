"use client";

import { motion } from "framer-motion";
import { ArrowRight, Users, Inbox, Search, Code, CheckCircle, Zap } from "lucide-react";

const LANES = [
  {
    id: "op",
    name: "Operacional",
    members: "Jan + João",
    tags: ["CRM", "Admin"],
    color: "#3b9eff",
    cards: [
      { title: "Onboarding", sub: "Coleta docs via API", status: "backlog" },
      { title: "Régua cobrança", sub: "Automação judicial", status: "backlog" },
      { title: "KYC automatizado", sub: "Integração bureau", status: "in-flux" },
      { title: "Dashboard sacado", sub: "Painel risco", status: "review" },
      { title: "Monit. NF", sub: "Alerta cancelamento", status: "done" }
    ]
  },
  {
    id: "ai",
    name: "IA & Intel.",
    members: "Jeffrey + TBD",
    tags: ["IA", "Mkt Intel"],
    color: "#534AB7",
    cards: [
      { title: "Portal transparência", sub: "Scraping automático", status: "backlog" },
      { title: "Newsfeed licitações", sub: "Mkt Intelligence", status: "backlog" },
      { title: "Score órgão", sub: "Histórico pagamentos", status: "in-flux" },
      { title: "Chatbot Olivia", sub: "Fluxo comercial", status: "done" }
    ]
  },
  {
    id: "fin",
    name: "Financial",
    members: "Víor + contratação",
    tags: ["Financial Core"],
    color: "#EF9F27",
    cards: [
      { title: "Netsuite", sub: "Urgente · debêntures", status: "backlog", urgent: true },
      { title: "Motor crédito", sub: "Engine precificação", status: "backlog" },
      { title: "Concil. FIDC", sub: "Plataforma externa", status: "in-flux" }
    ]
  },
  {
    id: "exp",
    name: "Expansão",
    members: "Ricardo + Pedro",
    tags: ["Roadmap", "Fomento"],
    color: "#D85A30",
    cards: [
      { title: "Fomento v1", sub: "Pré-performance", status: "backlog" },
      { title: "Roadmap all-in-one", sub: "Conta + crédito + intel", status: "in-flux" }
    ]
  }
];

export function KanbanSection() {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-1 bg-gray-100 rounded-full">
          Nível FL 1
        </div>
        <h2 className="text-3xl font-serif text-gray-900">Kanban Operacional</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_1.5fr] gap-8 items-start">
        
        {/* UPSTREAM */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
            <div className="p-2 bg-blue-50 text-[#3b9eff] rounded-xl">
              <Inbox size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 font-serif">Upstream</h3>
              <p className="text-xs text-gray-400 font-medium">Triagem e refinamento de demandas</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { title: "Entrada", wip: "Livre", icon: Inbox },
              { title: "Triagem PO", wip: "WIP 5", icon: Search },
              { title: "Refinamento", wip: "WIP 3", icon: Code },
              { title: "Pronto p/ Squad", wip: "WIP 5", icon: CheckCircle, highlight: true }
            ].map((step, i) => (
              <div key={step.title} className={`p-4 rounded-2xl border ${step.highlight ? 'bg-[#1D9E75]/5 border-[#1D9E75]/20' : 'bg-gray-50/50 border-gray-100'}`}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <step.icon size={14} className={step.highlight ? 'text-[#1D9E75]' : 'text-gray-400'} />
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">{step.title}</span>
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 px-2 py-0.5 bg-white border border-gray-100 rounded-md">
                    {step.wip}
                  </span>
                </div>
                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(i + 1) * 25}%` }}
                    className={`h-full ${step.highlight ? 'bg-[#1D9E75]' : 'bg-gray-300'}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-gray-50">
            <span className="px-3 py-1 bg-red-50 text-red-500 rounded-full text-[9px] font-bold uppercase tracking-wider border border-red-100">Expedite</span>
            <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-bold uppercase tracking-wider border border-amber-100">Fixed Date</span>
            <span className="px-3 py-1 bg-blue-50 text-blue-500 rounded-full text-[9px] font-bold uppercase tracking-wider border border-blue-100">Standard</span>
            <span className="px-3 py-1 bg-purple-50 text-[#534AB7] rounded-full text-[9px] font-bold uppercase tracking-wider border border-[#534AB7]/10">Kaizen</span>
          </div>
        </div>

        {/* CONNECTOR */}
        <div className="flex flex-col items-center justify-center p-4">
          <div className="h-12 w-px bg-gray-100" />
          <div className="px-4 py-2 bg-[#1D9E75]/10 border border-[#1D9E75]/20 rounded-2xl text-[10px] font-bold text-[#1D9E75] uppercase tracking-widest vertical-rl rotate-180 whitespace-nowrap">
            Pull Strategy
          </div>
          <ArrowRight className="text-[#1D9E75] my-4" />
          <div className="h-full w-px bg-gray-100" />
        </div>

        {/* DOWNSTREAM */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
           <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
            <div className="p-2 bg-teal-50 text-[#1D9E75] rounded-xl">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 font-serif">Downstream</h3>
              <p className="text-xs text-gray-400 font-medium">1 Board · 4 Raias · Sistema Puxado</p>
            </div>
            <div className="ml-auto bg-gray-50 px-3 py-1 rounded-full text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              WIP Limit Active
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr] gap-4 mb-4">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Squad / Raia</div>
                {['Backlog', 'Flow (WIP 2)', 'Review (WIP 1)', 'Done'].map(h => (
                  <div key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">{h}</div>
                ))}
              </div>

              <div className="space-y-6">
                {LANES.map(lane => (
                  <div key={lane.id} className="grid grid-cols-[180px_1fr_1fr_1fr_1fr] gap-4">
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: lane.color }} />
                        <span className="text-sm font-bold text-gray-900 leading-none">{lane.name}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">{lane.members}</span>
                      <div className="flex gap-1">
                        {lane.tags.map(t => (
                          <span key={t} className="text-[8px] font-bold bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded-md uppercase">{t}</span>
                        ))}
                      </div>
                    </div>

                    {['backlog', 'in-flux', 'review', 'done'].map(status => (
                      <div key={status} className={`p-2 rounded-2xl min-h-[100px] border flex flex-col gap-2 ${status === 'done' ? 'bg-green-50/30 border-green-100/50' : 'bg-gray-50/50 border-gray-100/50'}`}>
                        {lane.cards.filter(c => c.status === status).map((card, i) => (
                          <motion.div 
                            key={card.title}
                            whileHover={{ y: -2 }}
                            className={`p-2 rounded-xl border bg-white shadow-sm cursor-default ${card.urgent ? 'border-red-200' : 'border-gray-50'}`}
                          >
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <span className="text-[10px] font-bold text-gray-800 leading-tight">
                                {card.urgent && <span className="text-red-500 mr-1">⚠</span>}
                                {card.title}
                              </span>
                              {card.urgent && <Zap size={10} className="text-red-500 fill-current" />}
                            </div>
                            <p className="text-[9px] text-gray-400 font-medium leading-tight">{card.sub}</p>
                          </motion.div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
