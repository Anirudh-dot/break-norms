import { NextRequest, NextResponse } from "next/server";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GEMMA_MODEL = process.env.GEMMA_MODEL || "gemma-4-31b-it";

function cleanReply(text: string) {
  let reply = text.trim();

  // Try to extract JSON reply first
  try {
    const parsed = JSON.parse(reply);
    if (parsed.reply && typeof parsed.reply === "string") {
      return parsed.reply.trim();
    }
  } catch {
    // Continue to fallback cleanup
  }

  // If model includes a final quoted answer at the end, grab it
  const quotedMatches = [...reply.matchAll(/"([^"]+)"/g)];
  if (quotedMatches.length > 0) {
    reply = quotedMatches[quotedMatches.length - 1][1];
  }

  // Remove common unwanted reasoning labels
  reply = reply
    .replace(/User input:.*?\n?/gi, "")
    .replace(/User says:.*?\n?/gi, "")
    .replace(/Constraint.*?\n?/gi, "")
    .replace(/Persona:.*?\n?/gi, "")
    .replace(/Rules:.*?\n?/gi, "")
    .replace(/Reasoning:.*?\n?/gi, "")
    .replace(/Analysis:.*?\n?/gi, "")
    .replace(/Draft.*?\n?/gi, "")
    .replace(/Check\..*?\n?/gi, "")
    .replace(/No bullet points.*?\n?/gi, "")
    .replace(/No markdown.*?\n?/gi, "")
    .replace(/No explanations.*?\n?/gi, "")
    .replace(/Short\?.*?\n?/gi, "")
    .replace(/Only final reply\?.*?\n?/gi, "")
    .replace(/Chatbot reply:/gi, "")
    .replace(/Assistant:/gi, "")
    .replace(/^[\s*"'`•\-:]+/, "")
    .replace(/[\s"'`]+$/, "")
    .trim();

  return reply || "Sorry, I could not generate a response.";
}

export async function POST(request: NextRequest) {
  if (!GOOGLE_API_KEY) {
    return NextResponse.json(
      { error: "Missing GOOGLE_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  try {
    const {
      message,
      speedLevel = 0,
    }: {
      message?: string;
      speedLevel?: number;
    } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const fastMode = speedLevel >= 3;
    const ultraFastMode = speedLevel >= 6;

    const prompt = `
You are a chatbot.

Return valid JSON only.
Do not include markdown.
Do not include reasoning.
Do not include analysis.
Do not include constraints.
Do not include explanations outside the JSON.

The JSON must use this exact format:
{"reply":"your response here"}

User message:
${message}
`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMMA_MODEL}:generateContent?key=${GOOGLE_API_KEY}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: ultraFastMode ? 0.1 : fastMode ? 0.3 : 0.5,
          maxOutputTokens: ultraFastMode ? 60 : fastMode ? 150 : 350,
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();

      return NextResponse.json(
        {
          error: `Google API error: ${response.statusText}`,
          details: body,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const rawReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const reply = cleanReply(rawReply);

    return NextResponse.json({
      reply,
      speedLevel,
      mode: ultraFastMode ? "ultra-fast" : fastMode ? "fast" : "normal",
    });
  } catch (error) {
    console.error("[Chat API] Error:", error);

    return NextResponse.json(
      {
        error: "Failed to get response from Google Gemma model",
        details: String(error),
      },
      { status: 500 }
    );
  }
}