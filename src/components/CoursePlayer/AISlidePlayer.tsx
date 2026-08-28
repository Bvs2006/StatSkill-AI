import React, { useState, useEffect, useRef } from "react";

export interface AISlide {
  slide_number: number;
  title: string;
  key_points: string[];
  explanation: string;
  example?: string;
}

export interface LectureSegment {
  slide_number: number;
  start_time: number;
  end_time: number;
  narration_text: string;
}

interface AISlidePlayerProps {
  slides: AISlide[];
  segments?: LectureSegment[];
  currentSlide: number;
  onSlideChange: (slideNum: number) => void;
  onCompleteTopic?: () => void;
}

export function AISlidePlayer({
  slides,
  segments = [],
  currentSlide,
  onSlideChange,
  onCompleteTopic,
}: AISlidePlayerProps) {
  const [activeIdx, setActiveIdx] = useState(Math.max(0, currentSlide - 1));
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      setSpeechAvailable(true);
    }
  }, []);

  const slide = slides[activeIdx] || slides[0];

  function speakNarration(text: string) {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlaying(false);
    synthRef.current.speak(utterance);
    setIsPlaying(true);
  }

  function handlePlayPause() {
    if (isPlaying) {
      synthRef.current?.cancel();
      setIsPlaying(false);
    } else {
      const seg = segments.find((s) => s.slide_number === slide.slide_number);
      const textToSpeak = seg ? seg.narration_text : `${slide.title}. ${slide.explanation}. Key points: ${slide.key_points.join(", ")}`;
      speakNarration(textToSpeak);
    }
  }

  function goToSlide(idx: number) {
    const validIdx = Math.max(0, Math.min(slides.length - 1, idx));
    setActiveIdx(validIdx);
    onSlideChange(validIdx + 1);
    synthRef.current?.cancel();
    setIsPlaying(false);
  }

  return (
    <div className="space-y-4">
      {/* Slide Canvas */}
      <div className="bg-gradient-to-br from-[#0B3D66] via-[#092B48] to-[#1E293B] text-white rounded-3xl p-6 md:p-8 min-h-[360px] flex flex-col justify-between shadow-xl border border-white/10 relative overflow-hidden">
        {/* Slide Header */}
        <div className="flex justify-between items-center pb-3 border-b border-white/10">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-md text-amber-300">
            Slide {slide.slide_number} of {slides.length}
          </span>
          <span className="text-xs text-white/70 font-mono">AI Interactive Lecture</span>
        </div>

        {/* Slide Body */}
        <div className="py-4 space-y-4">
          <h2 className="text-xl md:text-2xl font-bold font-serif text-white">{slide.title}</h2>

          <ul className="space-y-2 text-xs md:text-sm text-white/90">
            {slide.key_points.map((pt, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="text-[#FF7A00] font-bold text-base leading-none">•</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>

          <div className="p-3 bg-white/10 rounded-2xl text-xs text-white/80 leading-relaxed border border-white/10">
            <strong className="text-amber-300">Explanation: </strong>
            {slide.explanation}
          </div>

          {slide.example && (
            <div className="p-2.5 bg-emerald-950/40 rounded-xl text-[11px] text-emerald-300 border border-emerald-500/20 font-mono">
              <strong>Official Example:</strong> {slide.example}
            </div>
          )}
        </div>

        {/* Audio Narration Bar */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-4">
          <button
            onClick={handlePlayPause}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF7A00] hover:bg-[#e06a00] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <span>{isPlaying ? "⏸️ Pause Narration" : "🔊 AI Tutor Voice Narration"}</span>
          </button>
          <span className="text-[10px] text-white/60">
            {isPlaying ? "Speaking slide explanation..." : "Click to hear AI lecture voice"}
          </span>
        </div>
      </div>

      {/* Slide Navigation Controls */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex justify-between items-center text-xs">
        <button
          onClick={() => goToSlide(activeIdx - 1)}
          disabled={activeIdx === 0}
          className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl disabled:opacity-30 cursor-pointer"
        >
          ← Previous Slide
        </button>

        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                activeIdx === i
                  ? "bg-[#0B3D66] text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {activeIdx === slides.length - 1 ? (
          <button
            onClick={onCompleteTopic}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
          >
            Take Topic Quiz →
          </button>
        ) : (
          <button
            onClick={() => goToSlide(activeIdx + 1)}
            className="px-4 py-2 bg-[#0B3D66] text-white font-bold rounded-xl hover:bg-[#082e4f] cursor-pointer"
          >
            Next Slide →
          </button>
        )}
      </div>
    </div>
  );
}
