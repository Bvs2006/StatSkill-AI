import React, { useState, useEffect } from "react";
import { chatWithAITutor } from "../../services/aiService";
import { AIResponseMessage } from "../AIResponseMessage";

interface AITutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  topicTitle: string;
  activeSlideTitle?: string;
  activeSlideContent?: {
    key_points?: string[];
    explanation?: string;
    example?: string;
  };
}

export function AITutorDrawer({
  isOpen,
  onClose,
  courseTitle,
  topicTitle,
  activeSlideTitle,
  activeSlideContent,
}: AITutorDrawerProps) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync initial message with current topic/slide
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        text: `🎓 **Welcome to AI Lecture Tutoring!**\n\nI am your interactive tutor for **${topicTitle}**${activeSlideTitle ? ` (Slide: *${activeSlideTitle}*)` : ""}.\n\nAsk me to break down formulas, explain concepts in simple terms, provide sample Python code, or walk through real MoSPI survey examples!`,
      },
    ]);
  }, [topicTitle, activeSlideTitle]);

  if (!isOpen) return null;

  async function handleSend(textToSend?: string) {
    const text = (textToSend || input).trim();
    if (!text || loading) return;
    setInput("");
    const newHistory = [...messages, { role: "user" as const, text }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const reply = await chatWithAITutor(
        newHistory,
        {
          courseTitle,
          topicTitle,
          activeSlideTitle,
          activeSlideContent,
        }
      );
      setMessages((p) => [...p, { role: "assistant", text: reply.text }]);
    } catch {
      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          text: `In **${topicTitle}**, standard MoSPI methodologies ensure computational consistency across state directorates. Feel free to click any of the prompt chips above for an instant explanation.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-[#0B3D66] text-white flex justify-between items-center shadow-xs">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Contextual AI Lecture Tutor</span>
            </div>
            <h3 className="text-xs font-bold truncate max-w-[260px] sm:max-w-[280px] mt-0.5">{topicTitle}</h3>
            {activeSlideTitle && (
              <p className="text-[10px] text-white/70 truncate max-w-[260px] sm:max-w-[280px]">Slide: {activeSlideTitle}</p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition-colors cursor-pointer">
            ✕
          </button>
        </div>

        {/* Suggested In-Lecture Prompts */}
        <div className="p-3 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-1.5 text-[11px]">
          {[
            "Explain this slide simply",
            "Give a real MoSPI survey example",
            "Break down the mathematical formula",
            "Provide sample Python code",
            "Quick concept quiz check",
          ].map((p) => (
            <button
              key={p}
              onClick={() => handleSend(p)}
              className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-[#0B3D66] hover:text-[#0B3D66] shadow-2xs transition-all cursor-pointer text-left text-[10px] sm:text-[11px]"
            >
              💡 {p}
            </button>
          ))}
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F7F9FB] text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 max-w-[92%] ${
                m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  m.role === "user"
                    ? "bg-[#FF7A00] text-white"
                    : "bg-[#0B3D66] text-amber-300"
                }`}
              >
                {m.role === "user" ? "👤" : "🎓"}
              </div>

              <div
                className={`p-3.5 rounded-2xl ${
                  m.role === "user"
                    ? "bg-[#0B3D66] text-white rounded-tr-none"
                    : "bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-2xs w-full"
                }`}
              >
                {m.role === "user" ? (
                  m.text
                ) : (
                  <AIResponseMessage content={m.text} />
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-gray-400 text-xs italic p-2.5 bg-white/80 rounded-xl max-w-[240px]">
              <span className="w-2 h-2 rounded-full bg-[#FF7A00] animate-ping" />
              <span>AI Tutor reviewing lecture context...</span>
            </div>
          )}
        </div>

        {/* Input Box */}
        <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Ask about ${activeSlideTitle || topicTitle}...`}
            className="flex-1 px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0B3D66]"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading}
            className="px-4 py-2.5 bg-[#FF7A00] text-white text-xs font-bold rounded-xl hover:bg-[#e06a00] cursor-pointer disabled:opacity-50"
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}
