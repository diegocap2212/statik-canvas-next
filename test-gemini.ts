import { callGemini, FACILITATOR_PROMPT } from "./src/lib/gemini";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function test() {
  console.log("Testando Gemini 1.5 Pro...");
  try {
    const response = await callGemini(FACILITATOR_PROMPT, "Produto: Teste. Etapa 1: Melhorar a vazão.");
    console.log("Resposta da IA:", response);
  } catch (err) {
    console.error("Erro no teste:", err);
  }
}

test();
