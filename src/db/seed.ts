import { db } from "./index";
import { sessions, users } from "./schema";
import { eq } from "drizzle-orm";

const MOCK_USER_ID = "diego-caporusso-mock";

export async function seedSampleSession() {
  // Ensure user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, MOCK_USER_ID),
  });

  if (!existingUser) {
    await db.insert(users).values({
      id: MOCK_USER_ID,
      name: "Diego Caporusso",
      email: "diego@example.com",
    });
  }

  // Create Sample Session
  const [session] = await db.insert(sessions).values({
    userId: MOCK_USER_ID,
    productName: "Sessão de Exemplo — App de Logística",
    facilitator: "Diego Caporusso",
    context: "Time de desenvolvimento buscando reduzir o lead time e melhorar a vazão.",
    data: {
      tagsInternal: ["Dependência de Terceiros", "Burocracia excessiva", "Falta de QA"],
      tagsExternal: ["Atraso nas entregas", "Bugs em produção"],
      demands: [
        ["Features", "Produto", "Dev Team", "Alta", "2 semanas"],
        ["Fixes", "Suporte", "Dev Team", "Média", "24h"]
      ],
      cadences: [
        ["Daily", "Diária", "Sincronização", "Sim"],
        ["Retro", "Quinzenal", "Melhoria", "Não"]
      ],
      workflow: ["Backlog", "Design", "Dev", "Review", "Prod"],
      steps: {
        s1Purpose: "Otimizar a última milha da entrega de e-commerce.",
        s1Success: "Lead time médio abaixo de 5 dias.",
        s2Priority: "A burocracia excessiva no review está travando tudo.",
        s4Leadtime: "Hoje estamos em 14 dias.",
        s4Throughput: "10 itens por sprint.",
        s5Priority: "Quem grita mais alto ou o CEO pede.",
        s6Diff: "Bugs rápidos pulam o design."
      }
    },
    aiCache: {
      1: "O propósito parece bem definido, mas o sucesso em 5 dias é agressivo para a estrutura atual.",
      2: "As insatisfações externas ligadas a bugs sugerem que as etapas de QA precisam de mais atenção no seu workflow."
    },
    diagnosis: {
      overview: "O fluxo de logística apresenta um potencial de ganho rápido ao otimizar a etapa de Review, que é o gargalo identificado pelo time.",
      patterns: [
        "Inconsistência entre priorização informal e metas de lead time.",
        "Feedback loop de qualidade (QA) subutilizado.",
        "Alta variabilidade nas demandas de suporte."
      ],
      nextsteps: [
        "Formalizar WIP Limits para as etapas de Dev e Review.",
        "Implementar uma cadência de Replenishment semanal.",
        "Automatizar testes básicos para reduzir bugs em produção."
      ]
    },
    isDone: true
  }).returning();

  return session;
}
