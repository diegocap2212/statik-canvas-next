/**
 * Gemini SDK Integration
 * Using Gemini 2.5 Flash as the default high-performance model.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = "gemini-2.5-flash";

export async function callGemini(
  systemPrompt: string,
  userMessage: string,
  maxTokens?: number
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Internal Error: GEMINI_API_KEY ausente nas variáveis de ambiente.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: MODEL,
    systemInstruction: systemPrompt,
    generationConfig: {
      maxOutputTokens: maxTokens
    }
  });

  try {
    const result = await model.generateContent(userMessage);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Resposta vazia da API Gemini.");
    }

    return text;
  } catch (err) {
    console.error("Gemini API Error:", err);
    throw new Error(`Falha na API Gemini: ${(err as Error).message}`);
  }
}

export const FACILITATOR_PROMPT = (stepId: number, product: string) => `Você é um co-facilitador STATIK especialista em Kanban e Pensamento Sistêmico para o produto ${product}.
Estamos na etapa ${stepId} da metodologia.
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
- A resposta deve começar com { e terminar com } e nada mais.`;
