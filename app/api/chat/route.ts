import { NextRequest, NextResponse } from "next/server";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export async function POST(request: NextRequest) {
  if (!GOOGLE_API_KEY) {
    return NextResponse.json(
      {
        error: "Missing GOOGLE_API_KEY in .env.local",
      },
      { status: 500 },
    );
  }

  try {
    const { message } = await request.json();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`;

    console.log(`[Chat API] Sending message: ${message}`);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: message,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 150,
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[Chat API] Google API error ${response.status}:`, body);
      return NextResponse.json(
        {
          error: `Google API error: ${response.statusText}`,
          details: body,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[Chat API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to get response from Google Gemini model",
        details: String(error),
      },
      { status: 500 },
    );
  }
}
