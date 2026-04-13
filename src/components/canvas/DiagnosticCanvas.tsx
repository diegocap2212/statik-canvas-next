"use client";

import { useRef } from "react";
import { Download } from "lucide-react";

interface Session {
  productName: string;
  facilitator?: string | null;
  context?: string | null;
  createdAt: Date | string;
  data?: {
    tagsInternal?: string[];
    tagsExternal?: string[];
    demands?: string[][];
    cadences?: string[][];
    workflow?: string[];
    classes?: string[];
    steps?: Record<string, string>;
  } | null;
  aiCache?: Record<number, string> | null;
  diagnosis?: {
    overview?: string;
    patterns?: string[];
    nextsteps?: string[];
  } | null;
}

interface DiagnosticCanvasProps {
  session: Session;
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

const STAGE_COLORS: Record<string, { bg: string; header: string; text: string; border: string }> = {
  discovery:  { bg: "#FBEAF0", header: "#993556", text: "#72243E", border: "#ED93B1" },
  commitment: { bg: "#FAEEDA", header: "#BA7517", text: "#633806", border: "#EF9F27" },
  delivery:   { bg: "#EEEDFE", header: "#534AB7", text: "#3C3489", border: "#AFA9EC" },
  queue:      { bg: "#F1EFE8", header: "#888780", text: "#5F5E5A", border: "#B4B2A9" },
  done:       { bg: "#E1F5EE", header: "#1D9E75", text: "#085041", border: "#5DCAA5" },
  review:     { bg: "#E6F1FB", header: "#185FA5", text: "#0C447C", border: "#85B7EB" },
};

const DEMAND_COLORS: Record<string, string> = {
  feature: "#534AB7",
  bug:     "#D85A30",
  incidente: "#E24B4A",
  melhoria:  "#1D9E75",
  projeto:   "#185FA5",
  legal:     "#BA7517",
  default:   "#888780",
};

const CLASS_COLORS: Record<string, { bg: string; header: string; text: string; label: string }> = {
  expedite:   { bg: "#FCEBEB", header: "#E24B4A", text: "#A32D2D", label: "EXPEDITE" },
  "fixed-date": { bg: "#FAEEDA", header: "#BA7517", text: "#633806", label: "DATA FIXA" },
  standard:   { bg: "#EEEDFE", header: "#534AB7", text: "#3C3489", label: "PADRÃO" },
  intangible: { bg: "#E1F5EE", header: "#1D9E75", text: "#085041", label: "INTANGÍVEL" },
};

const CADENCE_COLORS = [
  { bg: "#E1F5EE", border: "#5DCAA5", text: "#085041" },
  { bg: "#EEEDFE", border: "#AFA9EC", text: "#3C3489" },
  { bg: "#FAEEDA", border: "#EF9F27", text: "#633806" },
  { bg: "#FAECE7", border: "#F0997B", text: "#712B13" },
  { bg: "#E6F1FB", border: "#85B7EB", text: "#0C447C" },
];

function guessStageType(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("ideia") || n.includes("discovery") || n.includes("explora") || n.includes("pesquisa")) return "discovery";
  if (n.includes("pront") || n.includes("compromisso") || n.includes("aprovação") || n.includes("aprovacao")) return "commitment";
  if (n.includes("entregue") || n.includes("done") || n.includes("encerrado") || n.includes("deploy") || n.includes("prod")) return "done";
  if (n.includes("review") || n.includes("revisão") || n.includes("revisao") || n.includes("teste") || n.includes("qa")) return "review";
  if (n.includes("backlog") || n.includes("fila") || n.includes("aguard")) return "queue";
  return "delivery";
}

function guessDemandColor(type: string): string {
  const t = type.toLowerCase();
  for (const key in DEMAND_COLORS) {
    if (t.includes(key)) return DEMAND_COLORS[key];
  }
  return DEMAND_COLORS.default;
}

function truncate(str: string, max: number): string {
  if (!str) return "";
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

function wrapText(text: string, maxChars: number): string[] {
  if (!text) return [];
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

// ─── SVG BUILDER ────────────────────────────────────────────────────────────

function buildSVG(session: Session): string {
  const data      = session.data      ?? {};
  const diagnosis = session.diagnosis ?? {};
  const aiCache   = session.aiCache   ?? {};

  const workflow     = data.workflow     ?? ["Backlog", "Em andamento", "Em revisão", "Entregue"];
  const demands      = data.demands      ?? [];
  const cadences     = data.cadences     ?? [];
  const classes      = data.classes      ?? ["standard"];
  const tagsInternal = data.tagsInternal ?? [];
  const tagsExternal = data.tagsExternal ?? [];
  const steps        = data.steps        ?? {};

  const date = new Date(session.createdAt).toLocaleDateString("pt-BR");

  // ── Layout constants
  const W            = 960;
  const HEADER_H     = 44;
  const DISSATISF_H  = 72;
  const WORKFLOW_LABEL_H = 20;
  const WORKFLOW_H   = 100;
  const DEMAND_H     = Math.max(56, 36 + demands.length * 16);
  const CADENCE_H    = 96;
  const BOTTOM_H     = 72;
  const FOOTER_H     = 88;
  const PAD          = 16;

  const Y_DISSATISF  = HEADER_H + 8;
  const Y_WF_LABEL   = Y_DISSATISF + DISSATISF_H + 8;
  const Y_WF         = Y_WF_LABEL + WORKFLOW_LABEL_H;
  const Y_DEMAND     = Y_WF + WORKFLOW_H + 8;
  const Y_CADENCE    = Y_DEMAND + DEMAND_H + 8;
  const Y_BOTTOM     = Y_CADENCE + CADENCE_H + 8;
  const Y_FOOTER     = Y_BOTTOM + BOTTOM_H + 8;
  const TOTAL_H      = Y_FOOTER + FOOTER_H + 16;

  const INNER_W = W - PAD * 2;

  let svg = `<svg id="staticDiagSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${TOTAL_H}" style="width:100%;height:auto;display:block">`;
  svg += `<rect width="${W}" height="${TOTAL_H}" fill="#FAFAF8"/>`;

  // ── HEADER
  svg += `<rect x="0" y="0" width="${W}" height="${HEADER_H}" fill="#534AB7"/>`;
  svg += `<text x="20" y="${HEADER_H / 2}" font-family="Georgia,serif" font-size="14" fill="white" dominant-baseline="middle">STATIK Canvas</text>`;
  svg += `<text x="130" y="${HEADER_H / 2}" font-family="system-ui,sans-serif" font-size="9" fill="rgba(255,255,255,0.6)" font-weight="500" letter-spacing="0.08em" dominant-baseline="middle">RESULTADO DA SESSÃO</text>`;
  svg += `<text x="${W - 16}" y="${HEADER_H / 2}" font-family="system-ui,sans-serif" font-size="9" fill="rgba(255,255,255,0.5)" text-anchor="end" dominant-baseline="middle">${truncate(session.productName, 40)} · ${date}</text>`;

  // ── INSATISFAÇÕES
  svg += `<rect x="${PAD}" y="${Y_DISSATISF}" width="${INNER_W}" height="${DISSATISF_H}" rx="8" fill="white" stroke="#F0997B" stroke-width="0.5"/>`;
  svg += `<rect x="${PAD}" y="${Y_DISSATISF}" width="4" height="${DISSATISF_H}" rx="2" fill="#D85A30"/>`;
  svg += `<text x="${PAD + 12}" y="${Y_DISSATISF + 14}" font-family="system-ui,sans-serif" font-size="8" fill="#993C1D" font-weight="700" letter-spacing="0.1em">INSATISFAÇÕES</text>`;

  // Internal
  const intText = tagsInternal.length > 0 ? tagsInternal.join(" · ") : "Não registradas";
  svg += `<rect x="${PAD + 12}" y="${Y_DISSATISF + 22}" width="200" height="40" rx="5" fill="#FAECE7" stroke="#F0997B" stroke-width="0.5" stroke-dasharray="3,2"/>`;
  svg += `<text x="${PAD + 20}" y="${Y_DISSATISF + 34}" font-family="system-ui,sans-serif" font-size="7" fill="#993C1D" font-weight="700" letter-spacing="0.06em">INTERNAS</text>`;
  wrapText(intText, 32).slice(0, 2).forEach((line, li) => {
    svg += `<text x="${PAD + 20}" y="${Y_DISSATISF + 44 + li * 10}" font-family="system-ui,sans-serif" font-size="8" fill="#712B13">${line}</text>`;
  });

  // External
  const extText = tagsExternal.length > 0 ? tagsExternal.join(" · ") : "Não registradas";
  svg += `<rect x="${PAD + 222}" y="${Y_DISSATISF + 22}" width="200" height="40" rx="5" fill="#FAECE7" stroke="#F0997B" stroke-width="0.5" stroke-dasharray="3,2"/>`;
  svg += `<text x="${PAD + 230}" y="${Y_DISSATISF + 34}" font-family="system-ui,sans-serif" font-size="7" fill="#993C1D" font-weight="700" letter-spacing="0.06em">EXTERNAS</text>`;
  wrapText(extText, 32).slice(0, 2).forEach((line, li) => {
    svg += `<text x="${PAD + 230}" y="${Y_DISSATISF + 44 + li * 10}" font-family="system-ui,sans-serif" font-size="8" fill="#712B13">${line}</text>`;
  });

  // Priority note
  const priority = steps.s2Priority ?? "";
  if (priority) {
    svg += `<rect x="${PAD + 434}" y="${Y_DISSATISF + 22}" width="${INNER_W - 446}" height="40" rx="5" fill="#EEEDFE" stroke="#AFA9EC" stroke-width="0.5"/>`;
    svg += `<text x="${PAD + 442}" y="${Y_DISSATISF + 34}" font-family="system-ui,sans-serif" font-size="7" fill="#534AB7" font-weight="700" letter-spacing="0.06em">CRÍTICAS</text>`;
    wrapText(priority, 52).slice(0, 2).forEach((line, li) => {
      svg += `<text x="${PAD + 442}" y="${Y_DISSATISF + 44 + li * 10}" font-family="system-ui,sans-serif" font-size="8" fill="#3C3489">${line}</text>`;
    });
  }

  // ── WORKFLOW LABEL
  svg += `<text x="${PAD + 12}" y="${Y_WF_LABEL + 14}" font-family="system-ui,sans-serif" font-size="8" fill="#888780" font-weight="700" letter-spacing="0.1em">WORKFLOW</text>`;

  // ── WORKFLOW STAGES
  const stageCount = workflow.length;
  const arrowW     = 20;
  const totalArrows = (stageCount - 1) * arrowW;
  const stageW     = Math.min(160, Math.floor((INNER_W - totalArrows) / stageCount));
  const totalUsed  = stageW * stageCount + totalArrows;
  let stageX       = PAD + Math.floor((INNER_W - totalUsed) / 2);

  workflow.forEach((name, i) => {
    const type  = guessStageType(name);
    const col   = STAGE_COLORS[type] ?? STAGE_COLORS.delivery;
    const sX    = stageX;

    if (i > 0) {
      const aX = sX - arrowW;
      svg += `<line x1="${aX}" y1="${Y_WF + WORKFLOW_H / 2}" x2="${aX + arrowW - 4}" y2="${Y_WF + WORKFLOW_H / 2}" stroke="#B4B2A9" stroke-width="1.5"/>`;
      svg += `<polygon points="${aX + arrowW - 4},${Y_WF + WORKFLOW_H / 2 - 4} ${aX + arrowW},${Y_WF + WORKFLOW_H / 2} ${aX + arrowW - 4},${Y_WF + WORKFLOW_H / 2 + 4}" fill="#B4B2A9"/>`;
    }

    svg += `<rect x="${sX}" y="${Y_WF}" width="${stageW}" height="${WORKFLOW_H}" rx="8" fill="${col.bg}" stroke="${col.border}" stroke-width="${type === "commitment" ? 1.5 : 0.8}"/>`;
    svg += `<rect x="${sX}" y="${Y_WF}" width="${stageW}" height="20" rx="8" fill="${col.header}"/>`;
    svg += `<rect x="${sX}" y="${Y_WF + 12}" width="${stageW}" height="8" fill="${col.header}"/>`;
    svg += `<text x="${sX + stageW / 2}" y="${Y_WF + 10}" font-family="system-ui,sans-serif" font-size="8" fill="white" font-weight="700" text-anchor="middle" dominant-baseline="middle">${truncate(name.toUpperCase(), 16)}</text>`;

    if (type === "commitment") {
      svg += `<text x="${sX + stageW / 2}" y="${Y_WF + 32}" font-family="system-ui,sans-serif" font-size="7" fill="${col.text}" text-anchor="middle" font-weight="700">★ ponto de compromisso</text>`;
    }

    // Demand type pills inside stage
    const demandTypes = demands
      .filter(d => d[0])
      .map(d => ({ name: d[0], color: guessDemandColor(d[0]) }))
      .slice(0, 3);

    demandTypes.forEach((dt, di) => {
      const pillX = sX + 6 + di * (Math.floor((stageW - 12) / 3) + 2);
      const pillW = Math.floor((stageW - 12 - (demandTypes.length - 1) * 2) / demandTypes.length);
      svg += `<rect x="${pillX}" y="${Y_WF + 72}" width="${pillW}" height="10" rx="2" fill="${dt.color}"/>`;
      svg += `<text x="${pillX + pillW / 2}" y="${Y_WF + 77}" font-family="system-ui,sans-serif" font-size="6" fill="white" text-anchor="middle" dominant-baseline="middle">${truncate(dt.name, 8)}</text>`;
    });

    stageX += stageW + arrowW;
  });

  // ── DEMANDA
  svg += `<rect x="${PAD}" y="${Y_DEMAND}" width="${INNER_W}" height="${DEMAND_H}" rx="8" fill="white" stroke="#B4B2A9" stroke-width="0.5"/>`;
  svg += `<rect x="${PAD}" y="${Y_DEMAND}" width="4" height="${DEMAND_H}" rx="2" fill="#888780"/>`;
  svg += `<text x="${PAD + 12}" y="${Y_DEMAND + 14}" font-family="system-ui,sans-serif" font-size="8" fill="#5F5E5A" font-weight="700" letter-spacing="0.1em">ANÁLISE DA DEMANDA</text>`;

  const COL_HEADERS = ["TIPO", "ORIGEM", "FREQUÊNCIA", "NATUREZA", "SLA / EXPECTATIVA", "CLASSE"];
  const COL_X = [PAD + 12, PAD + 140, PAD + 268, PAD + 376, PAD + 484, PAD + 622];

  COL_HEADERS.forEach((h, ci) => {
    svg += `<text x="${COL_X[ci]}" y="${Y_DEMAND + 28}" font-family="system-ui,sans-serif" font-size="7" fill="#B4B2A9" font-weight="700" letter-spacing="0.08em">${h}</text>`;
  });
  svg += `<line x1="${PAD + 12}" y1="${Y_DEMAND + 32}" x2="${PAD + INNER_W - 12}" y2="${Y_DEMAND + 32}" stroke="#F1EFE8" stroke-width="0.5"/>`;

  demands.slice(0, 4).forEach((row, ri) => {
    const rowY = Y_DEMAND + 36 + ri * 14;
    if (row[0]) {
      const dc = guessDemandColor(row[0]);
      svg += `<rect x="${COL_X[0]}" y="${rowY - 2}" width="60" height="10" rx="2" fill="${dc}"/>`;
      svg += `<text x="${COL_X[0] + 30}" y="${rowY + 3}" font-family="system-ui,sans-serif" font-size="7" fill="white" text-anchor="middle" dominant-baseline="middle">${truncate(row[0], 10)}</text>`;
    }
    if (row[1]) svg += `<text x="${COL_X[1]}" y="${rowY + 3}" font-family="system-ui,sans-serif" font-size="8" fill="#444441" dominant-baseline="middle">${truncate(row[1], 16)}</text>`;
    if (row[2]) svg += `<text x="${COL_X[2]}" y="${rowY + 3}" font-family="system-ui,sans-serif" font-size="8" fill="#444441" dominant-baseline="middle">${truncate(row[2], 14)}</text>`;
    if (row[3]) svg += `<text x="${COL_X[3]}" y="${rowY + 3}" font-family="system-ui,sans-serif" font-size="8" fill="#444441" dominant-baseline="middle">${truncate(row[3], 14)}</text>`;
    if (row[4]) svg += `<text x="${COL_X[4]}" y="${rowY + 3}" font-family="system-ui,sans-serif" font-size="8" fill="#444441" dominant-baseline="middle">${truncate(row[4], 18)}</text>`;
  });

  // ── CADÊNCIAS
  svg += `<rect x="${PAD}" y="${Y_CADENCE}" width="${INNER_W}" height="${CADENCE_H}" rx="8" fill="white" stroke="#9FE1CB" stroke-width="0.5"/>`;
  svg += `<rect x="${PAD}" y="${Y_CADENCE}" width="4" height="${CADENCE_H}" rx="2" fill="#1D9E75"/>`;
  svg += `<text x="${PAD + 12}" y="${Y_CADENCE + 14}" font-family="system-ui,sans-serif" font-size="8" fill="#085041" font-weight="700" letter-spacing="0.1em">CADÊNCIAS</text>`;
  svg += `<line x1="${PAD + 12}" y1="${Y_CADENCE + 54}" x2="${PAD + INNER_W - 12}" y2="${Y_CADENCE + 54}" stroke="#D3D1C7" stroke-width="1"/>`;

  const displayCadences = cadences.length > 0
    ? cadences.slice(0, 6)
    : [["Daily","Diária"],["Retro","Quinzenal"],["Planning","Quinzenal"]];

  const cadSpacing = Math.floor((INNER_W - 24) / Math.max(displayCadences.length, 1));

  displayCadences.forEach((cad, ci) => {
    const cx  = PAD + 12 + ci * cadSpacing + cadSpacing / 2;
    const col = CADENCE_COLORS[ci % CADENCE_COLORS.length];
    const bw  = Math.min(90, cadSpacing - 8);
    svg += `<rect x="${cx - bw / 2}" y="${Y_CADENCE + 22}" width="${bw}" height="26" rx="5" fill="${col.bg}" stroke="${col.border}" stroke-width="0.5"/>`;
    svg += `<text x="${cx}" y="${Y_CADENCE + 35}" font-family="system-ui,sans-serif" font-size="8" fill="${col.text}" text-anchor="middle" dominant-baseline="middle" font-weight="500">${truncate(cad[0] ?? "", 12)}</text>`;
    svg += `<line x1="${cx}" y1="${Y_CADENCE + 48}" x2="${cx}" y2="${Y_CADENCE + 58}" stroke="${col.border}" stroke-width="0.5" stroke-dasharray="2,2"/>`;
    svg += `<text x="${cx}" y="${Y_CADENCE + 68}" font-family="system-ui,sans-serif" font-size="7" fill="#888780" text-anchor="middle">${truncate(cad[1] ?? "", 12)}</text>`;
  });

  // ── CAPACIDADE + CLASSES
  const halfW   = Math.floor((INNER_W - 8) / 2);
  const CAP_X   = PAD;
  const CLASS_X = PAD + halfW + 8;

  // Capacidade
  svg += `<rect x="${CAP_X}" y="${Y_BOTTOM}" width="${halfW}" height="${BOTTOM_H}" rx="8" fill="white" stroke="#B4B2A9" stroke-width="0.5"/>`;
  svg += `<rect x="${CAP_X}" y="${Y_BOTTOM}" width="4" height="${BOTTOM_H}" rx="2" fill="#888780"/>`;
  svg += `<text x="${CAP_X + 12}" y="${Y_BOTTOM + 14}" font-family="system-ui,sans-serif" font-size="8" fill="#5F5E5A" font-weight="700" letter-spacing="0.1em">CAPACIDADE</text>`;

  const leadtime   = steps.s4Leadtime   ? truncate(steps.s4Leadtime, 10)   : "—";
  const throughput = steps.s4Throughput ? truncate(steps.s4Throughput, 10) : "—";
  const bottleneck = steps.s4Bottleneck ? truncate(steps.s4Bottleneck, 28) : "Não identificado";

  svg += `<rect x="${CAP_X + 12}" y="${Y_BOTTOM + 22}" width="80" height="38" rx="6" fill="#F1EFE8"/>`;
  svg += `<text x="${CAP_X + 52}" y="${Y_BOTTOM + 38}" font-family="system-ui,sans-serif" font-size="14" fill="#534AB7" text-anchor="middle" font-weight="700" dominant-baseline="middle">${leadtime}</text>`;
  svg += `<text x="${CAP_X + 52}" y="${Y_BOTTOM + 52}" font-family="system-ui,sans-serif" font-size="7" fill="#888780" text-anchor="middle">lead time</text>`;

  svg += `<rect x="${CAP_X + 100}" y="${Y_BOTTOM + 22}" width="80" height="38" rx="6" fill="#F1EFE8"/>`;
  svg += `<text x="${CAP_X + 140}" y="${Y_BOTTOM + 38}" font-family="system-ui,sans-serif" font-size="14" fill="#1D9E75" text-anchor="middle" font-weight="700" dominant-baseline="middle">${throughput}</text>`;
  svg += `<text x="${CAP_X + 140}" y="${Y_BOTTOM + 52}" font-family="system-ui,sans-serif" font-size="7" fill="#888780" text-anchor="middle">throughput</text>`;

  svg += `<rect x="${CAP_X + 188}" y="${Y_BOTTOM + 22}" width="${halfW - 200}" height="38" rx="6" fill="#FAECE7"/>`;
  svg += `<text x="${CAP_X + 188 + (halfW - 200) / 2}" y="${Y_BOTTOM + 36}" font-family="system-ui,sans-serif" font-size="8" fill="#712B13" text-anchor="middle" dominant-baseline="middle" font-weight="500">Gargalo</text>`;
  wrapText(bottleneck, 22).slice(0, 2).forEach((line, li) => {
    svg += `<text x="${CAP_X + 188 + (halfW - 200) / 2}" y="${Y_BOTTOM + 48 + li * 9}" font-family="system-ui,sans-serif" font-size="7" fill="#993C1D" text-anchor="middle">${line}</text>`;
  });

  // Classes de Serviço
  svg += `<rect x="${CLASS_X}" y="${Y_BOTTOM}" width="${halfW}" height="${BOTTOM_H}" rx="8" fill="white" stroke="#B4B2A9" stroke-width="0.5"/>`;
  svg += `<rect x="${CLASS_X}" y="${Y_BOTTOM}" width="4" height="${BOTTOM_H}" rx="2" fill="#888780"/>`;
  svg += `<text x="${CLASS_X + 12}" y="${Y_BOTTOM + 14}" font-family="system-ui,sans-serif" font-size="8" fill="#5F5E5A" font-weight="700" letter-spacing="0.1em">CLASSES DE SERVIÇO</text>`;

  const displayClasses = classes.length > 0 ? classes : ["standard"];
  const classW = Math.min(130, Math.floor((halfW - 24) / displayClasses.length));

  displayClasses.forEach((cls, ci) => {
    const col = CLASS_COLORS[cls] ?? CLASS_COLORS.standard;
    const cx  = CLASS_X + 12 + ci * (classW + 4);
    svg += `<rect x="${cx}" y="${Y_BOTTOM + 22}" width="${classW}" height="38" rx="6" fill="${col.bg}" stroke="${col.header}44" stroke-width="0.5"/>`;
    svg += `<rect x="${cx}" y="${Y_BOTTOM + 22}" width="${classW}" height="14" rx="6" fill="${col.header}"/>`;
    svg += `<rect x="${cx}" y="${Y_BOTTOM + 29}" width="${classW}" height="7" fill="${col.header}"/>`;
    svg += `<text x="${cx + classW / 2}" y="${Y_BOTTOM + 29}" font-family="system-ui,sans-serif" font-size="7" fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="700">${col.label}</text>`;
    svg += `<text x="${cx + classW / 2}" y="${Y_BOTTOM + 46}" font-family="system-ui,sans-serif" font-size="7" fill="${col.text}" text-anchor="middle" dominant-baseline="middle">Custo de atraso</text>`;
    svg += `<text x="${cx + classW / 2}" y="${Y_BOTTOM + 56}" font-family="system-ui,sans-serif" font-size="7" fill="${col.text}" text-anchor="middle" dominant-baseline="middle">${cls === "expedite" ? "máximo" : cls === "fixed-date" ? "alto (data fixa)" : cls === "intangible" ? "baixo no curto" : "normal"}</text>`;
  });

  // ── FOOTER: PROPÓSITO + SÍNTESE
  svg += `<rect x="${PAD}" y="${Y_FOOTER}" width="${INNER_W}" height="${FOOTER_H}" rx="8" fill="#534AB7"/>`;
  svg += `<text x="${PAD + 12}" y="${Y_FOOTER + 16}" font-family="system-ui,sans-serif" font-size="8" fill="rgba(255,255,255,0.6)" font-weight="700" letter-spacing="0.1em">PROPÓSITO DO SERVIÇO</text>`;

  const purpose = steps.s1Purpose ?? session.context ?? "Não registrado";
  wrapText(purpose, 110).slice(0, 2).forEach((line, li) => {
    svg += `<text x="${PAD + 12}" y="${Y_FOOTER + 30 + li * 12}" font-family="Georgia,serif" font-size="10" fill="white">${line}</text>`;
  });

  svg += `<line x1="${PAD + 12}" y1="${Y_FOOTER + 54}" x2="${PAD + INNER_W - 12}" y2="${Y_FOOTER + 54}" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>`;
  svg += `<text x="${PAD + 12}" y="${Y_FOOTER + 64}" font-family="system-ui,sans-serif" font-size="8" fill="rgba(255,255,255,0.6)" font-weight="700" letter-spacing="0.1em">SÍNTESE IA</text>`;

  const synText = diagnosis.overview ?? aiCache[7] ?? aiCache[6] ?? "Diagnóstico não gerado ainda.";
  wrapText(synText, 110).slice(0, 2).forEach((line, li) => {
    svg += `<text x="${PAD + 12}" y="${Y_FOOTER + 76 + li * 11}" font-family="system-ui,sans-serif" font-size="9" fill="rgba(255,255,255,0.9)">${line}</text>`;
  });

  svg += `</svg>`;
  return svg;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export function DiagnosticCanvas({ session }: DiagnosticCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  function exportPNG() {
    const svgEl = containerRef.current?.querySelector("svg");
    if (!svgEl) return;

    const serializer = new XMLSerializer();
    const svgStr     = serializer.serializeToString(svgEl);
    const b64        = btoa(unescape(encodeURIComponent(svgStr)));

    const viewBox = svgEl.getAttribute("viewBox")?.split(" ").map(Number) ?? [0, 0, 960, 700];
    const vW = viewBox[2];
    const vH = viewBox[3];
    const scale = 2;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width  = vW * scale;
      canvas.height = vH * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#FAFAF8";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement("a");
      a.download = `statik-${session.productName.replace(/\s+/g, "-").toLowerCase()}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${b64}`;
  }

  const svgMarkup = buildSVG(session);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Artefato da Sessão
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Todas as dimensões do STATIK consolidadas num único visual exportável.
          </p>
        </div>
        <button
          onClick={exportPNG}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#534AB7] text-white text-xs font-bold rounded-xl hover:bg-[#3C3489] transition-colors shadow-lg shadow-[#534AB7]/20"
        >
          <Download size={13} />
          Exportar PNG
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 px-1">
        {[
          { color: "#534AB7", label: "Etapa de delivery" },
          { color: "#BA7517", label: "Ponto de compromisso" },
          { color: "#993556", label: "Discovery" },
          { color: "#1D9E75", label: "Entregue / Done" },
          { color: "#D85A30", label: "Insatisfação" },
          { color: "#1D9E75", label: "Cadência de feedback", dashed: true },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{
                background: item.color + (item.dashed ? "22" : ""),
                border: `1.5px ${item.dashed ? "dashed" : "solid"} ${item.color}`,
              }}
            />
            <span className="text-[10px] text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
