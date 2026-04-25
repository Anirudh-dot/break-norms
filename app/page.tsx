"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [speedLevel, setSpeedLevel] = useState(0);
  const [batSwinging, setBatSwinging] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const qualityLevel = Math.max(10 - speedLevel, 0);

  const mood =
    speedLevel >= 9
      ? "Burned Out"
      : speedLevel >= 7
        ? "Overworked"
        : speedLevel >= 4
          ? "Annoyed"
          : speedLevel >= 1
            ? "Slightly Pressured"
            : "Calm";

  const moodColor =
    speedLevel >= 9
      ? "text-red-700"
      : speedLevel >= 7
        ? "text-orange-600"
        : speedLevel >= 4
          ? "text-yellow-600"
          : "text-green-600";

  const pageEffect =
    speedLevel >= 9
      ? "bg-red-100"
      : speedLevel >= 7
        ? "bg-orange-100"
        : "bg-gray-100";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [messages]);

  const hitWithBat = () => {
    setSpeedLevel((prev) => Math.min(prev + 1, 10));
    setBatSwinging(true);

    setTimeout(() => {
      setBatSwinging(false);
    }, 250);
  };

  const resetAssistant = () => {
    setSpeedLevel(0);

    const resetMessage: Message = {
      id: Date.now() + Math.random(),
      text: "Reset complete. I can think clearly again.",
      sender: "bot",
    };

    setMessages((prev) => [...prev, resetMessage]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now() + Math.random(),
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentInput = input;

    setInput("");
    setLoading(true);

    const botMessageId = Date.now() + Math.random();

    const botMessage: Message = {
      id: botMessageId,
      text: "Thinking...",
      sender: "bot",
    };

    setMessages((prev) => [...prev, botMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: currentInput,
          speedLevel,
          qualityLevel,
          mood,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
  console.error("API error response:", data);

  throw new Error(
    data.details || data.error || `HTTP error! status: ${response.status}`
  );
}

      const finalBotMessage: Message = {
        id: botMessageId,
        text: data.reply || "",
        sender: "bot",
      };

      setMessages((prev) =>
        prev.map((msg) => (msg.id === botMessageId ? finalBotMessage : msg))
      );
    } catch (error) {
      console.error("Error sending message:", error);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                text: "Sorry, I couldn't get a response. Check your API key and model settings.",
              }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className={`flex flex-col h-screen transition-colors duration-300 ${pageEffect} ${
        speedLevel >= 9 ? "animate-pulse" : ""
      }`}
    >
      <header className="bg-white shadow p-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl font-bold text-gray-900">
              Chat with Norm
            </h1>

            <div className="flex items-center gap-3">
              <div
                className={`text-3xl transition-transform duration-200 ${
                  batSwinging ? "rotate-45 scale-125" : "-rotate-12"
                }`}
              >
                🏏
              </div>

              <button
                onClick={hitWithBat}
                className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Bonk
              </button>

              <button
                onClick={resetAssistant}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="flex justify-between text-sm text-gray-700 mb-1">
                <span>Speed</span>
                <span>{speedLevel}/10</span>
              </div>

              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all duration-300"
                  style={{ width: `${speedLevel * 10}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-gray-700 mb-1">
                <span>Answer Quality</span>
                <span>{qualityLevel}/10</span>
              </div>

              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${qualityLevel * 10}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-start md:justify-end">
              <p className="text-sm text-gray-700">
                Mood:{" "}
                <span className={`font-bold ${moodColor}`}>{mood}</span>
              </p>
            </div>
          </div>

          {speedLevel >= 7 && (
            <div className="rounded-lg bg-orange-100 border border-orange-300 text-orange-800 px-3 py-2 text-sm">
              Warning: the assistant is overworked. Answers are becoming faster
              but less detailed.
            </div>
          )}

          {speedLevel >= 9 && (
            <div className="rounded-lg bg-red-100 border border-red-300 text-red-800 px-3 py-2 text-sm font-medium">
              Burnout mode active. Reset the assistant to restore answer
              quality.
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div
          className={`max-w-4xl mx-auto space-y-4 ${
            speedLevel >= 8 ? "scale-[0.99]" : ""
          } transition-transform`}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === "user"
                    ? "bg-blue-500 text-white"
                    : speedLevel >= 9
                      ? "bg-red-50 text-gray-900 border border-red-300"
                      : speedLevel >= 7
                        ? "bg-orange-50 text-gray-900 border border-orange-300"
                        : "bg-white text-gray-900 border border-gray-200"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white p-4 border-t">
        <div className="max-w-4xl mx-auto flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              speedLevel >= 9
                ? "Assistant is burned out..."
                : "Type your message..."
            }
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            disabled={loading}
          />

          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-500 text-white px-6 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}