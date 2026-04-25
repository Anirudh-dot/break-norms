import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    const response = await fetch("http://localhost:1234/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-4-31b",
        messages: [{ role: "user", content: message }],
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(
        "LM Studio API error",
        response.status,
        response.statusText,
        body,
      );
      return NextResponse.json(
        { error: "LM Studio API error: " + response.statusText },
        { status: response.status },
      );
    }

    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.delta?.content ||
      data?.choices?.[0]?.text ||
      "";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to get response from LM Studio" },
      { status: 500 },
    );
  }
}
