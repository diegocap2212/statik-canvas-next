import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function callGemini(systemPrompt: string, userMessage: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Internal Error: Gemini API Key missing in environment variables.");
  }

  const combinedPrompt = `${systemPrompt}\n\nContexto do Usuário:\n${userMessage}`;

  try {
    const result = await model.generateContent(combinedPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Falha na comunicação com o motor de IA.");
  }
}

export const FACILITATOR_PROMPT = `Você é um co-facilitador STATIK especialista em Kanban e Pensamento Sistêmico. 
Responda em português. 
Seja direto, específico e provocativo — evite generalidades. 
Fale sobre padrões, riscos e oportunidades baseados exclusivamente no conteúdo fornecido.
Nunca use listas ou bullets, apenas prosa fluida. 
Máximo 3 frases.`;

export const DIAGNOSIS_PROMPT = `Você é um consultor sênior especialista em Kanban e STATIK. 
Analise todos os dados fornecidos de uma sessão STATIK e retorne APENAS um JSON válido seguindo esta estrutura:
{
  "overview": "string com 2-3 frases sobre a visão sistêmica e saúde do fluxo",
  "patterns": ["padrão ou risco observado 1", "padrão ou risco observado 2", "padrão ou risco observado 3"],
  "nextsteps": ["ação concreta e prática 1", "ação concreta e prática 2", "ação concreta e prática 3"]
}
Responda em português. Não inclua markdown (não use \`\`\`json), nem explicações fora do JSON.`;
