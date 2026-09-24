import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/generate", async (req, res) => {
  try {
    const { idea, genre, characters, panels } = req.body;

    if (!idea?.trim()) {
      return res.status(400).json({ error: "Please enter a story idea." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing. Copy .env.example to .env and add your key."
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const panelCount = Math.min(Math.max(Number(panels) || 6, 2), 12);

    const prompt = `
You are ComicCraft AI, a professional comic story creator.
Create an original ${genre || "adventure"} comic from this idea:

${idea}

Characters:
${characters || "Create suitable characters yourself."}

Return ONLY valid JSON with this exact structure:
{
  "title": "string",
  "logline": "string",
  "style": "string",
  "characters": [
    {"name":"string","role":"string","description":"string"}
  ],
  "panels": [
    {
      "panel": 1,
      "scene": "string",
      "caption": "string",
      "dialogue": [
        {"speaker":"string","text":"string"}
      ],
      "image_prompt": "string"
    }
  ]
}

Create exactly ${panelCount} panels. Keep dialogue concise and make the story have a clear beginning, middle, and ending.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text?.trim();
    if (!text) throw new Error("Gemini returned an empty response.");

    let comic;
    try {
      comic = JSON.parse(text);
    } catch {
      throw new Error("Gemini returned invalid JSON. Please try again.");
    }

    res.json(comic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Generation failed." });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`ComicCraft AI running at http://localhost:${port}`);
});
