const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/analyze", async (req, res) => {
  const { home, away, league, sport } = req.body;
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 250,
        messages: [{
          role: "user",
          content: `Eres un analista deportivo experto. Analiza este partido en 2-3 frases en español considerando estadísticas recientes, forma del equipo y contexto de la competición.

Partido: ${home} vs ${away}
Competición: ${league}
Deporte: ${sport}

Responde SOLO con este JSON sin nada más:
{"analysis": "análisis aquí", "pick": "1", "confidence": 75}`
        }]
      })
    });
    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err) {
    res.json({
      analysis: `${home} se enfrenta a ${away} en ${league}. Partido interesante con opciones para ambos equipos.`,
      pick: "1",
      confidence: 65
    });
  }
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor BetMind corriendo en puerto ${PORT}`));
