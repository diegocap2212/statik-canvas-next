"use server";

import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { callGemini, FACILITATOR_PROMPT, DIAGNOSIS_PROMPT } from "@/lib/gemini";
import { revalidatePath } from "next/cache";

// Temporary mock user ID until Google Auth is implemented
const MOCK_USER_ID = "diego-caporusso-mock";

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

export async function createSession(productName: string, facilitator?: string, context?: string) {
  await ensureMockUser();
  const [newSession] = await db
    .insert(sessions)
    .values({
      userId: MOCK_USER_ID,
      productName,
      facilitator,
      context,
    })
    .returning();
  
  return newSession;
}

export async function updateSessionData(id: string, data: any) {
  await db
    .update(sessions)
    .set({ data, updatedAt: new Date() })
    .where(eq(sessions.id, id));
  
  revalidatePath(`/session/${id}`);
}

export async function getAiObservation(id: string, step: number, content: string) {
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, id),
  });

  if (!session) throw new Error("Sessão não encontrada");

  const userMsg = `Produto: ${session.productName}. Contexto: ${session.context}. Etapa ${step}: ${content}. 
  Dados atuais de suporte: ${JSON.stringify(session.data)}`;

  const observation = await callGemini(FACILITATOR_PROMPT, userMsg);

  // Cache it
  const newCache = { ...session.aiCache, [step]: observation };
  await db.update(sessions).set({ aiCache: newCache }).where(eq(sessions.id, id));

  return observation;
}

export async function generateFinalDiagnosis(id: string) {
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, id),
  });

  if (!session) throw new Error("Sessão não encontrada");

  const summary = `SESSÃO IA STATIK CANVAS
Produto: ${session.productName}
Facilitador: ${session.facilitator}
Contexto: ${session.context}
Dados: ${JSON.stringify(session.data)}`;

  const result = await callGemini(DIAGNOSIS_PROMPT, summary);
  const cleanJson = result.replace(/```json|```/g, "").trim();
  const diagnosis = JSON.parse(cleanJson);

  await db.update(sessions).set({ diagnosis, isDone: true }).where(eq(sessions.id, id));

  return diagnosis;
}

export async function getUserSessions() {
  await ensureMockUser();
  return db.query.sessions.findMany({
    where: eq(sessions.userId, MOCK_USER_ID),
    orderBy: (sessions, { desc }) => [desc(sessions.createdAt)],
  });
}
