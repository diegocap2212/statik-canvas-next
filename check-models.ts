import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY!;
  const genAI = new GoogleGenerativeAI(apiKey);
  const models = await genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // placeholder
  
  // Note: ListModels is usually on the genAI instance or a different client, 
  // but let's try a different approach: check the common ones.
  const tests = ["gemini-1.5-pro", "gemini-1.5-pro-latest", "gemini-1.5-flash-latest"];
  
  for (const m of tests) {
    console.log(`Testando ${m}...`);
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Oi");
      console.log(`✅ ${m} funciona!`);
    } catch (e) {
      console.log(`❌ ${m} falhou:`, (e as Error).message);
    }
  }
}

listModels();
