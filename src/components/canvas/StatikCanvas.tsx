"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, ChevronRight, Wand2, ArrowLeft, 
  Save, LayoutDashboard, Copy, Printer 
} from "lucide-react";

import { TagInput } from "./TagInput";
import { StatikTable } from "./StatikTable";
import { WorkflowEditor } from "./WorkflowEditor";
import { ClassGrid } from "./ClassGrid";
import { AiBubble } from "./AiBubble";

import { updateSessionData, getAiObservation, generateFinalDiagnosis } from "@/app/actions";

interface StatikCanvasProps {
  session: any; // Using simplified type for now
}

const STEPS = [
  { id: 1, label: "Propósito", title: "Propósito do Serviço" },
  { id: 2, label: "Insatisfações", title: "Fontes de Insatisfação" },
  { id: 3, label: "Demanda", title: "Análise da Demanda" },
  { id: 4, label: "Capacidade", title: "Análise de Capacidade" },
  { id: 5, label: "Classes", title: "Classes de Serviço" },
  { id: 6, label: "Workflow", title: "Fluxo de Trabalho" },
  { id: 7, label: "Cadências", title: "Cadências e Feedback" },
  { id: 8, label: "Diagnóstico", title: "Diagnóstico IA" },
];

export function StatikCanvas({ session }: StatikCanvasProps) {
  const router = useRouter();
  const [cur, setCur] = useState(1);
  const [data, setData] = useState(session.data || {
    tagsInternal: [],
    tagsExternal: [],
    demands: [],
    cadences: [],
    workflow: ["Backlog", "Em andamento", "Pausado", "Entregue"],
    steps: {},
  });
  const [aiCache, setAiCache] = useState<Record<number, string>>(session.aiCache || {});
  const [loadingAi, setLoadingAi] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [diagnosis, setDiagnosis] = useState(session.diagnosis);

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      setSaving(true);
      await updateSessionData(session.id, data);
      setSaving(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [data, session.id]);

  const goTo = (n: number) => {
    setCur(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (n === 8 && !diagnosis) handleGenerateDiagnosis();
  };

  const updateStepVal = (field: string, val: string) => {
    setData((prev: any) => ({
      ...prev,
      steps: { ...prev.steps, [field]: val }
    }));
  };

  const handleAiTrigger = async (stepId: number, contentField: string) => {
    const content = data.steps[contentField];
    if (!content || loadingAi === stepId) return;

    setLoadingAi(stepId);
    try {
      const result = await getAiObservation(session.id, stepId, content);
      setAiCache(prev => ({ ...prev, [stepId]: result }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(null);
    }
  };

  const handleGenerateDiagnosis = async () => {
    setLoadingAi(8);
    try {
      const result = await generateFinalDiagnosis(session.id);
      setDiagnosis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(null);
    }
  };

  const currentStep = STEPS.find(s => s.id === cur);

  return (
    <div className="flex min-h-screen bg-[#FAFAF8]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 p-8 sticky top-0 h-screen flex flex-col">
          <div className="mb-12 flex items-center gap-2">
            <div className="bg-[#534AB7] p-1.5 rounded-lg text-white">
                <LayoutDashboard size={20} />
            </div>
            <span className="font-bold text-lg">IA <span className="text-[#534AB7]">Statik</span></span>
          </div>

          <div className="space-y-1">
             {STEPS.map((s) => (
                <button
                    key={s.id}
                    onClick={() => goTo(s.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3
                        ${cur === s.id ? "bg-[#F5F4FF] text-[#534AB7]" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"}
                    `}
                >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px]
                        ${cur === s.id ? "border-[#534AB7] bg-[#534AB7] text-white" : "border-gray-100"}
                    `}>
                        {s.id}
                    </div>
                    {s.label}
                </button>
             ))}
          </div>

          <div className="mt-auto">
             <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wide">
                <span>Progresso</span>
                <span>{((cur/8)*100).toFixed(0)}%</span>
             </div>
             <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(cur/8)*100}%` }}
                    className="h-full bg-[#1D9E75]"
                />
             </div>
          </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto p-16 pb-40 relative">
          <div className="flex justify-between items-center mb-12">
             <button onClick={() => router.push("/dashboard")} className="text-gray-400 hover:text-[#534AB7] flex items-center gap-2 text-sm font-bold transition-colors">
                <ArrowLeft size={16} /> Voltar ao Dash
             </button>
             <div className="flex items-center gap-3">
                {saving && <span className="text-[10px] font-bold text-gray-400 animate-pulse">SALVANDO...</span>}
                <div className="bg-white border px-4 py-2 rounded-full text-[11px] font-bold shadow-sm">
                   {session.productName}
                </div>
             </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
                key={cur}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
            >
                <div className="mb-12">
                   <p className="text-[11px] font-extrabold text-[#534AB7] uppercase tracking-widest mb-2">ETAPA {cur} DE 8</p>
                   <h1 className="text-4xl font-serif text-gray-900 mb-4">{currentStep?.title}</h1>
                </div>

                <AiBubble content={aiCache[cur]} loading={loadingAi === cur} />

                {/* Step Content */}
                <div className="space-y-8">
                   {cur === 1 && (
                      <div className="space-y-6">
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Quem é o cliente e o que você faz por ele?</label>
                            <textarea 
                                className="w-full h-32 p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#534AB7] transition-all resize-none"
                                value={data.steps.s1Purpose || ""}
                                onChange={(e) => updateStepVal("s1Purpose", e.target.value)}
                                onBlur={() => handleAiTrigger(1, "s1Purpose")}
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Definição de sucesso</label>
                            <input 
                                className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#534AB7] transition-all"
                                value={data.steps.s1Success || ""}
                                onChange={(e) => updateStepVal("s1Success", e.target.value)}
                            />
                         </div>
                      </div>
                   )}

                   {cur === 2 && (
                      <div className="space-y-8">
                         <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                               <label className="text-xs font-bold text-[#1D9E75] uppercase">Insatisfações Internas</label>
                               <TagInput 
                                    type="internal" 
                                    tags={data.tagsInternal} 
                                    onChange={(tags) => setData((p: any) => ({ ...p, tagsInternal: tags }))} 
                                />
                            </div>
                            <div className="space-y-2">
                               <label className="text-xs font-bold text-[#D85A30] uppercase">Insatisfações Externas</label>
                               <TagInput 
                                    type="external" 
                                    tags={data.tagsExternal} 
                                    onChange={(tags) => setData((p: any) => ({ ...p, tagsExternal: tags }))} 
                                />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Pontos mais críticos</label>
                            <textarea 
                                className="w-full h-24 p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#534AB7] transition-all resize-none"
                                value={data.steps.s2Priority || ""}
                                onChange={(e) => updateStepVal("s2Priority", e.target.value)}
                                onBlur={() => handleAiTrigger(2, "s2Priority")}
                            />
                         </div>
                      </div>
                   )}

                   {cur === 3 && (
                      <div className="space-y-8">
                        <StatikTable 
                            headers={["Tipo de demanda", "De onde vem?", "Quem recebe?", "Frequência", "SLA/Expectativa"]}
                            rows={data.demands}
                            onChange={(rows) => setData((p: any) => ({ ...p, demands: rows }))}
                        />
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Demandas difíceis de prever</label>
                            <textarea 
                                className="w-full h-24 p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#534AB7] transition-all resize-none"
                                value={data.steps.s3Unpredictable || ""}
                                onChange={(e) => updateStepVal("s3Unpredictable", e.target.value)}
                                onBlur={() => handleAiTrigger(3, "s3Unpredictable")}
                            />
                         </div>
                      </div>
                   )}

                   {cur === 4 && (
                      <div className="space-y-8">
                         <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                               <label className="text-xs font-bold text-gray-400 uppercase">Lead Time (Média)</label>
                               <input 
                                    className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#534AB7] transition-all"
                                    value={data.steps.s4Leadtime || ""}
                                    onChange={(e) => updateStepVal("s4Leadtime", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                               <label className="text-xs font-bold text-gray-400 uppercase">Throughput (Entregas)</label>
                               <input 
                                    className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#534AB7] transition-all"
                                    value={data.steps.s4Throughput || ""}
                                    onChange={(e) => updateStepVal("s4Throughput", e.target.value)}
                                />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Gargalos evidentes</label>
                            <textarea 
                                className="w-full h-24 p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#534AB7] transition-all resize-none"
                                value={data.steps.s4Bottleneck || ""}
                                onChange={(e) => updateStepVal("s4Bottleneck", e.target.value)}
                                onBlur={() => handleAiTrigger(4, "s4Bottleneck")}
                            />
                         </div>
                      </div>
                   )}

                   {cur === 5 && (
                      <div className="space-y-8">
                         <ClassGrid selected={data.classes || []} onChange={(cls) => setData((p: any) => ({ ...p, classes: cls }))} />
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Como priorizamos hoje?</label>
                            <textarea 
                                className="w-full h-24 p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#534AB7] transition-all resize-none"
                                value={data.steps.s5Priority || ""}
                                onChange={(e) => updateStepVal("s5Priority", e.target.value)}
                                onBlur={() => handleAiTrigger(5, "s5Priority")}
                            />
                         </div>
                      </div>
                   )}

                   {cur === 6 && (
                      <div className="space-y-8">
                         <WorkflowEditor stages={data.workflow} onChange={(s) => setData((p: any) => ({ ...p, workflow: s }))} />
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Tipos de demanda com fluxos diferentes?</label>
                            <textarea 
                                className="w-full h-24 p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#534AB7] transition-all resize-none"
                                value={data.steps.s6Diff || ""}
                                onChange={(e) => updateStepVal("s6Diff", e.target.value)}
                                onBlur={() => handleAiTrigger(6, "s6Diff")}
                            />
                         </div>
                      </div>
                   )}

                   {cur === 7 && (
                      <div className="space-y-8">
                        <StatikTable 
                            headers={["Nome da cadência", "Frequência", "Propósito", "Está funcionando?"]}
                            rows={data.cadences}
                            onChange={(rows) => setData((p: any) => ({ ...p, cadences: rows }))}
                        />
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Feedback loops ausentes?</label>
                            <textarea 
                                className="w-full h-24 p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#534AB7] transition-all resize-none"
                                value={data.steps.s7Missing || ""}
                                onChange={(e) => updateStepVal("s7Missing", e.target.value)}
                                onBlur={() => handleAiTrigger(7, "s7Missing")}
                            />
                         </div>
                      </div>
                   )}

                   {cur === 8 && diagnosis && (
                      <div className="space-y-12">
                         <div className="bg-white p-12 rounded-[2rem] shadow-xl border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-[#534AB7]" />
                            <h2 className="text-[11px] font-extrabold text-[#534AB7] uppercase tracking-widest mb-6">VISÃO SISTÊMICA</h2>
                            <p className="text-2xl font-serif text-gray-900 mb-12 leading-tight">{diagnosis.overview}</p>
                            
                            <div className="grid grid-cols-2 gap-12">
                               <div>
                                  <h3 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-6">PADRÕES OBSERVADOS</h3>
                                  <div className="space-y-3">
                                     {diagnosis.patterns.map((p: string, i: number) => (
                                        <div key={i} className="p-4 bg-gray-50 rounded-xl text-sm font-medium border-l-4 border-[#AFA9EC]">
                                           {p}
                                        </div>
                                     ))}
                                  </div>
                               </div>
                               <div>
                                  <h3 className="text-[11px] font-extrabold text-[#1D9E75] uppercase tracking-widest mb-6">PRÓXIMOS PASSOS</h3>
                                  <div className="space-y-4">
                                     {diagnosis.nextsteps.map((s: string, i: number) => (
                                        <div key={i} className="flex gap-4 items-start">
                                           <div className="w-6 h-6 bg-[#1D9E75] text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-1">
                                              {i+1}
                                           </div>
                                           <p className="text-sm text-gray-700 font-medium">{s}</p>
                                        </div>
                                     ))}
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   )}
                </div>

                {/* Navigation Bar */}
                <div className="mt-20 pt-10 border-t border-gray-100 flex justify-between items-center">
                   {cur > 1 ? (
                      <button onClick={() => goTo(cur - 1)} className="btn btn-ghost">
                         <ChevronLeft size={20} /> Etapa Anterior
                      </button>
                   ) : <div />}

                   {cur < 8 ? (
                      <button 
                        onClick={() => goTo(cur + 1)} 
                        className="bg-[#534AB7] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-[#4339A3] transition-all shadow-lg active:scale-95"
                      >
                         Próxima Etapa <ChevronRight size={20} />
                      </button>
                   ) : (
                      <div className="flex gap-4">
                         <button onClick={() => window.print()} className="btn btn-ghost">
                            <Printer size={20} /> Imprimir / PDF
                         </button>
                      </div>
                   )}
                </div>
            </motion.div>
          </AnimatePresence>
      </main>
    </div>
  );
}
