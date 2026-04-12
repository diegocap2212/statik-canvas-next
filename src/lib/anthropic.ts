const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";
 
export async function callClaude(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
 
  if (!apiKey) {
    throw new Error("Internal Error: ANTHROPIC_API_KEY ausente nas variáveis de ambiente.");
  }
 
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
 
  if (!response.ok) {
    const err = await response.text();
    console.error("Anthropic API Error:", err);
    throw new Error(`Anthropic API retornou status ${response.status}`);
  }
 
  const data = await response.json();
  const text = data.content?.[0]?.text;
 
  if (!text) {
    throw new Error("Resposta vazia da API Anthropic.");
  }
 
  return text;
}
 
export const FACILITATOR_PROMPT = `Você é um co-facilitador STATIK especialista em Kanban e Pensamento Sistêmico.
Responda em português.
Seja direto, específico e provocativo — evite generalidades.
Fale sobre padrões, riscos e oportunidades baseados exclusivamente no conteúdo fornecido.
Nunca use listas ou bullets, apenas prosa fluida.
Máximo 3 frases.`;
 
export const DIAGNOSIS_PROMPT = `Você é um consultor sênior especialista em Kanban e STATIK.
Analise todos os dados fornecidos de uma sessão STATIK e retorne APENAS um JSON válido seguindo esta estrutura exata:
{"overview":"string com 2-3 frases sobre a visão sistêmica e saúde do fluxo","patterns":["padrão ou risco observado 1","padrão ou risco observado 2","padrão ou risco observado 3"],"nextsteps":["ação concreta e prática 1","ação concreta e prática 2","ação concreta e prática 3"]}
REGRAS CRÍTICAS:
- Responda em português.
- Não inclua markdown, não use blocos de código, não escreva nada fora do JSON.
- A resposta deve começar with { e terminar com } e nada mais.`;
