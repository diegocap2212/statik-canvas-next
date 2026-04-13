import { callClaude } from "./anthropic";

function getJiraConfig() {
  const sanitize = (val?: string) => val?.trim().replace(/^\uFEFF/, "");
  const sanitizeDomain = (val?: string) => sanitize(val)?.replace(/^https?:\/\//, "").replace(/\/$/, "");
  
  return {
    domain: sanitizeDomain(process.env.JIRA_DOMAIN) || "otmow-team.atlassian.net",
    email: sanitize(process.env.JIRA_EMAIL) || "suporte@otmow.com",
    token: sanitize(process.env.Statik_API) || sanitize(process.env.JIRA_API_TOKEN)
  };
}

function getAuthHeaders() {
  const { email, token } = getJiraConfig();
  // Ensure we don't have spaces or odd chars in the base64
  const auth = Buffer.from(`${(email || "").trim()}:${(token || "").trim()}`).toString("base64");
  return {
    "Authorization": `Basic ${auth}`,
    "Accept": "application/json",
    "Content-Type": "application/json",
    "User-Agent": "StatikCanvas/1.0 (Integration/FlowMetrics)"
  };
}

export interface FlowMetrics {
  leadTime: { avg: number; p50: number; p85: number; p95: number; samples: number };
  cycleTime: { avg: number; p50: number; p85: number; p95: number; samples: number };
  throughput: { weeks: { label: string; count: number; leadTime: number }[] };
  wip: { stage: string; count: number }[];
  demographics: {
    done: { type: string; count: number }[];
    wip: { type: string; count: number }[];
    todo: { type: string; count: number }[];
  };
  flowEfficiency: number;
  monteCarlo?: {
    backlogSize: number;
    p50Weeks: number;
    p85Weeks: number;
    p95Weeks: number;
  };
}

export interface Opportunity {
  title: string;
  description: string;
  statikStep: string;
}

export interface InsightsData {
  summary: string;
  opportunities: Opportunity[];
}

/**
 * Fetch issues from Jira project OTE with changelog
 */
export async function fetchJiraIssues() {
  const { token, domain } = getJiraConfig();
  if (!token) {
    return { issues: [], statusCategoryMap: {}, error: "JIRA_API_TOKEN não configurado. Verifique as variáveis de ambiente." };
  }

  const issues: any[] = [];
  const maxResults = 100;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    // 1. Get Project Statuses (Compliant GET)
    const statusUrl = `https://${domain}/rest/api/3/project/OTE/statuses`;
    const statusRes = await fetch(statusUrl, {
      headers: getAuthHeaders(),
      signal: controller.signal,
      cache: 'no-store'
    });
    
    if (!statusRes.ok) {
      if (statusRes.status === 401) throw new Error("Falha na autenticação (401). Verifique seu Token Jira.");
      throw new Error(`Erro ao conectar (HTTP ${statusRes.status})`);
    }
    const statusData = await statusRes.json();
    const statusCategoryMap: Record<string, string> = {};
    if (Array.isArray(statusData)) {
      statusData.forEach((type: any) => {
        type.statuses?.forEach((s: any) => {
          statusCategoryMap[s.name] = s.statusCategory.key;
        });
      });
    }

    // 2. Fetch Issues using the only working Search API (POST /search/jql)
    // We use token-based pagination to collect ALL historical data.
    const searchUrl = `https://${domain}/rest/api/3/search/jql`;
    let pageToken: string | undefined = undefined;
    let hasMore = true;

    while (hasMore) {
      const searchRes = await fetch(searchUrl, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          jql: "project = OTE ORDER BY created DESC",
          maxResults: maxResults,
          ...(pageToken ? { nextPageToken: pageToken } : {}),
          expand: "changelog",
          fields: ["created", "status", "resolutiondate", "summary", "issuetype", "priority", "statuscategorychangedate"]
        }),
        signal: controller.signal,
        cache: 'no-store'
      });

      if (!searchRes.ok) {
        throw new Error(`Jira Search Error: ${searchRes.statusText}`);
      }

      const searchData: any = await searchRes.json();
      if (searchData.issues) {
        issues.push(...searchData.issues);
      }
      
      pageToken = searchData.nextPageToken;
      hasMore = !!pageToken;
    }

    clearTimeout(timeoutId);
    return { issues, statusCategoryMap, error: null };
  } catch (err: any) {
    if (err.name === "AbortError") return { issues: [], statusCategoryMap: {}, error: "Timeout: O Jira excedeu o tempo limite de 15s." };
    return { issues: [], statusCategoryMap: {}, error: err.message };
  }
}

/**
 * Calculate Flow Metrics from Jira issues
 */
export function calcMetrics(issues: any[], statusCategoryMap: Record<string, string>): FlowMetrics {
  const now = new Date();
  const leadTimes: number[] = [];
  const cycleTimes: number[] = [];
  const completedLast12Weeks: { [key: string]: { count: number; leadTimes: number[] } } = {};
  const wipStages: { [key: string]: number } = {};
  const demoMap = { done: {} as Record<string, number>, wip: {} as Record<string, number>, todo: {} as Record<string, number> };
  
  // Weekly structure for throughput
  const weeks: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const startOfWeek = getStartOfWeek(d);
    const label = `${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1}`;
    weeks.push(label);
    completedLast12Weeks[label] = { count: 0, leadTimes: [] };
  }

  let totalActiveTime = 0;
  let totalLeadTimeForEfficiency = 0;
  let efficiencySamples = 0;

  issues.forEach(issue => {
    const created = new Date(issue.fields.created);
    const resolved = issue.fields.resolutiondate ? new Date(issue.fields.resolutiondate) : null;
    const statusKey = issue.fields.status.statusCategory.key;
    const issueType = issue.fields.issuetype?.name || "Desconhecido";

    // Demographics
    let cat = "todo";
    if (statusKey === "done") cat = "done";
    else if (statusKey === "indeterminate") cat = "wip";
    demoMap[cat as keyof typeof demoMap][issueType] = (demoMap[cat as keyof typeof demoMap][issueType] || 0) + 1;

    // 1. Lead Time
    if (resolved) {
      const lt = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      leadTimes.push(lt);

      // Throughput
      const startOfWeek = getStartOfWeek(resolved);
      const label = `${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1}`;
      if (completedLast12Weeks[label] !== undefined) {
        completedLast12Weeks[label].count++;
        completedLast12Weeks[label].leadTimes.push(lt);
      }
    }

    // 2. Cycle Time Logic
    let firstInProgress: Date | null = null;
    const histories = issue.changelog?.histories || [];
    // Sort chronologically
    const sortedHistories = [...histories].sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());

    sortedHistories.forEach((h: any) => {
      h.items.forEach((item: any) => {
        if (item.field === "status") {
          const cat = statusCategoryMap[item.toString] || "";
          if (cat === "indeterminate" && !firstInProgress) {
            firstInProgress = new Date(h.created);
          }
        }
      });
    });

    if (resolved && firstInProgress) {
      const ct = (resolved.getTime() - (firstInProgress as Date).getTime()) / (1000 * 60 * 60 * 24);
      cycleTimes.push(Math.max(0, ct));
      
      // For Flow Efficiency
      totalActiveTime += ct;
      const lt = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      totalLeadTimeForEfficiency += lt;
      efficiencySamples++;
    }

    // 3. WIP
    if (statusKey === "indeterminate") {
      const stage = issue.fields.status.name;
      wipStages[stage] = (wipStages[stage] || 0) + 1;
    }
  });

  const sortedLT = [...leadTimes].sort((a, b) => a - b);
  const sortedCT = [...cycleTimes].sort((a, b) => a - b);

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  // Monte Carlo Calculation
  const recentThroughputs = Object.values(completedLast12Weeks).map(w => w.count);
  const backlogSize = Object.values(demoMap.todo).reduce((a, b) => a + b, 0);
  
  let monteCarlo;
  if (backlogSize > 0 && recentThroughputs.some(c => c > 0)) {
    const samples: number[] = [];
    for (let i = 0; i < 1000; i++) {
      let remaining = backlogSize;
      let weeksGen = 0;
      while (remaining > 0 && weeksGen < 100) {
        const t = recentThroughputs[Math.floor(Math.random() * recentThroughputs.length)];
        remaining -= t;
        weeksGen++;
      }
      samples.push(weeksGen);
    }
    samples.sort((a, b) => a - b);
    monteCarlo = {
      backlogSize,
      p50Weeks: percentile(samples, 0.5),
      p85Weeks: percentile(samples, 0.85),
      p95Weeks: percentile(samples, 0.95)
    };
  }

  return {
    leadTime: {
      avg: avg(leadTimes),
      p50: percentile(sortedLT, 0.5),
      p85: percentile(sortedLT, 0.85),
      p95: percentile(sortedLT, 0.95),
      samples: leadTimes.length
    },
    cycleTime: {
      avg: avg(cycleTimes),
      p50: percentile(sortedCT, 0.5),
      p85: percentile(sortedCT, 0.85),
      p95: percentile(sortedCT, 0.95),
      samples: cycleTimes.length
    },
    throughput: {
      weeks: weeks.map(label => {
        const d = completedLast12Weeks[label];
        const avgLt = d.leadTimes.length ? d.leadTimes.reduce((a, b) => a + b, 0) / d.leadTimes.length : 0;
        return { label, count: d.count, leadTime: avgLt };
      })
    },
    wip: Object.entries(wipStages).map(([stage, count]) => ({ stage, count })),
    demographics: {
      done: Object.entries(demoMap.done).map(([type, count]) => ({ type, count })),
      wip: Object.entries(demoMap.wip).map(([type, count]) => ({ type, count })),
      todo: Object.entries(demoMap.todo).map(([type, count]) => ({ type, count }))
    },
    flowEfficiency: efficiencySamples > 0 && totalLeadTimeForEfficiency > 0 
      ? (totalActiveTime / totalLeadTimeForEfficiency) * 100 
      : 0,
    monteCarlo
  };
}

// Helpers
function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const index = (arr.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  if (upper >= arr.length) return arr[lower];
  return arr[lower] * (1 - weight) + arr[upper] * weight;
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  return new Date(d.setDate(diff));
}

const JIRA_INSIGHTS_PROMPT = `Você é um consultor sênior em Kanban e STATIK (Systems Thinking Approach to Introducing Kanban).
Analise as métricas de fluxo fornecidas e retorne APENAS um JSON válido.
O objetivo é trazer PROVOCAÇÕES e PERGUNTAS ao time, não afirmações absolutas. Desafie o status quo. Reflita sobre as variabilidades, gargalos, relação cycle time vs lead time e tamanho de WIP.
Formato exato:
{"summary":"2-3 frases com observações provocativas sobre a saúde geral do fluxo","opportunities":[{"title":"pergunta ou reflexão curta","description":"explicação de 2-3 frases com uma provocação baseada nos números para melhorar o sistema","statikStep":"etapa STATIK recomendada"}]}
REGRAS: Responda em português. Apenas o JSON válido, sem markdown.`;

export async function generateOpportunities(metrics: FlowMetrics): Promise<InsightsData> {
  const userMessage = `Métricas Atuais do Fluxo:
  - Lead Time Médio: ${metrics.leadTime.avg.toFixed(1)} dias (p85: ${metrics.leadTime.p85.toFixed(1)})
  - Cycle Time Médio: ${metrics.cycleTime.avg.toFixed(1)} dias (p85: ${metrics.cycleTime.p85.toFixed(1)})
  - Throughput (últimas 12 semanas): ${metrics.throughput.weeks.map(w => w.count).join(", ")}
  - WIP Total: ${metrics.wip.reduce((acc, curr) => acc + curr.count, 0)} itens
  - Eficiência de Fluxo: ${metrics.flowEfficiency.toFixed(1)}%`;

  try {
    const response = await callClaude(JIRA_INSIGHTS_PROMPT, userMessage);
    // Extract JSON if model returned markdown blocks (safety)
    const jsonStr = response.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("Failed to generate opportunities:", err);
    return {
      summary: "Não foi possível gerar a síntese automática no momento. Verifique se o provedor de IA está configurado corretamente.",
      opportunities: []
    };
  }
}
