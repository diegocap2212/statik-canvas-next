"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Plus, X, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Stage {
  id: string;
  name: string;
  type: "discovery" | "commitment" | "delivery" | "done" | "queue" | "custom";
  wip?: number | null;
}

interface DiagnosticAnswers {
  hasDiscovery: boolean | null;
  hasQueues: boolean | null;
  commitmentPoint: string;
  hasWipLimits: boolean | null;
  wipStrategy: string;
  flowReality: string;
}

interface WorkflowEditorProps {
  stages: string[];
  onChange: (stages: string[]) => void;
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const STAGE_COLORS: Record<Stage["type"], { bg: string; color: string; border: string }> = {
  discovery:  { bg: "#FBEAF0", color: "#72243E", border: "#ED93B1" },
  commitment: { bg: "#FAEEDA", color: "#633806", border: "#EF9F27" },
  delivery:   { bg: "#EEEDFE", color: "#3C3489", border: "#7F77DD" },
  queue:      { bg: "#F1EFE8", color: "#444441", border: "#B4B2A9" },
  done:       { bg: "#E1F5EE", color: "#085041", border: "#5DCAA5" },
  custom:     { bg: "#E6F1FB", color: "#0C447C", border: "#85B7EB" },
};

const STAGE_TYPE_LABELS: Record<Stage["type"], string> = {
  discovery:  "Discovery",
  commitment: "Ponto de compromisso",
  delivery:   "Delivery",
  queue:      "Fila",
  done:       "Entregue",
  custom:     "Personalizado",
};

const TEMPLATES: Array<{ id: string; label: string; color: string; stages: Omit<Stage, "id">[] }> = [
  {
    id: "kanban-basic",
    label: "Kanban simples",
    color: "#534AB7",
    stages: [
      { name: "Backlog",        type: "queue" },
      { name: "Em andamento",   type: "delivery" },
      { name: "Em revisão",     type: "delivery" },
      { name: "Entregue",       type: "done" },
    ],
  },
  {
    id: "upstream-downstream",
    label: "Discovery + Delivery",
    color: "#1D9E75",
    stages: [
      { name: "Ideia",          type: "discovery" },
      { name: "Exploração",     type: "discovery" },
      { name: "Pronto p/ Dev",  type: "commitment" },
      { name: "Dev",            type: "delivery" },
      { name: "Review",         type: "delivery" },
      { name: "Deploy",         type: "done" },
    ],
  },
  {
    id: "suporte",
    label: "Suporte",
    color: "#D85A30",
    stages: [
      { name: "Entrada",          type: "queue" },
      { name: "Triagem",          type: "delivery" },
      { name: "Em análise",       type: "delivery" },
      { name: "Aguard. cliente",  type: "queue" },
      { name: "Resolvido",        type: "done" },
    ],
  },
  {
    id: "ops",
    label: "Operações",
    color: "#BA7517",
    stages: [
      { name: "Solicitado",   type: "queue" },
      { name: "Aprovação",    type: "commitment" },
      { name: "Execução",     type: "delivery" },
      { name: "Validação",    type: "delivery" },
      { name: "Encerrado",    type: "done" },
    ],
  },
];

// Perguntas sobre o fluxo como um todo — foco em estrutura sistêmica
const DIAGNOSTIC_QUESTIONS = [
  {
    id: "hasDiscovery",
    type: "boolean",
    question: "O time tem uma etapa de discovery separada — onde as ideias são exploradas antes de entrar em desenvolvimento?",
    insight: "Fluxos sem discovery explícito costumam ter alto retrabalho. O trabalho de entender o problema é feito às pressas, dentro do tempo de execução.",
    ifYes: "Onde termina o discovery e começa o compromisso de construir? Esse ponto é claro para todos?",
    ifNo: "Isso significa que análise, decisão e execução acontecem no mesmo espaço — o que torna impossível medir lead time real.",
  },
  {
    id: "hasQueues",
    type: "boolean",
    question: "Existem filas explícitas no fluxo — momentos onde o trabalho espera antes de entrar em uma etapa?",
    insight: "Filas invisíveis são o maior gerador de lead time oculto. Se não existem filas nomeadas, elas existem mesmo assim — só não são gerenciadas.",
    ifYes: "Quem decide quando um item sai da fila? Existe algum critério ou é primeiro a chegar, primeiro a ser servido?",
    ifNo: "Sem filas visíveis, o trabalho entra direto nas etapas — o que significa que interrupções e urgências não têm lugar controlado para pousar.",
  },
  {
    id: "commitmentPoint",
    type: "text",
    question: "Qual é o ponto de compromisso do fluxo — o momento em que o time diz 'vamos construir isso'?",
    placeholder: "Ex: quando entra no sprint, quando o PM aprova, quando entra em Dev...",
    insight: "O ponto de compromisso define onde começa o custo do atraso real. Antes dele, mudar é barato. Depois, caro.",
  },
  {
    id: "hasWipLimits",
    type: "boolean",
    question: "O time limita de alguma forma a quantidade de trabalho em andamento ao mesmo tempo — formal ou informalmente?",
    insight: "Times sem WIP limit trabalham com a ilusão de que mais coisas em paralelo = mais velocidade. Na prática, cada item a mais em andamento aumenta o lead time de todos os outros.",
    ifYes: "Como esse limite foi definido? O time respeita ou contorna quando há pressão?",
    ifNo: "Sem WIP limit, o fluxo é governado por urgência e pressão — não por capacidade real.",
  },
  {
    id: "flowReality",
    type: "text",
    question: "Se o fluxo desenhado aqui fosse um paciente, qual seria o diagnóstico — e quem no time concordaria ou discordaria dessa avaliação?",
    placeholder: "Registre o que surgiu — inclusive os silêncios e as divergências...",
    insight: "Divergências sobre o diagnóstico do próprio fluxo são dados. Elas mostram onde o time não tem visão compartilhada da realidade.",
  },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export function WorkflowEditor({ stages: stageNames, onChange }: WorkflowEditorProps) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [stages, setStages] = useState<Stage[]>(() =>
    stageNames.length > 0
      ? stageNames.map((name, i) => ({
          id: String(i),
          name,
          type: "custom" as Stage["type"],
        }))
      : TEMPLATES[0].stages.map((s, i) => ({ ...s, id: String(i) }))
  );
  const [answers, setAnswers] = useState<Partial<DiagnosticAnswers>>({});
  const [newStageName, setNewStageName] = useState("");
  const [newStageType, setNewStageType] = useState<Stage["type"]>("delivery");
  const [dragSrc, setDragSrc] = useState<number | null>(null);
  const [editingWip, setEditingWip] = useState<string | null>(null);

  // Sync stages to parent
  function syncStages(s: Stage[]) {
    setStages(s);
    onChange(s.map((st) => st.name));
  }

  function applyTemplate(tpl: typeof TEMPLATES[0]) {
    setActiveTemplate(tpl.id);
    syncStages(tpl.stages.map((s, i) => ({ ...s, id: `${Date.now()}-${i}` })));
  }

  function addStage() {
    if (!newStageName.trim()) return;
    const s: Stage = {
      id: String(Date.now()),
      name: newStageName.trim(),
      type: newStageType,
    };
    syncStages([...stages, s]);
    setNewStageName("");
  }

  function removeStage(id: string) {
    syncStages(stages.filter((s) => s.id !== id));
  }

  function renameStage(id: string, name: string) {
    syncStages(stages.map((s) => (s.id === id ? { ...s, name } : s)));
  }

  function changeType(id: string, type: Stage["type"]) {
    syncStages(stages.map((s) => (s.id === id ? { ...s, type } : s)));
  }

  function setWip(id: string, wip: number | null) {
    syncStages(stages.map((s) => (s.id === id ? { ...s, wip } : s)));
    setEditingWip(null);
  }

  function handleDrop(toIdx: number) {
    if (dragSrc === null || dragSrc === toIdx) return;
    const copy = [...stages];
    const [moved] = copy.splice(dragSrc, 1);
    copy.splice(toIdx, 0, moved);
    syncStages(copy);
    setDragSrc(null);
  }

  function setAnswer(key: keyof DiagnosticAnswers, value: any) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  const answeredCount = Object.keys(answers).length;

  // ── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Phase tabs */}
      <div className="flex border border-gray-100 rounded-2xl overflow-hidden text-xs font-bold">
        {(["Fluxo oficial", "Diagnóstico", "Fluxo final"] as const).map((label, i) => (
          <button
            key={i}
            onClick={() => setPhase(i as 0 | 1 | 2)}
            className={cn(
              "flex-1 py-3 text-center transition-all border-r border-gray-100 last:border-r-0",
              phase === i
                ? "bg-[#534AB7] text-white"
                : i < phase
                ? "bg-[#E1F5EE] text-[#085041]"
                : "bg-gray-50 text-gray-400 hover:text-gray-600"
            )}
          >
            {i < phase && <span className="mr-1">✓</span>}
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── PHASE 0: FLUXO OFICIAL ── */}
        {phase === 0 && (
          <motion.div key="p0" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <p className="text-xs text-gray-400 leading-relaxed">
              Monte o fluxo como o time descreve hoje — sem correções ainda. Esse é o ponto de partida.
            </p>

            {/* Templates */}
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                    activeTemplate === t.id
                      ? "border-[#534AB7] bg-[#EEEDFE] text-[#3C3489]"
                      : "border-gray-200 text-gray-500 hover:border-[#AFA9EC] hover:text-[#534AB7]"
                  )}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Flow canvas */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex flex-wrap items-start gap-2 min-h-[60px] mb-4">
                {stages.map((s, i) => {
                  const col = STAGE_COLORS[s.type];
                  return (
                    <div key={s.id} className="flex items-center gap-2">
                      {i > 0 && <ArrowRight size={14} className="text-gray-300 flex-shrink-0" />}
                      <div
                        draggable
                        onDragStart={() => setDragSrc(i)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(i)}
                        className="group relative"
                      >
                        <div
                          className="flex flex-col gap-1 px-3 py-2 rounded-xl border cursor-grab active:scale-105 transition-transform min-w-[80px]"
                          style={{ background: col.bg, borderColor: col.border, color: col.color }}
                        >
                          {/* Stage name editable */}
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => renameStage(s.id, e.currentTarget.textContent || s.name)}
                            className="text-xs font-bold outline-none min-w-[40px]"
                          >
                            {s.name}
                          </span>

                          {/* Type selector */}
                          <select
                            value={s.type}
                            onChange={(e) => changeType(s.id, e.target.value as Stage["type"])}
                            className="text-[9px] bg-transparent border-none outline-none cursor-pointer font-medium opacity-70"
                            style={{ color: col.color }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {(Object.keys(STAGE_TYPE_LABELS) as Stage["type"][]).map((t) => (
                              <option key={t} value={t}>{STAGE_TYPE_LABELS[t]}</option>
                            ))}
                          </select>

                          {/* WIP limit */}
                          {editingWip === s.id ? (
                            <input
                              autoFocus
                              type="number"
                              min={1}
                              placeholder="WIP"
                              className="w-12 text-[9px] bg-white/60 rounded px-1 outline-none border border-current/20"
                              onBlur={(e) => setWip(s.id, e.target.value ? Number(e.target.value) : null)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") setWip(s.id, Number((e.target as HTMLInputElement).value) || null);
                                if (e.key === "Escape") setEditingWip(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingWip(s.id); }}
                              className="text-[9px] opacity-50 hover:opacity-100 text-left transition-opacity"
                            >
                              {s.wip ? `WIP: ${s.wip}` : "+ WIP limit"}
                            </button>
                          )}
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeStage(s.id)}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                        >
                          <X size={8} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add stage */}
              <div className="flex gap-2 items-center flex-wrap">
                <input
                  type="text"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addStage()}
                  placeholder="Nome da etapa..."
                  className="px-3 py-2 text-xs bg-gray-50 border border-dashed border-gray-200 rounded-xl outline-none focus:border-[#534AB7] focus:bg-white transition-all w-44"
                />
                <select
                  value={newStageType}
                  onChange={(e) => setNewStageType(e.target.value as Stage["type"])}
                  className="px-2 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#534AB7] transition-all"
                >
                  {(Object.keys(STAGE_TYPE_LABELS) as Stage["type"][]).map((t) => (
                    <option key={t} value={t}>{STAGE_TYPE_LABELS[t]}</option>
                  ))}
                </select>
                <button
                  onClick={addStage}
                  className="flex items-center gap-1 px-3 py-2 bg-[#534AB7] text-white text-xs font-bold rounded-xl hover:bg-[#3C3489] transition-colors"
                >
                  <Plus size={12} /> Etapa
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-gray-400">Arraste para reordenar · clique no tipo para mudar · + WIP limit para limitar</span>
              <button
                onClick={() => setPhase(1)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#534AB7] text-white text-xs font-bold rounded-xl hover:bg-[#3C3489] transition-colors"
              >
                Iniciar diagnóstico <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── PHASE 1: DIAGNÓSTICO ── */}
        {phase === 1 && (
          <motion.div key="p1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <p className="text-xs text-gray-400 leading-relaxed">
              Perguntas sobre o fluxo como sistema — não sobre etapas individuais. O facilitador lê em voz alta. O silêncio também é uma resposta.
            </p>

            {DIAGNOSTIC_QUESTIONS.map((q, i) => {
              const answer = answers[q.id as keyof DiagnosticAnswers];
              const answered = answer !== undefined && answer !== null && answer !== "";
              return (
                <div
                  key={q.id}
                  className={cn(
                    "bg-white border rounded-2xl overflow-hidden transition-all",
                    answered ? "border-[#1D9E75]" : "border-gray-100"
                  )}
                >
                  <div className={cn("px-5 py-3 border-b flex items-center gap-3", answered ? "bg-[#E1F5EE] border-[#9FE1CB]" : "bg-gray-50 border-gray-100")}>
                    <div className="w-6 h-6 rounded-full bg-[#534AB7] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {answered ? <Check size={10} /> : i + 1}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      {q.type === "boolean" ? "Sim ou não" : "Aberta"}
                    </span>
                  </div>

                  <div className="px-5 py-4 space-y-3">
                    <p className="text-sm font-bold text-gray-900 leading-snug">{q.question}</p>
                    <p className="text-xs text-[#534AB7] italic leading-relaxed border-l-2 border-[#AFA9EC] pl-3">{q.insight}</p>

                    {q.type === "boolean" && (
                      <div className="flex gap-3">
                        {[true, false].map((v) => (
                          <button
                            key={String(v)}
                            onClick={() => setAnswer(q.id as keyof DiagnosticAnswers, v)}
                            className={cn(
                              "flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all",
                              answer === v
                                ? v ? "bg-[#E1F5EE] border-[#1D9E75] text-[#085041]" : "bg-[#FAECE7] border-[#D85A30] text-[#712B13]"
                                : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                            )}
                          >
                            {v ? "Sim" : "Não"}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Follow-up after boolean */}
                    {q.type === "boolean" && answer !== undefined && answer !== null && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                        <p className="text-xs font-bold text-gray-500 mb-1.5">
                          {answer ? q.ifYes : q.ifNo}
                        </p>
                        <textarea
                          rows={2}
                          placeholder="Registre o que o time respondeu..."
                          className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#534AB7] focus:bg-white resize-none transition-all"
                        />
                      </motion.div>
                    )}

                    {q.type === "text" && (
                      <textarea
                        rows={2}
                        value={(answer as string) || ""}
                        onChange={(e) => setAnswer(q.id as keyof DiagnosticAnswers, e.target.value)}
                        placeholder={"placeholder" in q ? q.placeholder : "Registre o que o time respondeu..."}
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#534AB7] focus:bg-white resize-none transition-all"
                      />
                    )}
                  </div>
                </div>
              );
            })}

            <div className="flex justify-between items-center pt-2">
              <button onClick={() => setPhase(0)} className="px-4 py-2 text-xs font-bold text-gray-400 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                ← Rever fluxo
              </button>
              <button
                onClick={() => setPhase(2)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1D9E75] text-white text-xs font-bold rounded-xl hover:bg-[#0F6E56] transition-colors"
              >
                Construir fluxo final <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── PHASE 2: FLUXO FINAL ── */}
        {phase === 2 && (
          <motion.div key="p2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

            {/* Synthesis summary */}
            <div className="bg-[#EEEDFE] border border-[#AFA9EC] rounded-2xl p-4 space-y-2">
              <p className="text-[10px] font-bold text-[#534AB7] uppercase tracking-wider">O que o diagnóstico revelou</p>
              <ul className="space-y-1.5">
                {answers.hasDiscovery === true && (
                  <li className="text-xs text-[#26215C] flex gap-2">
                    <span className="text-[#1D9E75] font-bold flex-shrink-0">✓</span>
                    Discovery existe — marque o ponto de compromisso no fluxo final
                  </li>
                )}
                {answers.hasDiscovery === false && (
                  <li className="text-xs text-[#26215C] flex gap-2">
                    <span className="text-[#D85A30] font-bold flex-shrink-0">!</span>
                    Sem discovery separado — considere se faz sentido criar essa separação
                  </li>
                )}
                {answers.hasQueues === false && (
                  <li className="text-xs text-[#26215C] flex gap-2">
                    <span className="text-[#D85A30] font-bold flex-shrink-0">!</span>
                    Filas invisíveis existem — torná-las explícitas é o primeiro passo para gerenciá-las
                  </li>
                )}
                {answers.hasWipLimits === false && (
                  <li className="text-xs text-[#26215C] flex gap-2">
                    <span className="text-[#D85A30] font-bold flex-shrink-0">!</span>
                    Sem WIP limits — o fluxo final é uma oportunidade de definir o primeiro limite
                  </li>
                )}
                {answers.hasWipLimits === true && (
                  <li className="text-xs text-[#26215C] flex gap-2">
                    <span className="text-[#1D9E75] font-bold flex-shrink-0">✓</span>
                    WIP limits existem — revise se os valores fazem sentido no fluxo final
                  </li>
                )}
                {!answers.hasDiscovery && !answers.hasQueues && !answers.hasWipLimits && (
                  <li className="text-xs text-[#26215C]">Complete o diagnóstico para ver os insights aqui.</li>
                )}
              </ul>
            </div>

            {/* Final flow editor — same canvas, now with context */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Fluxo final acordado com o time</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Ajuste o fluxo com base no que o diagnóstico revelou. Defina os tipos de cada etapa, adicione WIP limits onde fizer sentido e marque o ponto de compromisso.
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex flex-wrap items-start gap-2 min-h-[60px] mb-4">
                {stages.map((s, i) => {
                  const col = STAGE_COLORS[s.type];
                  return (
                    <div key={s.id} className="flex items-center gap-2">
                      {i > 0 && <ArrowRight size={14} className="text-gray-300 flex-shrink-0" />}
                      <div className="group relative">
                        <div
                          className="flex flex-col gap-1 px-3 py-2 rounded-xl border min-w-[80px]"
                          style={{ background: col.bg, borderColor: col.border, color: col.color }}
                        >
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => renameStage(s.id, e.currentTarget.textContent || s.name)}
                            className="text-xs font-bold outline-none min-w-[40px]"
                          >
                            {s.name}
                          </span>
                          <select
                            value={s.type}
                            onChange={(e) => changeType(s.id, e.target.value as Stage["type"])}
                            className="text-[9px] bg-transparent border-none outline-none cursor-pointer font-medium opacity-70"
                            style={{ color: col.color }}
                          >
                            {(Object.keys(STAGE_TYPE_LABELS) as Stage["type"][]).map((t) => (
                              <option key={t} value={t}>{STAGE_TYPE_LABELS[t]}</option>
                            ))}
                          </select>
                          {editingWip === s.id ? (
                            <input
                              autoFocus
                              type="number"
                              min={1}
                              placeholder="WIP"
                              className="w-12 text-[9px] bg-white/60 rounded px-1 outline-none border border-current/20"
                              onBlur={(e) => setWip(s.id, e.target.value ? Number(e.target.value) : null)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") setWip(s.id, Number((e.target as HTMLInputElement).value) || null);
                                if (e.key === "Escape") setEditingWip(null);
                              }}
                            />
                          ) : (
                            <button
                              onClick={() => setEditingWip(s.id)}
                              className="text-[9px] opacity-50 hover:opacity-100 text-left transition-opacity"
                            >
                              {s.wip ? `WIP: ${s.wip}` : "+ WIP limit"}
                            </button>
                          )}
                          {s.type === "commitment" && (
                            <span className="text-[9px] font-bold opacity-80 mt-0.5">★ compromisso</span>
                          )}
                        </div>
                        <button
                          onClick={() => removeStage(s.id)}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                        >
                          <X size={8} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 items-center flex-wrap">
                <input
                  type="text"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addStage()}
                  placeholder="Nome da etapa..."
                  className="px-3 py-2 text-xs bg-gray-50 border border-dashed border-gray-200 rounded-xl outline-none focus:border-[#534AB7] focus:bg-white transition-all w-44"
                />
                <select
                  value={newStageType}
                  onChange={(e) => setNewStageType(e.target.value as Stage["type"])}
                  className="px-2 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#534AB7] transition-all"
                >
                  {(Object.keys(STAGE_TYPE_LABELS) as Stage["type"][]).map((t) => (
                    <option key={t} value={t}>{STAGE_TYPE_LABELS[t]}</option>
                  ))}
                </select>
                <button
                  onClick={addStage}
                  className="flex items-center gap-1 px-3 py-2 bg-[#534AB7] text-white text-xs font-bold rounded-xl hover:bg-[#3C3489] transition-colors"
                >
                  <Plus size={12} /> Etapa
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3">
              {(Object.keys(STAGE_COLORS) as Stage["type"][]).map((t) => (
                <div key={t} className="flex items-center gap-1.5 text-[10px] text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-sm border" style={{ background: STAGE_COLORS[t].bg, borderColor: STAGE_COLORS[t].border }} />
                  {STAGE_TYPE_LABELS[t]}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button onClick={() => setPhase(1)} className="px-4 py-2 text-xs font-bold text-gray-400 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                ← Rever diagnóstico
              </button>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#E1F5EE] text-[#085041] text-xs font-bold rounded-xl">
                <Check size={12} /> Fluxo salvo automaticamente
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
