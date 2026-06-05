const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

app.options("/analyze", cors());

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
          content: `Eres un analista deportivo experto. Analiza este partido en 2-3 frases en español.

Partido: ${home} vs ${away}
Competición: ${league}
Deporte: ${sport}

Responde SOLO con este JSON:
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
      analysis: `${home} se enfrenta a ${away} en ${league}. Partido con op
