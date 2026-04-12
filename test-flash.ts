import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testFlash() {
  const apiKey = process.env.GEMINI_API_KEY!;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  console.log("Testando Flash via REST...");
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

testFlash();
