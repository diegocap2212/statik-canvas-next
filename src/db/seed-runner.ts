import { seedSampleSession } from "./seed";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  console.log("🌱 Iniciando carga de dados de exemplo...");
  try {
    const session = await seedSampleSession();
    console.log("✅ Sucesso! Sessão de exemplo criada com ID:", session.id);
  } catch (error) {
    console.error("❌ Erro ao rodar o seed:", error);
    process.exit(1);
  }
}

main();
