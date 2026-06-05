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
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 250,
        messages: [{
          role: "user",
          content: "Eres un analista deportivo. Analiza en 2-3 frases en español el partido: " + home + " vs " + away + " en " + league + " (" + sport + "). Responde SOLO con este JSON sin markdown ni texto extra: {\"analysis\": \"texto aqui\", \"pick\": \"1\", \"confidence\": 75}"
        }]
      })
    });
    const data = await response.json();
    console.log("Respuesta Anthropic:", JSON.stringify(data));
    const text = data.content[0].text;
    console.log("Texto recibido:", text);
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    console.log("Parsed OK:", JSON.stringify(parsed));
    res.json(parsed);
  } catch (err) {
    console.log("ERROR:", err.message);
    res.json({
      analysis: home + " vs " + away + " - Error: " + err.message,
      pick: "1",
      confidence: 65
    });
  }
});

app.get("/health", function(req, res) {
  res.json({ status: "ok" });
});

var PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log("Servidor corriendo en puerto " + PORT);
});
