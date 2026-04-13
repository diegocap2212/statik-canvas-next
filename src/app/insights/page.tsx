import { fetchJiraIssues, calcMetrics, generateOpportunities } from "@/lib/jira";
import { InsightsView, ErrorState } from "@/components/insights/InsightsView";
import { getNaveAnalysis } from "@/app/actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function InsightsPage() {
  try {
    const { issues, statusCategoryMap, error } = await fetchJiraIssues();
    console.log(`InsightsPage: data fetch complete. Error: ${error}, Issues: ${issues?.length || 0}`);
    if (error) {
      return <ErrorState message={error} />;
    }

    if (!issues || issues.length === 0) {
      return <ErrorState message="Nenhuma issue encontrada no projeto OTE. Verifique as configurações do projeto." />;
    }

    const metrics = calcMetrics(issues, statusCategoryMap);
    const naveMetrics = await getNaveAnalysis();
    const opportunities = await generateOpportunities(metrics, naveMetrics);

    return (
      <InsightsView 
        metrics={metrics} 
        opportunities={opportunities} 
        totalIssues={issues.length} 
        naveMetrics={naveMetrics}
      />
    );
  } catch (err: any) {
    return <ErrorState message={err.message || "Erro desconhecido ao carregar insights."} />;
  }
}
