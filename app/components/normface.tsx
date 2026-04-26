"use client";

import { useEffect, useState } from "react";

type Mood =
  | "Calm"
  | "Slightly Pressured"
  | "Annoyed"
  | "Overworked"
  | "Burned Out";

interface NormFaceProps {
  mood: Mood;
  loading?: boolean;
}

export default function NormFace({
  mood,
  loading = false,
}: NormFaceProps) {
  const [eyesClosed, setEyesClosed] = useState(false);
  const [mouthFrame, setMouthFrame] = useState(0);

  const isCalm = mood === "Calm";
  const isPressured = mood === "Slightly Pressured";
  const isAnnoyed = mood === "Annoyed";
  const isOverworked = mood === "Overworked";
  const isBurnedOut = mood === "Burned Out";

  // Eye blinking
  useEffect(() => {
    if (isBurnedOut) return;

    const blinkInterval = setInterval(() => {
      setEyesClosed(true);

      setTimeout(() => {
        setEyesClosed(false);
      }, 140);
    }, 3200);

    return () => clearInterval(blinkInterval);
  }, [isBurnedOut]);

  // Mouth animation while loading
  useEffect(() => {
    if (!loading) {
      setMouthFrame(0);
      return;
    }

    const talkingInterval = setInterval(() => {
      setMouthFrame((prev) => (prev + 1) % 3);
    }, 180);

    return () => clearInterval(talkingInterval);
  }, [loading]);

  const faceTone = isBurnedOut
    ? "from-red-200 to-red-300 border-red-400"
    : isOverworked
      ? "from-orange-200 to-orange-300 border-orange-400"
      : isAnnoyed
        ? "from-yellow-200 to-yellow-300 border-yellow-400"
        : isPressured
          ? "from-sky-200 to-blue-300 border-blue-400"
          : "from-cyan-200 to-blue-200 border-blue-300";

  const ringTone = isBurnedOut
    ? "ring-red-300"
    : isOverworked
      ? "ring-orange-300"
      : isAnnoyed
        ? "ring-yellow-300"
        : "ring-blue-200";

  const mouthMood = isCalm
    ? "smile"
    : isPressured
      ? "small-smile"
      : isAnnoyed
        ? "flat"
        : isOverworked
          ? "frown"
          : "deep-frown";

  const renderEye = () => {
    if (eyesClosed) {
      return <div className="h-1 w-5 rounded-full bg-slate-700" />;
    }

    return (
      <div className="relative h-5 w-5 rounded-full bg-slate-800 shadow-inner">
        <div className="absolute left-1 top-1 h-1.5 w-1.5 rounded-full bg-white" />
      </div>
    );
  };

  const renderLoadingMouth = () => {
    if (mouthFrame === 0) {
      return (
        <div className="absolute bottom-8 left-1/2 h-3 w-8 -translate-x-1/2 rounded-full bg-slate-800" />
      );
    }

    if (mouthFrame === 1) {
      return (
        <div className="absolute bottom-7 left-1/2 h-5 w-6 -translate-x-1/2 rounded-full bg-slate-800" />
      );
    }

    return (
      <div className="absolute bottom-8 left-1/2 h-4 w-10 -translate-x-1/2 rounded-full bg-slate-800" />
    );
  };

  const renderNormalMouth = () => {
    if (mouthMood === "smile") {
      return (
        <div className="absolute bottom-7 left-1/2 h-5 w-12 -translate-x-1/2 rounded-b-full border-b-4 border-slate-800" />
      );
    }

    if (mouthMood === "small-smile") {
      return (
        <div className="absolute bottom-8 left-1/2 h-4 w-10 -translate-x-1/2 rounded-b-full border-b-4 border-slate-800" />
      );
    }

    if (mouthMood === "flat") {
      return (
        <div className="absolute bottom-9 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-slate-800" />
      );
    }

    if (mouthMood === "frown") {
      return (
        <div className="absolute bottom-7 left-1/2 h-4 w-10 -translate-x-1/2 rounded-t-full border-t-4 border-slate-800" />
      );
    }

    return (
      <div className="absolute bottom-6 left-1/2 h-5 w-12 -translate-x-1/2 rounded-t-full border-t-4 border-slate-800" />
    );
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className={`relative h-28 w-28 rounded-full border-4 bg-gradient-to-b ${faceTone} shadow-lg ring-4 ${ringTone} transition-all duration-300 ${
          isBurnedOut ? "animate-pulse" : ""
        }`}
      >
        {/* Gloss highlight */}
        <div className="absolute left-4 top-3 h-8 w-10 rounded-full bg-white/40 blur-sm" />

        {/* Eyes */}
        {!isBurnedOut ? (
          <>
            <div className="absolute left-7 top-10 flex items-center justify-center">
              {renderEye()}
            </div>
            <div className="absolute right-7 top-10 flex items-center justify-center">
              {renderEye()}
            </div>
          </>
        ) : (
          <>
            <div className="absolute left-6 top-9 text-2xl font-bold text-slate-700">
              ×
            </div>
            <div className="absolute right-6 top-9 text-2xl font-bold text-slate-700">
              ×
            </div>
          </>
        )}

        {/* Eyebrows */}
        {!isCalm && (
          <>
            <div
              className={`absolute left-5 top-7 h-1 w-7 rounded-full bg-slate-700 ${
                isAnnoyed || isOverworked || isBurnedOut
                  ? "-rotate-12"
                  : "-rotate-6"
              }`}
            />
            <div
              className={`absolute right-5 top-7 h-1 w-7 rounded-full bg-slate-700 ${
                isAnnoyed || isOverworked || isBurnedOut
                  ? "rotate-12"
                  : "rotate-6"
              }`}
            />
          </>
        )}

        {/* Blush cheeks */}
        {(isCalm || isPressured) && (
          <>
            <div className="absolute left-4 top-[58px] h-3 w-4 rounded-full bg-pink-300/50 blur-[1px]" />
            <div className="absolute right-4 top-[58px] h-3 w-4 rounded-full bg-pink-300/50 blur-[1px]" />
          </>
        )}

        {/* Mouth */}
        {loading ? renderLoadingMouth() : renderNormalMouth()}

        {/* Sweat */}
        {isOverworked && (
          <div className="absolute -right-1 top-7 text-xl">💧</div>
        )}

        {/* Burnout symbols */}
        {isBurnedOut && (
          <>
            <div className="absolute -top-1 right-1 text-lg">⚠️</div>
            <div className="absolute -left-1 bottom-4 text-base">💢</div>
          </>
        )}
      </div>

      <div className="min-w-[120px]">
        <p className="text-sm text-gray-500">Mood</p>
        <p className="text-base font-semibold text-gray-800">{mood}</p>
        {loading && (
          <p className="text-xs text-gray-500 mt-1">Thinking...</p>
        )}
      </div>
    </div>
  );
}