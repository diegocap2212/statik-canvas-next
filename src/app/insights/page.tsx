import { fetchJiraIssues, calcMetrics, generateOpportunities } from "@/lib/jira";
import { InsightsView, ErrorState } from "@/components/insights/InsightsView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function InsightsPage() {
  try {
    const { issues, statusCategoryMap, error } = await fetchJiraIssues();
    
    if (error) {
      return <ErrorState message={error} />;
    }

    if (!issues || issues.length === 0) {
      return <ErrorState message="Nenhuma issue encontrada no projeto OTE. Verifique as configurações do projeto." />;
    }

    const metrics = calcMetrics(issues, statusCategoryMap);
    const opportunities = await generateOpportunities(metrics);

    return (
      <InsightsView 
        metrics={metrics} 
        opportunities={opportunities} 
        totalIssues={issues.length} 
      />
    );
  } catch (err: any) {
    return <ErrorState message={err.message || "Erro desconhecido ao carregar insights."} />;
  }
}
