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
  throughput: { 
    weeks: { 
      label: string; 
      count: number; 
      leadTime: number;
      byType: { [type: string]: number };
    }[] 
  };
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

export async function fetchJiraIssues() {
  const { token, domain } = getJiraConfig();
  if (!token) {
    return { issues: [], statusCategoryMap: {}, error: "JIRA_API_TOKEN não configurado. Verifique as variáveis de ambiente." };
  }

  const issues: any[] = [];
  const maxResults = 100;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const statusUrl = `https://${domain}/rest/api/3/project/OTE/statuses`;
    const statusRes = await fetch(statusUrl, {
      headers: getAuthHeaders(),
      signal: controller.signal,
      cache: 'no-store'
    });
    
    if (!statusRes.ok) throw new Error(`Erro ao conectar Status (HTTP ${statusRes.status})`);
    const statusData = await statusRes.json();
    const statusCategoryMap: Record<string, string> = {};
    if (Array.isArray(statusData)) {
      statusData.forEach((type: any) => {
        type.statuses?.forEach((s: any) => {
          statusCategoryMap[s.name] = s.statusCategory.key;
        });
      });
    }

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
          fields: ["created", "status", "resolutiondate", "summary", "issuetype", "priority"]
        }),
        signal: controller.signal,
        cache: 'no-store'
      });

      if (!searchRes.ok) throw new Error(`Jira Search Error: ${searchRes.statusText}`);

      const searchData: any = await searchRes.json();
      if (searchData.issues) issues.push(...searchData.issues);
      pageToken = searchData.nextPageToken;
      hasMore = !!pageToken;
    }

    clearTimeout(timeoutId);
    return { issues, statusCategoryMap, error: null };
  } catch (err: any) {
    return { issues: [], statusCategoryMap: {}, error: err.message };
  }
}

export function calcMetrics(issues: any[], statusCategoryMap: Record<string, string>): FlowMetrics {
  const leadTimes: number[] = [];
  const cycleTimes: number[] = [];
  const completedLast12Weeks: { [key: string]: { count: number; leadTimes: number[]; byType: { [t: string]: number } } } = {};
  const wipStages: { [key: string]: number } = {};
  const demoMap = { done: {} as Record<string, number>, wip: {} as Record<string, number>, todo: {} as Record<string, number> };
  
  const weeks: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const startOfWeek = getStartOfWeek(d);
    const label = `${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1}`;
    weeks.push(label);
    completedLast12Weeks[label] = { count: 0, leadTimes: [], byType: {} };
  }

  let totalActiveTime = 0;
  let totalLeadTimeForEfficiency = 0;
  let efficiencySamples = 0;

  issues.forEach(issue => {
    // CRITICAL FIX: Exclude subtasks
    if (issue.fields.issuetype?.subtask) return;

    const created = new Date(issue.fields.created);
    const resolved = issue.fields.resolutiondate ? new Date(issue.fields.resolutiondate) : null;
    const statusKey = issue.fields.status.statusCategory.key;
    const issueType = issue.fields.issuetype?.name || "Task";

    // Demographics
    let cat = "todo";
    if (statusKey === "done") cat = "done";
    else if (statusKey === "indeterminate") cat = "wip";
    demoMap[cat as keyof typeof demoMap][issueType] = (demoMap[cat as keyof typeof demoMap][issueType] || 0) + 1;

    // 1. Lead Time & Throughput
    if (resolved) {
      const lt = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      leadTimes.push(lt);

      const startOfWeek = getStartOfWeek(resolved);
      const label = `${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1}`;
      if (completedLast12Weeks[label] !== undefined) {
        completedLast12Weeks[label].count++;
        completedLast12Weeks[label].leadTimes.push(lt);
        completedLast12Weeks[label].byType[issueType] = (completedLast12Weeks[label].byType[issueType] || 0) + 1;
      }
    }

    // 2. Cycle Time
    let firstInProgress: Date | null = null;
    const histories = issue.changelog?.histories || [];
    const sortedHistories = [...histories].sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());

    sortedHistories.forEach((h: any) => {
      h.items.forEach((item: any) => {
        if (item.field === "status") {
          const cat = statusCategoryMap[item.toString] || "";
          if (cat === "indeterminate" && !firstInProgress) firstInProgress = new Date(h.created);
        }
      });
    });

    if (resolved && firstInProgress) {
      const ct = (resolved.getTime() - (firstInProgress as Date).getTime()) / (1000 * 60 * 60 * 24);
      cycleTimes.push(Math.max(0, ct));
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

  // Monte Carlo
  const recentThroughputs = Object.values(completedLast12Weeks).map(w => w.count);
  const backlogSize = Object.values(demoMap.todo).reduce((a, b) => a + b, 0);
  let monteCarlo;
  if (backlogSize > 0 && recentThroughputs.some(c => c > 0)) {
    const samples: number[] = [];
    for (let i = 0; i < 1000; i++) {
      let remaining = backlogSize;
      let weeksGen = 0;
      while (remaining > 0 && weeksGen < 100) {
        remaining -= recentThroughputs[Math.floor(Math.random() * recentThroughputs.length)];
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
        return { label, count: d.count, leadTime: avgLt, byType: d.byType };
      })
    },
    wip: Object.entries(wipStages).map(([stage, count]) => ({ stage, count })),
    demographics: {
      done: Object.entries(demoMap.done).map(([type, count]) => ({ type, count })),
      wip: Object.entries(demoMap.wip).map(([type, count]) => ({ type, count })),
      todo: Object.entries(demoMap.todo).map(([type, count]) => ({ type, count }))
    },
    flowEfficiency: efficiencySamples > 0 && totalLeadTimeForEfficiency > 0 ? (totalActiveTime / totalLeadTimeForEfficiency) * 100 : 0,
    monteCarlo
  };
}

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
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

const JIRA_INSIGHTS_PROMPT = `Você é um consultor sênior em Kanban e STATIK.
Analise as métricas de fluxo e retorne APENAS um JSON válido.
Foque em como a distribuição de tipos de itens (Bugs vs Stories) impacta a previsibilidade.
Formato exato:
{"summary":"2-3 frases provocativas","opportunities":[{"title":"título","description":"explicação","statikStep":"etapa"}]}
REGRAS: Responda em português. Apenas JSON.`;

export async function generateOpportunities(metrics: FlowMetrics): Promise<InsightsData> {
  const userMessage = `Métricas:
  - Lead Time Médio: ${metrics.leadTime.avg.toFixed(1)} dias
  - Throughput (últimas 12 semanas): ${metrics.throughput.weeks.map(w => w.count).join(", ")}
  - WIP Total (sem subtasks): ${metrics.wip.reduce((acc, curr) => acc + curr.count, 0)} itens
  - Eficiência: ${metrics.flowEfficiency.toFixed(1)}%`;

  try {
    const response = await callClaude(JIRA_INSIGHTS_PROMPT, userMessage);
    const jsonStr = response.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    return { summary: "Erro ao gerar síntese.", opportunities: [] };
  }
}
