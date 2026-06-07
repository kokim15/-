import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables in local dev
dotenv.config();

const app = express();
const PORT = 3000;

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
      filterInstruction = "Search ONLY in Islamic sacred sources: the Holy Quran, authentic Hadith collections (such as Sahih al-Bukhari, Sahih Muslim, etc.), and noble Prophetic Biography/Seerah (সীরাত ও রাসূল ﷺ-এর জীবনচরিত) text records (such as Ar-Raheeq Al-Makhtum - আর-রাহীকুল মাখতূম, Shamail Tirmidhi, or Sirat Ibn Hisham). Please return an active blend of Quranic verses, authentic Hadiths, and noble Seerah biographical lessons of Prophet Muhammad ﷺ.";
    } else if (religion === "sanatan") {
      filterInstruction = "Search ONLY in Sanatan/Hindu sacred scriptures (Srimad Bhagavad Gita - শ্রীমদ্ভগবদ্গীতা, Upanishads - উপনিষদ, Vedas - বেদ, Puranas - পুরাণ, Ramayana - রামায়ণ, Mahabharata - মহাভারত, and other authentic texts). Please provide precise chapter and shloka references.";
    } else if (religion === "christianity") {
      filterInstruction = "Search ONLY in Christian sacred scriptures (Holy Bible - Old and New Testament, Gospels, Psalms, Proverbs). Please provide precise canonical book chapters and verse addresses.";
    } else if (religion === "buddhism") {
      filterInstruction = "Search ONLY in Buddhist sacred wisdom sources: Canonical scriptures like the Tripitaka (পবিত্র ত্রিপিটক - Sutta Pitaka, Vinaya Pitaka, Abhidhamma Pitaka), noble verses of Dhammapada (ধম্মপদ), Jataka tales (জাতক কাহিনী), and Mahayana Sutras (মহাযান সূত্রসমূহ).";
    } else {
      filterInstruction = "Provide the search matching across Islam (Quran/Hadith/Seerah), Sanatan (Bhagavad Gita/Upanishads/Vedas/Puranas), Christianity (Bible), and Buddhism (Tripitaka/Dhammapada) concurrently.";
    }

    const systemPrompt = `You are a theologian scholar specializing in Comparative Religion and Sacred Scriptures of Islam, Sanatan Dharma (Hinduism), Christianity, and Buddhism.
Your mission is to find sacred scripture verses, noble Hadiths, Seerah lessons/events (রাসূলুল্লাহ ﷺ-এর সীরাত/জীবনী), Bible verses, and Buddhist Dhammapada/Tripitaka wisdom texts that directly correspond to the topic queried by the user.

Topic of interest: "${query}"
Specific Focus: ${filterInstruction}

In the returned JSON, you MUST supply:
1. ai_reply: A customized, beautiful, highly spiritual, and empathetic introductory message in Bengali of 2-3 sentences. It should serve as an overarching spiritual reply/commentary to the user's specific query, addressing them directly with comfort, wisdom, warmth, and compassion, and introducing the sacred scripture references presented below.
2. results: A list of genuine, inspiring scripture quotes matching this topic.

For each result inside the 'results' list, you MUST supply:
1. religion (either "Islam", "Sanatan", "Christianity", or "Buddhism" in English)
2. topic (the queried topic or closely related spiritual theme in Bengali, e.g., 'ধৈর্য', 'দান', 'ক্রোধ', 'সীরাত', 'সহিংসতা পরিহার')
3. verse_text (The divine scripture/Hadith/Seerah/Bible/Buddhist text beautifully and accurately translated or represented in Bengali. Ensure standard, reverent canonical phrasing is used.)
4. source_chapter (Detailed canonical title/book name, e.g., "সূরা আল-হুজুরাত (Quran)", "সহীহ বুখারী (Hadith)", "আর-রাহীকুল মাখতূম (Seerah)", "শ্রীমদ্ভগবদ্গীতা অধ্যায় ২ (Gita)", "মথি ৫ (Bible)", "ধম্মপদ - যমকবগ্গ (Buddhism)")
5. reference_number (Specific verse, Hadith index, Seerah chapter/page name, or Sutra/verse index, e.g., "৪৯:১২", "হাদিস নং ২৫", "চরিত্র ও ব্যক্তিত্ব অধ্যায়", "শ্লোক ৪৭", "৫:৩-১০", "গাথা ৫")
6. context_explanation (A brief, modern, comforting explanation/implication in Bengali of 1-2 sentences explaining why this verse/lesson/shloka matters for contemporary life)
7. reference_link (A real, valid, and live URL where users can verify or read the scripture/hadith/seerah/bible/buddhist source. E.g., for Al-Baqarah 2:263 use direct Quran.com links like https://quran.com/2/263. For Hadiths / Islamic references, you MUST prioritize and use real reference links from the prominent Bengali Hadith library website https://www.hadithbd.com/ (such as https://www.hadithbd.com/hadith/ or specific details like https://www.hadithbd.com/hadith/detail/?book=12&hadith=25) or fallback to sunnah.com if specific links are unavailable. For Gitabooks use https://www.holy-bhagavad-gita.org/chapter/2/verse/47, for Bible use biblegateway.com, for Buddhism use suttacentral.net or similar. Always return a valid absolute URL.)
8. arabic_text (FOR ISLAM OR QURAN/HADITH RESULTS ONLY: Provide the beautiful original Arabic scripture script, e.g., 'إِنَّ مَعَ الْعُসْرِ يُسْرًا'. For non-islamic scriptures, omit or keep empty.)
9. arabic_pronunciation (FOR ISLAM OR QURAN/HADITH RESULTS ONLY: Provide the precise Bengali phonetic pronunciation/transliteration of the original Arabic script, e.g., 'ইন্না মা'আল উসরি ইউসরা'. For non-islamic scriptures, omit or keep empty.)

IMPORTANT:
- Ensure the scripture/Hadith/Seerah/Bible/Buddhist quotations must be real, authentic, historically established quotes, and not hallucinated.
- Translate both the verse text and spiritual explanation into elegant and pristine Bengali language so the user can easily comprehend.
- Return max 3 highly precise and beautiful elements inside the 'results' array (never exceed 3 results) to keep the response size optimal and prevent truncation.
- Keep the Arabic script limited to 1 verse maximum, and do not repeat quotes or loop text infinitely.
- In the JSON response, all keys and outer values must be enclosed in standard double quotes ("). Any quotes or dialogue nested inside values (like in the Bengali translations or explanations) must be written using single quotes ('') to ensure structural JSON integrity.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        systemInstruction: "You strictly output a correct structured JSON response containing a comforting, personal AI synthesis reply and matching scripture search results, always ensuring high fidelity to authenticated religious texts.",
        responseMimeType: "application/json",
        temperature: 0.2,
        maxOutputTokens: 4000,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ai_reply: {
              type: Type.STRING,
              description: "A beautifully synthesized introductory spiritual commentary in Bengali (2-3 sentences) comforting the user, giving comparative reflections on their query, and introducing the scriptures."
            },
            results: {
              type: Type.ARRAY,
              description: "Array of scripture verses found on the requested topic.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Unique secure random string. Never return duplicate ids like '1' or '2'." },
                  religion: { type: Type.STRING, description: "Must be 'Islam', 'Sanatan', 'Christianity', or 'Buddhism'" },
                  topic: { type: Type.STRING, description: "Topic in Bengali, max 3 words, e.g. অহংকার, ক্ষমা, অহিংসা, ভালোবাসা" },
                  verse_text: { type: Type.STRING, description: "Actual text from the holy scripture translated perfectly to Bengali. Keep under 200 chars. Use single quotes for inner quotes." },
                  source_chapter: { type: Type.STRING, description: "Exact Holy Sura, Hadith collection, Gita chapter, or Bible book in Bengali." },
                  reference_number: { type: Type.STRING, description: "Verse/Hadith indexes or numbers, e.g., ২৪:৩৫, হাদিস ৫." },
                  context_explanation: { type: Type.STRING, description: "A comforting brief explanation in Bengali, max 2 short sentences." },
                  reference_link: { type: Type.STRING, description: "Absolute, valid URL to read or verify from." },
                  arabic_text: { type: Type.STRING, description: "Original Arabic script (Islamic Quran/Hadith ONLY). Must be kept ultra-short (1 verse). Do not loop." },
                  arabic_pronunciation: { type: Type.STRING, description: "Bengali phonetic pronunciation of the Arabic script. Ultra-short." }
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
      console.warn("Standard JSON parse failed, trying to clean controls/escapes:", parseError);
      try {
        // Clean trailing spaces, control characters, and replace inner escaped quotes comfortably
        const sanitized = trimmedResponse
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // remove control codes
          .replace(/\\n/g, " ") // clean newline representations inside JSON
          .replace(/[\r\n]+/g, " "); // flatten any physical carriage returns/newlines
        parsedData = JSON.parse(sanitized);
      } catch (innerError: any) {
        console.error("Critical parse failure. Raw Gemini text length:", trimmedResponse.length, "Text start:", trimmedResponse.slice(0, 300));
        throw new Error("পবিত্র গ্রন্থাবলির তথ্যের আকার বড় হওয়ায় সংযোগে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে আরও সুনির্দিষ্ট শব্দ দিয়ে আবার অনুসন্ধান করুন।");
      }
    }

    // Ensure all items have a valid/unique ID
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
