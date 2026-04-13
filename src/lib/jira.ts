import { callGemini } from "./gemini";

function getJiraConfig() {
  return {
    domain: process.env.JIRA_DOMAIN || "otmow-team.atlassian.net",
    email: process.env.JIRA_EMAIL || "suporte@otmow.com",
    token: process.env.Statik_API || process.env.JIRA_API_TOKEN
  };
}

function getAuthHeader() {
  const { email, token } = getJiraConfig();
  return `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`;
}

export interface FlowMetrics {
  leadTime: { avg: number; p50: number; p85: number; p95: number; samples: number };
  cycleTime: { avg: number; p50: number; p85: number; p95: number; samples: number };
  throughput: { weeks: { label: string; count: number }[] };
  wip: { stage: string; count: number }[];
  flowEfficiency: number;
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
  const { token } = getJiraConfig();
  if (!token) {
    return { issues: [], statusCategoryMap: {}, error: "JIRA_API_TOKEN não configurado." };
  }

  const issues: any[] = [];
  let startAt = 0;
  const maxResults = 100;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    // Get Project Statuses first for category mapping
    const { domain } = getJiraConfig();
    const statusUrl = `https://${domain}/rest/api/3/project/OTE/statuses`;
    
    const statusRes = await fetch(statusUrl, {
      headers: { "Authorization": getAuthHeader(), "Accept": "application/json" },
      signal: controller.signal,
      cache: 'no-store'
    });
    
    if (!statusRes.ok) {
      throw new Error(`Falha ao conectar com o Jira (HTTP ${statusRes.status}): ${statusRes.statusText}`);
    }
    const statusData = await statusRes.json();
    
    // Flatten statuses into a map: name -> statusCategory.key
    const statusCategoryMap: Record<string, string> = {};
    statusData.forEach((type: any) => {
      type.statuses.forEach((s: any) => {
        statusCategoryMap[s.name] = s.statusCategory.key;
      });
    });

    while (true) {
      const { domain } = getJiraConfig();
      const url = `https://${domain}/rest/api/3/search?jql=project = OTE ORDER BY created DESC&expand=changelog&fields=summary,status,issuetype,priority,created,resolutiondate,assignee&maxResults=${maxResults}&startAt=${startAt}`;
      
      const response = await fetch(url, {
        headers: { "Authorization": getAuthHeader(), "Accept": "application/json" },
        signal: controller.signal,
        cache: 'no-store'
      });

      if (!response.ok) throw new Error(`Jira API Error: ${response.statusText}`);

      const data = await response.json();
      issues.push(...data.issues);

      if (issues.length >= data.total || data.issues.length === 0) break;
      startAt += maxResults;
    }

    clearTimeout(timeoutId);
    
    // Attach statusCategoryMap to issues for calculation helper
    return { issues, statusCategoryMap, error: null };
  } catch (err: any) {
    if (err.name === "AbortError") return { issues: [], statusCategoryMap: {}, error: "Timeout ao conectar com o Jira (15s)." };
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
  const completedLast12Weeks: { [key: string]: number } = {};
  const wipStages: { [key: string]: number } = {};
  
  // Weekly structure for throughput
  const weeks: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const startOfWeek = getStartOfWeek(d);
    const label = `${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1}`;
    weeks.push(label);
    completedLast12Weeks[label] = 0;
  }

  let totalActiveTime = 0;
  let totalLeadTimeForEfficiency = 0;
  let efficiencySamples = 0;

  issues.forEach(issue => {
    const created = new Date(issue.fields.created);
    const resolved = issue.fields.resolutiondate ? new Date(issue.fields.resolutiondate) : null;
    const statusKey = issue.fields.status.statusCategory.key;

    // 1. Lead Time
    if (resolved) {
      const lt = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      leadTimes.push(lt);

      // Throughput
      const startOfWeek = getStartOfWeek(resolved);
      const label = `${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1}`;
      if (completedLast12Weeks[label] !== undefined) {
        completedLast12Weeks[label]++;
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
      cycleTimes.push(ct);
      
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
      weeks: weeks.map(label => ({ label, count: completedLast12Weeks[label] }))
    },
    wip: Object.entries(wipStages).map(([stage, count]) => ({ stage, count })),
    flowEfficiency: efficiencySamples > 0 && totalLeadTimeForEfficiency > 0 
      ? (totalActiveTime / totalLeadTimeForEfficiency) * 100 
      : 0
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
Analise as métricas de fluxo fornecidas e retorne APENAS um JSON válido:
{"summary":"2-3 frases sobre saúde geral do fluxo","opportunities":[{"title":"título curto","description":"explicação prática de 2-3 frases","statikStep":"etapa STATIK relacionada"}]}
REGRAS: Responda em português. Nada fora do JSON. Sem markdown.`;

export async function generateOpportunities(metrics: FlowMetrics): Promise<InsightsData> {
  const userMessage = `Métricas Atuais do Fluxo:
  - Lead Time Médio: ${metrics.leadTime.avg.toFixed(1)} dias (p85: ${metrics.leadTime.p85.toFixed(1)})
  - Cycle Time Médio: ${metrics.cycleTime.avg.toFixed(1)} dias (p85: ${metrics.cycleTime.p85.toFixed(1)})
  - Throughput (últimas 12 semanas): ${metrics.throughput.weeks.map(w => w.count).join(", ")}
  - WIP Total: ${metrics.wip.reduce((acc, curr) => acc + curr.count, 0)} itens
  - Eficiência de Fluxo: ${metrics.flowEfficiency.toFixed(1)}%`;

  try {
    const response = await callGemini(JIRA_INSIGHTS_PROMPT, userMessage);
    // Extract JSON if model returned markdown blocks (safety)
    const jsonStr = response.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("Failed to generate opportunities:", err);
    return {
      summary: "Não foi possível gerar a síntese automática no momento.",
      opportunities: []
    };
  }
}
