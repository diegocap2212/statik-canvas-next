import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

/**
 * DATABASE INITIALIZATION
 * Standard Drizzle initialization for Neon Serverless.
 * The fallback URL prevents the 'neon' client from throwing during the build phase
 * when process.env.POSTGRES_URL might be undefined.
 */

const connectionString = process.env.POSTGRES_URL || "postgresql://localhost:5432/mock_db";
const client = neon(connectionString);

export const db = drizzle(client, { schema });
