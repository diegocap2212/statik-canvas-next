"use client";

import { FlowMetrics, InsightsData } from "@/lib/jira";
import { MetricCard } from "@/components/insights/MetricCard";
import { ThroughputChart } from "@/components/insights/ThroughputChart";
import { WipBoard } from "@/components/insights/WipBoard";
import { OpportunityPanel } from "@/components/insights/OpportunityPanel";
import { DemographicsBoard } from "@/components/insights/DemographicsBoard";
import { ProbabilitiesCone } from "@/components/insights/ProbabilitiesCone";
import { BarChart3, Clock, Zap, RefreshCw, AlertCircle } from "lucide-react";

interface InsightsViewProps {
  metrics: FlowMetrics;
  opportunities: InsightsData;
  totalIssues: number;
}

export function InsightsView({ metrics, opportunities, totalIssues }: InsightsViewProps) {
  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="text-[#534AB7]" size={28} />
          <h1 className="text-4xl font-serif text-gray-900">Métricas de Fluxo Reais</h1>
        </div>
        <p className="text-gray-400 font-bold text-sm tracking-wide uppercase">
          Projeto OTE · {totalIssues} issues analisadas · {new Date().toLocaleDateString("pt-BR")}
        </p>
      </header>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <MetricCard 
          title="Lead Time Médio"
          value={metrics.leadTime.avg}
          unit="Dias"
          percentiles={metrics.leadTime}
          description="Tempo total da criação à entrega."
          color="#534AB7"
        />
        <MetricCard 
          title="Cycle Time Médio"
          value={metrics.cycleTime.avg}
          unit="Dias"
          percentiles={metrics.cycleTime}
          description="Tempo ativo em 'In Progress'."
          color="#1D9E75"
        />
        <MetricCard 
          title="Eficiência de Fluxo"
          value={metrics.flowEfficiency}
          unit="%"
          description="Tempo ativo vs tempo total em fila."
          color="#BA7517"
        />
        <MetricCard 
          title="WIP Atual"
          value={metrics.wip.reduce((acc, curr) => acc + curr.count, 0)}
          unit="Itens"
          description="Trabalho em andamento agora."
          color="#D85A30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <ThroughputChart data={metrics.throughput.weeks} />
        </div>
        <div>
          <WipBoard data={metrics.wip} />
        </div>
      </div>

      {/* New Section: Demographics and Cone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <DemographicsBoard data={metrics.demographics} />
        </div>
        <div>
          <ProbabilitiesCone data={metrics.monteCarlo} />
        </div>
      </div>

      <section>
        <div className="flex items-center gap-3 mb-8">
          <Zap className="text-[#534AB7]" size={20} />
          <h2 className="text-2xl font-serif text-gray-900">Direcionamento STATIK</h2>
        </div>
        <OpportunityPanel 
          summary={opportunities.summary}
          opportunities={opportunities.opportunities}
        />
      </section>

      {totalIssues === 0 && (
        <div className="mt-12 bg-white border border-red-100 rounded-[2rem] p-12 text-center shadow-sm">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Sem dados para exibir</h3>
          <p className="text-gray-400 max-w-sm mx-auto">
            Não encontramos issues no projeto OTE ou as credenciais do Jira estão incorretas.
          </p>
        </div>
      )}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-[2rem] p-12 text-center shadow-xl">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Erro na Conexão Jira</h2>
        <p className="text-gray-400 mb-8">{message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-[#534AB7] text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#4339A3] transition-all mx-auto"
        >
          <RefreshCw size={18} /> Tentar Novamente
        </button>
      </div>
    </div>
  );
}
