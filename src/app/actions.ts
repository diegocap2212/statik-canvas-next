"use server";

import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { callGemini, FACILITATOR_PROMPT, DIAGNOSIS_PROMPT } from "@/lib/gemini";

// Temporary mock user ID until Google Auth is implemented
const MOCK_USER_ID = "diego-caporusso-mock";

async function ensureMockUser() {
  // Logic to ensure the mock user exists in the DB if needed
}

export async function createSession(productName: string, facilitator?: string, context?: string) {
  try {
    const [newSession] = await db.insert(sessions).values({
      userId: MOCK_USER_ID,
      productName,
      facilitator: facilitator || null,
      context: context || null,
      data: {
        tagsInternal: [],
        tagsExternal: [],
        demands: [],
        cadences: [],
        workflow: ["Backlog", "Em andamento", "Pausado", "Entregue"],
        classes: [],
        steps: {},
      },
    }).returning();
    return newSession;
  } catch (error) {
    console.error("Failed to create session:", error);
    throw new Error("Failed to create session");
  }
}

export async function getUserSessions() {
  return await db.query.sessions.findMany({
    where: eq(sessions.userId, MOCK_USER_ID),
    orderBy: [desc(sessions.createdAt)],
  });
}

export async function getSession(id: string) {
  return await db.query.sessions.findFirst({
    where: eq(sessions.id, id),
  });
}

export async function updateSessionData(id: string, data: any) {
  await db.update(sessions).set({ data }).where(eq(sessions.id, id));
}

export async function getAiObservation(sessionId: string, stepId: number, content: string) {
  const session = await getSession(sessionId);
  if (!session) throw new Error("Session not found");

  const systemPrompt = FACILITATOR_PROMPT(stepId, session.productName);
  const result = await callGemini(systemPrompt, content);

  const currentCache = (session.aiCache as any) || {};
  const newCache = { ...currentCache, [stepId]: result };
  
  await db.update(sessions).set({ aiCache: newCache }).where(eq(sessions.id, sessionId));
  
  return result;
}

export async function generateFinalDiagnosis(sessionId: string) {
  const session = await getSession(sessionId);
  if (!session) throw new Error("Session not found");

  const sessionSummary = JSON.stringify({
    product: session.productName,
    data: session.data,
    aiCache: session.aiCache
  });

  const response = await callGemini(DIAGNOSIS_PROMPT, sessionSummary);
  
  let diagnosis;
  try {
    diagnosis = JSON.parse(response);
  } catch (e) {
    diagnosis = {
      overview: response,
      patterns: [],
      nextsteps: []
    };
  }

  await db.update(sessions).set({ diagnosis }).where(eq(sessions.id, sessionId));
  revalidatePath(`/session/${sessionId}`);
  return diagnosis;
}

export async function clearTestData() {
  await ensureMockUser();
  await db.delete(sessions).where(eq(sessions.userId, MOCK_USER_ID));
  revalidatePath("/dashboard");
}
