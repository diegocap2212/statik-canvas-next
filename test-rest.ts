import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testRest() {
  const apiKey = process.env.GEMINI_API_KEY!;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
  
  console.log("Testando via REST...");
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Oi" }] }]
      })
    });
    
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Resposta:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.log("Erro REST:", (e as Error).message);
  }
}

testRest();
