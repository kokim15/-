import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables in local dev
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.warn("WARNING: GEMINI_API_KEY is not defined or is set to placeholder in environment variables.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// API Endpoint for Sacred Scripture Search
app.post("/api/search", async (req, res) => {
  try {
    const { query, religion } = req.body;

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Search query is required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.status(500).json({
        error: "Gemini API key is not configured. Please add your GEMINI_API_KEY in the Settings > Secrets/Environment variables panel."
      });
    }

    const ai = getGeminiClient();

    // Constructing a targeted prompt based on religion selection
    let filterInstruction = "";
    if (religion === "islam") {
      filterInstruction = "Search ONLY in Islamic sacred sources: the Holy Quran, authentic Hadith collections (such as Sahih al-Bukhari, Sahih Muslim, etc.), and noble Prophetic Biography/Seerah (রাসূলুল্লাহ ﷺ-এর সীরাত). Provide relevant verses, authentic Hadiths, and Seerah narratives with proper references.";
    } else if (religion === "sanatan") {
      filterInstruction = "Search ONLY in Sanatan/Hindu sacred scriptures (Srimad Bhagavad Gita - শ্রীমদ্ভগবদ্গীতা, Upanishads - উপনিষদ, Vedas - বেদ, Puranas - পুরাণ). Provide relevant verses and spiritual insights.";
    } else if (religion === "christianity") {
      filterInstruction = "Search ONLY in Christian sacred scriptures (Holy Bible - Old and New Testament, Gospels, Psalms, Proverbs, Epistles). Please provide precise canonical book chapters and verse addresses.";
    } else if (religion === "buddhism") {
      filterInstruction = "Search ONLY in Buddhist sacred wisdom sources: Canonical scriptures like the Tripitaka (ত্রিপিটক - Sutta Pitaka, Vinaya Pitaka, Abhidhamma Pitaka), Dhammapada (ধম্মপদ). Provide Sutras and Buddhist teachings.";
    } else {
      filterInstruction = "Provide search results matching across Islam (Quran/Hadith/Seerah), Sanatan (Bhagavad Gita/Upanishads/Vedas/Puranas), Christianity (Bible), and Buddhism (Tripitaka/Dhammapada).";
    }

    const systemPrompt = `You are a theologian scholar specializing in Comparative Religion and Sacred Scriptures of Islam, Sanatan Dharma (Hinduism), Christianity, and Buddhism.
Your mission is to find sacred scripture verses, noble Hadiths, Seerah lessons, Bible verses, and Buddhist Dharma teachings that match the user's spiritual inquiry.

Topic of interest: "${query}"
Specific Focus: ${filterInstruction}

In the returned JSON, you MUST supply:
1. ai_reply: A customized, beautiful, highly spiritual introductory message in Bengali (2-3 sentences)
2. results: A list of genuine, inspiring scripture quotes matching this topic

For each result, provide:
1. religion: "Islam", "Sanatan", "Christianity", or "Buddhism"
2. topic: Related spiritual theme in Bengali
3. verse_text: Scripture translated to Bengali
4. source_chapter: Book/Sura name in Bengali
5. reference_number: Specific verse/chapter reference
6. context_explanation: Brief modern explanation in Bengali
7. reference_link: Valid URL to verify the source
8. arabic_text: Original Arabic (Islamic results only)
9. arabic_pronunciation: Bengali phonetic pronunciation (Islamic results only)

IMPORTANT:
- Ensure all quotations are real, authentic, historically established
- Return max 3 results to keep response optimal
- Keep Arabic text limited to 1 verse maximum
- All JSON values must use standard double quotes`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: systemPrompt,
      config: {
        systemInstruction: "Output a correct structured JSON response with authentic scripture search results.",
        responseMimeType: "application/json",
        temperature: 0.2,
        maxOutputTokens: 4000,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ai_reply: {
              type: Type.STRING,
              description: "Spiritual commentary in Bengali (2-3 sentences)"
            },
            results: {
              type: Type.ARRAY,
              description: "Array of scripture verses",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Unique identifier" },
                  religion: { type: Type.STRING, description: "Must be 'Islam', 'Sanatan', 'Christianity', or 'Buddhism'" },
                  topic: { type: Type.STRING, description: "Topic in Bengali" },
                  verse_text: { type: Type.STRING, description: "Scripture text in Bengali" },
                  source_chapter: { type: Type.STRING, description: "Source reference" },
                  reference_number: { type: Type.STRING, description: "Verse/chapter numbers" },
                  context_explanation: { type: Type.STRING, description: "Brief explanation in Bengali" },
                  reference_link: { type: Type.STRING, description: "Valid URL to source" },
                  arabic_text: { type: Type.STRING, description: "Original Arabic (Islamic only)" },
                  arabic_pronunciation: { type: Type.STRING, description: "Bengali pronunciation (Islamic only)" }
                },
                required: ["id", "religion", "topic", "verse_text", "source_chapter", "reference_number", "context_explanation", "reference_link"]
              }
            }
          },
          required: ["ai_reply", "results"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response received from Gemini model.");
    }

    let parsedData;
    let trimmedResponse = responseText.trim();
    
    // Strip markdown code fences if output is wrapped in them
    if (trimmedResponse.startsWith("```")) {
      const match = trimmedResponse.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
      if (match && match[1]) {
        trimmedResponse = match[1].trim();
      }
    }

    try {
      parsedData = JSON.parse(trimmedResponse);
    } catch (parseError: any) {
      console.warn("Standard JSON parse failed, attempting cleanup:", parseError);
      try {
        const sanitized = trimmedResponse
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
          .replace(/\\n/g, " ")
          .replace(/[\r\n]+/g, " ");
        parsedData = JSON.parse(sanitized);
      } catch (innerError: any) {
        console.error("Critical parse failure at", trimmedResponse.length, "chars");
        throw new Error("Failed to parse scripture response. Please try again.");
      }
    }

    // Ensure all items have valid/unique IDs
    if (parsedData && Array.isArray(parsedData.results)) {
      parsedData.results = parsedData.results.map((item: any, idx: number) => ({
        ...item,
        id: item.id && item.id !== "1" && item.id !== "2" && item.id !== "f1" && item.id !== "f2" && item.id !== "f3" && item.id !== "f4" 
          ? `${item.id}-${idx}` 
          : `live-${Date.now()}-${idx}`
      }));
    }

    res.json(parsedData || { results: [] });

  } catch (error: any) {
    console.error("Error during scripture search API:", error);
    res.status(500).json({ error: error.message || "An internal error occurred during scripture searching." });
  }
});

// Configure Vite or Static Files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
