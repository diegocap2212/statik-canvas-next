"use server";

import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { callClaude, FACILITATOR_PROMPT, DIAGNOSIS_PROMPT } from "@/lib/anthropic";

// Temporary mock user ID until Google Auth is implemented
const MOCK_USER_ID = "diego-caporusso-mock";

type SessionData = typeof sessions.$inferSelect["data"];

async function ensureMockUser() {
  const existing = await db.query.users.findFirst({
    where: eq(users.id, MOCK_USER_ID),
  });
  if (!existing) {
    await db.insert(users).values({
      id: MOCK_USER_ID,
      name: "Diego Caporusso",
      email: "diego@example.com",
    });
  }
}

export async function createSession(
  productName: string,
  facilitator?: string,
  context?: string
) {
  await ensureMockUser();
  const [newSession] = await db
    .insert(sessions)
    .values({ userId: MOCK_USER_ID, productName, facilitator, context })
    .returning();
  if (!newSession) throw new Error("Falha ao criar a sessão no banco de dados.");
  return newSession;
}

export async function updateSessionData(id: string, data: SessionData) {
  await db
    .update(sessions)
    .set({ data, updatedAt: new Date() })
    .where(eq(sessions.id, id));
}

export async function getAiObservation(
  id: string,
  step: number,
  content: string
) {
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, id),
  });
  if (!session) throw new Error("Sessão não encontrada");

  const userMsg = `Produto: ${session.productName}. Contexto: ${session.context ?? "não informado"}. Etapa ${step}: ${content}.\nDados de suporte da sessão: ${JSON.stringify(session.data)}`;

  const observation = await callClaude(FACILITATOR_PROMPT, userMsg);

  // Cache the result in the DB
  const newCache = { ...(session.aiCache as Record<number, string> ?? {}), [step]: observation };
  await db.update(sessions).set({ aiCache: newCache }).where(eq(sessions.id, id));

  return observation;
}

export async function generateFinalDiagnosis(id: string) {
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, id),
  });
  if (!session) throw new Error("Sessão não encontrada");

  const summary = `SESSÃO STATIK CANVAS
Produto: ${session.productName}
Facilitador: ${session.facilitator ?? "não informado"}
Contexto: ${session.context ?? "não informado"}
Dados completos: ${JSON.stringify(session.data, null, 2)}
Observações IA por etapa: ${JSON.stringify(session.aiCache, null, 2)}`;

  const rawResult = await callClaude(DIAGNOSIS_PROMPT, summary, 2048);

  // Robust JSON parsing — strips any accidental markdown fences
  const clean = rawResult
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let diagnosis: { overview: string; patterns: string[]; nextsteps: string[] };

  try {
    diagnosis = JSON.parse(clean);
  } catch (parseError) {
    console.error("JSON parse failed. Raw response was:", rawResult);
    const fixPrompt = `O texto abaixo deveria ser um JSON válido mas não é. Corrija-o e retorne APENAS o JSON, sem nenhum texto adicional:\n\n${rawResult}`;
    const fixed = await callClaude("Retorne apenas JSON válido, sem markdown.", fixPrompt, 2048);
    const fixedClean = fixed.replace(/```json|```/gi, "").trim();
    diagnosis = JSON.parse(fixedClean);
  }

  await db
    .update(sessions)
    .set({ diagnosis, isDone: true })
    .where(eq(sessions.id, id));

  return diagnosis;
}

export async function getUserSessions() {
  await ensureMockUser();
  return db.query.sessions.findMany({
    where: eq(sessions.userId, MOCK_USER_ID),
    orderBy: (sessions, { desc }) => [desc(sessions.createdAt)],
  });
}
