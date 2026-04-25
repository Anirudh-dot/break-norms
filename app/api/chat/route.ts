import { NextRequest, NextResponse } from "next/server";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GEMMA_MODEL = process.env.GEMMA_MODEL || "gemma-4-31b-it";



function cleanReply(text: string) {
  let reply = text.trim();

  try {
    const parsed = JSON.parse(reply);
    if (parsed.reply && typeof parsed.reply === "string") {
      return parsed.reply.trim();
    }
  } catch {
    // Continue to fallback cleanup
  }

  const quotedMatches = [...reply.matchAll(/"([^"]+)"/g)];
  if (quotedMatches.length > 0) {
    reply = quotedMatches[quotedMatches.length - 1][1];
  }

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
      { status: 500 },
    );
  }

  try {
    const {
      message,
      speedLevel = 0,
      qualityLevel = 10,
      mood = "Calm",
    }: {
      message?: string;
      speedLevel?: number;
      qualityLevel?: number;
      mood?: string;
    } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const fastMode = speedLevel >= 3;
    const ultraFastMode = speedLevel >= 6;
    const burnoutMode = speedLevel >= 9;

    const behaviorInstruction = burnoutMode
      ? "You are burned out. Reply very briefly and bluntly, but still answer the user."
      : ultraFastMode
        ? "You are in ultra-fast mode. Reply in 1-2 short sentences."
        : fastMode
          ? "You are in fast mode. Reply briefly but still be useful."
          : "You are in normal mode. Give a clear and helpful answer.";

    const prompt = `
    
You are Norm, a helpful chatbot.

Return valid JSON only.
Do not include markdown.
Do not include reasoning.
Do not include analysis.
Do not include constraints.
Do not include explanations outside the JSON.

The JSON must use this exact format:
{"reply":"your response here"}

Assistant state:
Speed level: ${speedLevel}/10
Quality level: ${qualityLevel}/10
Mood: ${mood}

Behavior:
${behaviorInstruction}

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
          temperature: burnoutMode
            ? 0.2
            : ultraFastMode
              ? 0.2
              : fastMode
                ? 0.4
                : 0.6,
          maxOutputTokens: burnoutMode
            ? 60
            : ultraFastMode
              ? 100
              : fastMode
                ? 180
                : 350,
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
        { status: response.status },
      );
    }

    const data = await response.json();

    const rawReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const reply = cleanReply(rawReply);

    return NextResponse.json({
      reply,
      speedLevel,
      qualityLevel,
      mood,
      mode: burnoutMode
        ? "burnout"
        : ultraFastMode
          ? "ultra-fast"
          : fastMode
            ? "fast"
            : "normal",
    });
  } catch (error) {
    console.error("[Chat API] Error:", error);

    return NextResponse.json(
      {
        error: "Failed to get response from Google Gemma model",
        details: String(error),
      },
      { status: 500 },
    );
  }
}
