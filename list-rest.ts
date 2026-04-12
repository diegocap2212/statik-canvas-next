import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function listModelsRest() {
  const apiKey = process.env.GEMINI_API_KEY!;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  console.log("Listando modelos via REST...");
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Status:", res.status);
    if (data.models) {
      data.models.forEach((m: any) => console.log(m.name));
    } else {
      console.log("Nenhum modelo retornado:", JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.log("Erro REST:", (e as Error).message);
  }
}

listModelsRest();
