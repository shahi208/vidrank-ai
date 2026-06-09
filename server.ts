import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper for calling Gemini and handling errors gracefully
async function generateAiContent(prompt: string, expectJson: boolean = true) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: expectJson
        ? {
            responseMimeType: "application/json",
            temperature: 0.7,
          }
        : {
            temperature: 0.7,
          },
    });

    if (!response.text) {
      throw new Error("No response text from Gemini API.");
    }
    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    throw new Error(error?.message || "Failed to retrieve or parse response from Gemini.");
  }
}

// ---- API ENDPOINTS ----

// 1. Keyword SEO Research (Volume, Competition, Trends)
app.post("/api/seo/keyword-research", async (req, res) => {
  const { keyword } = req.body;
  if (!keyword || typeof keyword !== "string") {
    return res.status(400).json({ error: "Keyword parameter is required." });
  }

  const prompt = `
    You are an advanced YouTube SEO search planner (like VidIQ and TubeBuddy).
    Perform keyword analysis for "${keyword}".
    Generate a JSON response that contains:
    1. A detailed mock summary of search volume (0 to 100), competition (0 to 100 which is how hard it is to rank), and an overall SEO score (0 to 100, where higher is better - generally high volume + low competition yields higher score).
    2. A list of 6 related, highly sought-after keywords on YouTube related to "${keyword}" with volume, competition, overallScore, and searchTrend ('up' | 'stable' | 'down').
    3. An expert strategy tip string.

    Format the output strictly as a JSON object matching this TypeScript structure:
    {
      "keyword": string,
      "searchVolume": number,
      "competition": number,
      "overallScore": number,
      "strategyTip": string,
      "related": Array<{
        "keyword": string,
        "searchVolume": number,
        "competition": number,
        "overallScore": number,
        "searchTrend": "up" | "stable" | "down"
      }>
    }
  `;

  try {
    const rawResult = await generateAiContent(prompt, true);
    const result = JSON.parse(rawResult);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. High-CTR Video Title Generator
app.post("/api/seo/title-generator", async (req, res) => {
  const { topic, primaryKeyword, audience, tone } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Topic is required." });
  }

  const prompt = `
    You are a YouTube viral growth consultant expert at crafting High Click-Through Rate (CTR) titles.
    Create 5 compelling, highly clickable titles for:
    - Topic: "${topic}"
    - Primary Keyword Focus: "${primaryKeyword || topic}"
    - Audience Target: "${audience || "General Viewers"}"
    - Tone/Style: "${tone || "Clickable/Intriguing"}"

    Your title designs can use psychological hooks (e.g. curiosity, numeric list, fear of missing out, extreme comparison).
    Generate a JSON response conforming strictly to the following TypeScript structure:
    {
      "titles": Array<{
        "titleName": string,
        "ctrScore": number, // Estimated CTR score (0-100) based on emotional triggers and keyword presence
        "hookType": "Curiosity" | "Numeric List" | "Fear" | "Value Promise" | "Comparative" | "Trending Topic",
        "whyItWorks": string, // Explanation of the psychology behind the headline
        "urgencyRating": "High" | "Medium" | "Low"
      }>
    }
  `;

  try {
    const rawResult = await generateAiContent(prompt, true);
    const result = JSON.parse(rawResult);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. YouTube Optimized Tags & Hashtags generator
app.post("/api/seo/tags-hashtags", async (req, res) => {
  const { title, topicKeywords } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Video details/title are required." });
  }

  const prompt = `
    As a YouTube SEO indexing specialist, generate search metadata tags and description hashtags for a video:
    - Title/Topic: "${title}"
    - Key concepts indicated: "${topicKeywords || ""}"

    We need three tiers of search tags strictly categorized for YouTube algorithm mapping:
    1. Primary Tags (exact matching core search intent and variations of keywords)
    2. Secondary Tags (semantic synonyms, descriptive modifiers)
    3. Broad/Category Tags (top-level niches)
    Also generate 5 optimized hashtags with '#' prefix.

    Format the JSON output exactly matching this TypeScript definition:
    {
      "tags": {
        "primary": array of strings,
        "secondary": array of strings,
        "broad": array of strings
      },
      "hashtags": array of strings,
      "optimizationSummary": string // A 2-sentence SEO rationale for these tag selections
    }
  `;

  try {
    const rawResult = await generateAiContent(prompt, true);
    const result = JSON.parse(rawResult);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Premium Description Outlines
app.post("/api/seo/description-generator", async (req, res) => {
  const { title, primaryKeywords, callToAction } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required represent the description baseline." });
  }

  const prompt = `
    Create a highly-optimized premium description box template for a YouTube Video.
    - Title: "${title}"
    - Keyword Focus: "${primaryKeywords || ""}"
    - Main Call-to-action (CTA): "${callToAction || "Subscribe and turn on notifications"}"

    Your generated description must have:
    1. A strong Intro paragraph (the first 2 lines shown before 'Show More' which needs density of target keyword).
    2. A chronological boilerplate chapters guide (with placeholder timestamps).
    3. Resources and Links layout structure.
    4. Essential social/subscribe line sections and video disclaimers.

    Ensure perfect formatting with elegant layout spacing.
    Return a JSON response conforming strictly to this structure:
    {
      "descriptionBody": string, // Complete, combined multiline formatted description box
      "tips": Array<string> // Array of 3 key best practices for descriptions
    }
  `;

  try {
    const rawResult = await generateAiContent(prompt, true);
    const result = JSON.parse(rawResult);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Complete Metadata SEO Audit & Scorecard
app.post("/api/seo/metadata-audit", async (req, res) => {
  const { title, description, tagsString } = req.body;
  if (!title) {
    return res.status(400).json({ error: "A video Title is required to run the SEO checklist audit." });
  }

  const prompt = `
    You are a meticulous YouTube SEO algorithm auditor like VidIQ.
    Perform an in-depth checklist audit of this current proposed metadata setup:
    - Current Title: "${title}"
    - Current Description: "${description || ""}"
    - Current Tags/Keywords: "${tagsString || ""}"

    Conduct audits on:
    1. Title length optimization (Perfect is 50-70 chars; over 70 is truncated; under 40 is weak)
    2. Description length and early keyword concentration
    3. Tag limit (YouTube up to 500 characters) and semantic spacing
    4. Human click density (Does it trigger click curiosity?)
    
    Calculate an overall SEO Auditing score (0 to 100).
    Provide a checklist of items which are either true (done) or false (needs work):
    - titleLengthOk
    - descriptionLengthOk
    - hasCallToAction
    - hasSocialLinks
    - keywordInTitle
    - keywordInDescription
    - tagsOptimized
    - clickTriggerPresense

    Provide precise text recommendations on how to immediately fix issues and increase the score.
    Format your result strictly as JSON conforming to this TypeScript layout:
    {
      "overallScore": number,
      "checklist": {
        "titleLengthOk": boolean,
        "descriptionLengthOk": boolean,
        "hasCallToAction": boolean,
        "hasSocialLinks": boolean,
        "keywordInTitle": boolean,
        "keywordInDescription": boolean,
        "tagsOptimized": boolean,
        "clickTriggerPresense": boolean
      },
      "feedback": Array<{
        "metric": string, // Checked element
        "status": "excellent" | "needs_improvement" | "critical",
        "suggestion": string // Custom text suggestions
      }>
    }
  `;

  try {
    const rawResult = await generateAiContent(prompt, true);
    const result = JSON.parse(rawResult);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Hook & Outline Script Sketcher
app.post("/api/seo/script-outline", async (req, res) => {
  const { topic, outlineType } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Topic is required to sketch an outline script." });
  }

  const prompt = `
    Design a viral video scripting hook and outline map for a YouTube Creator.
    - Topic: "${topic}"
    - Format: "${outlineType || "Vlog / Informative"}"

    Include:
    1. Hook concept (the critical first 5 seconds to prevent dropoff).
    2. Intro segment direction (first 30 seconds).
    3. Timeline segmented body blocks (Problem, Solution, Practical actions, CTA).
    4. Outro segment to optimize End Screen Click-Through Rates.

    Conform the JSON output strictly to this TypeScript structure:
    {
      "outlineTitle": string,
      "hookIdea": string,
      "introEngagementTip": string,
      "sections": Array<{
        "timeframe": string,
        "title": string,
        "visualDirectorNotes": string,
        "scriptObjective": string
      }>,
      "outroEngagement": string
    }
  `;

  try {
    const rawResult = await generateAiContent(prompt, true);
    const result = JSON.parse(rawResult);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend assets in production and Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite's middleware
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[YouTube SEO Optimizer Server] running on http://localhost:${PORT}`);
  });
}

startServer();
