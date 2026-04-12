import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { StatikCanvas } from "@/components/canvas/StatikCanvas";

export default async function SessionPage({ params }: { params: { id: string } }) {
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, params.id),
  });

  if (!session) {
    notFound();
  }

  return <StatikCanvas session={session} />;
}
