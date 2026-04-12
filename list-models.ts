import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function listAllModels() {
  const apiKey = process.env.GEMINI_API_KEY!;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    const list = await genAI.listModels(); // This might not be in the SDK directly in older versions
    // Actually, listModels is an async iterator in some versions
    console.log("Listando modelos:");
    for await (const model of genAI.listModels()) {
       console.log(model.name);
    }
  } catch (e) {
    console.log("Erro ao listar:", (e as Error).message);
    // If listModels is not supported, try the most basic:
    console.log("Tentando gemini-1.0-pro...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
        const result = await model.generateContent("Oi");
        console.log("gemini-1.0-pro funcionando!");
    } catch (e2) {
        console.log("gemini-1.0-pro falhou:", (e2 as Error).message);
    }
  }
}

listAllModels();
